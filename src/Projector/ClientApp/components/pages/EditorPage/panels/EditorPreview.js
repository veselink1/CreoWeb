import { PureComponent, PropTypes } from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { connect } from 'react-redux';
import { editorInterface } from '~/reducers/editor';
import { projectInterface } from '~/reducers/project';
import { resourcesInterface, GLOBAL_GROUP, RESOURCE_TYPES } from '~/reducers/resources';
import { getActiveEditor } from '~/reducers/project';
import * as IR from '~/utils/irdom';
import { throttle, throttleAsync, cancellable } from '~/utils/objectUtils';
import { defaultForType } from '~/utils/convert';
import classNames from 'classnames';
import antsDataUri from '~/data/ants-data-uri';
import normalizeCSS from '~/data/normalize-css.js';
import deepForceUpdate from 'react-deep-force-update';
import { closest } from '~/utils/domUtils';
import * as pacman from '~/api/pacman';

typeof window !== 'undefined'
  && require('~/styles/editor-preview.scss');

function handleEvalError(error) {
  console.error(error);
}

class EditorPreviewPanel extends PureComponent {

  constructor(props) {
    super(props);
    this.handleFrameRef = this.handleFrameRef.bind(this);
    this.state = { mounted: false };
  }

  async componentDidMount() {
    this.setState({ mounted: true });
    this.renderPreview();
    this.ensureFrameInitHandle = setInterval(async () => {
      if (!isFrameInit(this.frame)) {
        await this.initFrame();
        await this.renderPreview(this.props);
      }
    }, 66);
  }

  componentWillUnmount() {
    clearInterval(this.ensureFrameInitHandle);
  }

  initFrame() {
    let editor = editorInterface(this.props.editor, this.props.dispatch);
    let local = resourcesInterface(editor.name, this.props.resources);
    let global = resourcesInterface(null, this.props.resources);
    let project = projectInterface(this.props.project, this.props.dispatch);
    return initFrame(this.frame, this.props.project.id, () => editorInterface(this.props.editor, this.props.dispatch), project, local, global);
  }

  async renderPreview(props = this.props) {
    if (!isFrameClean(this.frame)) {
      const swap = await this.remount();
      await this.initFrame();
      await this.renderPreview(props);
      await swap();
    }
    if (!isFrameInit(this.frame)) {
      await this.initFrame();
      await this.renderPreview(props);
    }
    let editor = editorInterface(props.editor, this.props.dispatch);
    let resources = {};
    for (let group in props.resources.records) {
      if (Object.prototype.hasOwnProperty.call(props.resources.records, group)) {
        resources[group] = resourcesInterface(group, props.resources);
      }
    }
    let project = projectInterface(props.project, props.dispatch);
    await waitFrameLoad(this.frame);
    let renderTarget = this.frame.contentDocument.body.firstChild;
    if (renderTarget) {
      renderPreview(renderTarget, editor, project, resources);
    } else {
      await this.initFrame();
      await this.renderPreview(props);
    }
  }

  async componentWillReceiveProps(nextProps) {
    if (!this.state.mounted) {
      return;
    }
    if (this.props.editor.isTesting !== nextProps.editor.isTesting) {
      this.props = nextProps;
      const swap = await this.remount();
      await this.initFrame();
      await this.renderPreview(nextProps);
      await swap();
    } else if (this.props.editor.nodes !== nextProps.editor.nodes
      || this.props.resources.records !== nextProps.resources.records) {
      this.props = nextProps;
      await this.renderPreview(nextProps);
    }
  }

  handleFrameRef(frame) {
    if (frame) {
      this.frame = frame;
    }
  }

  remount(transitionTime = 200) {
    const newFrame = document.createElement('iframe');
    newFrame.src = 'about:blank';
    newFrame.style.border = 'none';
    newFrame.style.width = '100%';
    newFrame.style.height = '100%';
    newFrame.style.visibility = 'hidden';
    newFrame.style.opacity = '0';
    newFrame.style.transition = transitionTime / 1000 + 's opacity ease-in-out';
    const parent = this.frame.parentNode;
    const oldFrame = this.frame;
    parent.appendChild(newFrame);
    this.frame = newFrame;
    return async function () {
      await waitFrameLoad(newFrame);
      newFrame.style.visibility = 'visible';
      newFrame.style.opacity = '1';
      setTimeout(function () {
        parent.removeChild(oldFrame);
      }, transitionTime);
    };
  }

  render() {
    return (
      <div className="editor-preview">
        <iframe
          src="about:blank"
          ref={this.handleFrameRef}
          style={{
            border: 'none',
            width: '100%',
            height: '100%'
          }} />
      </div>
    );
  }
}

function getPreviewContext(resources) {
  const context = {};
  for (let key in resources) {
    if (Object.prototype.hasOwnProperty.call(resources, key)) {
      context[key] = resources[key].mapRecordsToObject();
    }
  }
  return context;
}

function isFrameClean(frame) {
  try {
    return frame.contentDocument.defaultView.location.href === 'about:blank';
  } catch (e) {
    return false;
  }
}

function isFrameInit(frame) {
  try {
    return !!frame.contentDocument.body.firstChild;
  } catch (e) {
    return false;
  }
}

const mouseOverClass = 'IRNODE_MOUSEOVER';
const mouseOverParentClass = 'IRNODE_MOUSEOVER_PARENT';
const activeClass = 'IRNODE_ACTIVE';

function injectDefaultStyles(frameDoc) {
  let style = frameDoc.createElement('style');
  style.appendChild(frameDoc.createTextNode(normalizeCSS));
  style.appendChild(frameDoc.createTextNode(`
        html {
          cursor: not-allowed !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        body > * {
          cursor: default !important;
          -webkit-user-select: initial !important;
          -moz-user-select: initial !important;
          -ms-user-select: initial !important;
          user-select: initial !important;
        }
        .IR_IS_EDITING * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          cursor: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPAgMAAABGuH3ZAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlQTFRFAAAAAAAA////g93P0gAAAAF0Uk5TAEDm2GYAAAABYktHRAJmC3xkAAAACW9GRnMAAAAAAAAAAQDDMYePAAAACXBIWXMAAADIAAAAyABj+uetAAAACXZwQWcAAAAgAAAAIACH+pydAAAAGUlEQVQI12NgYGQAAmwEHIQ6soYg83HoAAAk6QD6mQzEXgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNy0wMi0yMFQxMzo0Mzo0NiswMTowMJsl7iUAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTctMDItMjBUMTM6NDM6NDUrMDE6MDDbkEwEAAAAAElFTkSuQmCC') 7 7, crosshair !important;
        }
        .IR_IS_EDITING [${IR.IRDOM_ID_ATTR}]:hover {
          outline: 2px solid rgba(0, 0, 0, 0.4) !important;
          transition: none !important;
        }
        .IR_IS_EDITING .${mouseOverParentClass}[${IR.IRDOM_ID_ATTR}] {
          background-color: rgba(194, 207, 138, 0.8) !important;
          transition: none !important;
        }
        .IR_IS_EDITING .${mouseOverClass}[${IR.IRDOM_ID_ATTR}] {
          background-color: rgba(160, 197, 232, 0.8) !important;
          transition: none !important;
        }
        .IR_IS_EDITING .${activeClass}[${IR.IRDOM_ID_ATTR}] {
          outline: 1px dashed black !important;
          animation-name: IR_ACTIVE_ANIM !important;
          animation-duration: 0.4s !important;
          animation-direction: alternate !important;
          animation-iteration-count: infinite !important;
          animation-timing-function: ease-in-out !important;
        }
        @keyframes IR_ACTIVE_ANIM {
            from {outline-offset: 4px;}
            to {outline-offset: 0px;}
        }
      `));
  frameDoc.head.appendChild(style);
}

async function waitFrameLoad(frame) {
  return new Promise((resolve) => {
    const checkState = () => {
      if (frame.contentDocument && frame.contentDocument.readyState === 'complete') {
        resolve();
      } else {
        setTimeout(checkState, 4);
      }
    };
    setImmediate(checkState);
  });
}

function injectContainer(frame) {
  let appContainer = frame.contentDocument.createElement('div');
  frame.contentDocument.body.innerHTML = '';
  frame.contentDocument.body.appendChild(appContainer);
  return frame.contentDocument.body.firstChild;
}

async function injectPackageBundle(projectId, frame, notifyError) {
  const global = frame.contentWindow;
  const project = projectId;
  try {
    const bundle = await pacman.getBundleAsync(project);
    global.eval.call(global, bundle);
  } catch (e) {
    notifyError("Some external packages are not being loaded.🐦", false);
  }
  console.log("Currently using a static user packages directory! FIX FIX FIX!");
}

function injectPreviewClickHandler(renderTarget, getEditor) {
  renderTarget.onclick = (e) => {
    const editor = getEditor();
    if (editor.isTesting) return true;
    e.preventDefault();
    let irNode = closest(e.target, `[${IR.IRDOM_ID_ATTR}]`);
    if (irNode) {
      let prevIrNode = renderTarget.querySelector('.' + activeClass);
      if (prevIrNode) {
        markNodeInactive(prevIrNode);
      }
      markNodeActive(irNode);
      editor.setActiveNodeId(irNode.getAttribute(IR.IRDOM_ID_ATTR));
    }
    return false;
  };
}

function injectPreviewHoverHandler(renderTarget, editor) {
  let lastMouseEnterTarget = null;
  renderTarget.onmouseenter = renderTarget.onmouseover = (e) => {
    if (lastMouseEnterTarget) markNodeMouseOut(lastMouseEnterTarget);
    if (editor.isTesting) return;
    let irNode = closest(e.target, `[${IR.IRDOM_ID_ATTR}]`);
    if (irNode) {
      markNodeMouseOver(irNode);
      lastMouseEnterTarget = irNode;
    }
  };
  renderTarget.onmouseout = (e) => {
    if (editor.isTesting) return;
    let irNode = closest(e.target, `[${IR.IRDOM_ID_ATTR}]`);
    if (irNode) {
      markNodeMouseOut(irNode);
    }
  };
}

function markNodeMouseOver(node) {
  node.classList.add(mouseOverClass);
  if (node.parentElement) node.parentElement.classList.add(mouseOverParentClass);
}

function markNodeMouseOut(node) {
  node.classList.remove(mouseOverClass);
  if (node.parentElement) node.parentElement.classList.remove(mouseOverParentClass);
}

function markNodeActive(node) {
  node.classList.add(activeClass);
}

function markNodeInactive(node) {
  node.classList.remove(activeClass);
}

async function waitForMs(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitNextTick() {
  return new Promise(resolve => setImmediate(resolve));
}

async function initFrame(frame, projectId, getEditor, components, local, global) {
  if (!frame) {
    return;
  }
  if (!isFrameClean(frame)) {
    return;
  }

  const notifyError = (message, includeJSX = true) => {
    if (includeJSX) {
      const concreteJsx = ''; // IR.getNodeJSX(node, null, false);
      getEditor().setError(message + '\n' + concreteJsx);
    } else {
      getEditor().setError(message);
    }
  };

  await waitFrameLoad(frame);

  const renderTarget = injectContainer(frame);
  injectPreviewClickHandler(renderTarget, getEditor);
  injectPreviewHoverHandler(renderTarget, getEditor);

  await waitNextTick();
  injectDefaultStyles(frame.contentDocument);

  await injectPackageBundle(projectId, frame, notifyError);
}

let _latestRenderQueryTime = 0;

function getES5(node, nodes, editor) {
  return IR.getNodeCreateCode(node, nodes, true);
}

let _dependencyCache = {
  code: '',
  ownerComponentIndex: null,
};

function getDepCode(node, nodes, editor, components) {
  if (_dependencyCache.ownerComponentIndex !== components.activeComponentIndex) {
    let activeCompName = components.components[components.activeComponentIndex].name;
    _dependencyCache.ownerComponentIndex = components.activeComponentIndex;
    _dependencyCache.code = components.components
      .filter(comp => comp.name !== activeCompName)
      .map(comp => {
        const code = IR.getDependencyCodeFromCompnent(comp);
        try {
          new Function(code);
        } catch (e) {
          throw Object.assign(e, { componentName: comp.name });
        }
        return code;
      }).join(';\n');
  }
  return _dependencyCache.code;
}

function prepareResources(resourceObj, global) {
  for (let key in resourceObj) {
    let value = resourceObj[key];
    if (value && value instanceof Function) {
      let js = value();
      let fn = (new global.Function('return ' + js)).bind(global);
      let cache = {
        isDirty: true,
        result: null
      };
      delete resourceObj[key];
      Object.defineProperty(resourceObj, key, {
        get: function () {
          if (cache.isDirty) {
            let result = fn();
            cache.result = result;
            cache.isDirty = false;
            return result;
          } else {
            return cache.result;
          }
        }
      });
    }
  }
}

function injectRequire(global) {
  var cache = Object.create(null);
  global.require = global.__cwuser_require__;
}

function parseReactElement(es5, depCode, editor, resources, frameWindow) {
  let defaultProps = {};
  editor.defaultProps.forEach(x => {
    defaultProps[x.name] = JSON.parse(x.value);
  });
  let initialState = {};
  editor.initialState.forEach(x => {
    initialState[x.name] = JSON.parse(x.value);
  });

  let context = getPreviewContext(resources);
  for (let key in context) {
    if (Object.prototype.hasOwnProperty.call(context, key)) {
      prepareResources(context[key], frameWindow);
    }
  }

  return IR.parseReactElement(es5, editor.name, context, defaultProps, initialState, depCode, frameWindow);
}

function trimOn(s, begin, end) {
  let bIndex = s.indexOf(begin);
  if (bIndex === -1) return s;
  let eIndex = s.indexOf(end, bIndex);
  if (eIndex === -1) return s;
  return s.substring(bIndex + begin.length - 1, eIndex + end.length - 1);
}

const pd = require('pretty-data').pd;

function formatParserErrorMessage(s, jsx) {
  return `${s}\n${pd.xml(jsx)}`;
}

let _wasTesting = false;

function getDepCSS(resources) {
  const cssTextParts = [];
  for (let key in resources) if (Object.prototype.hasOwnProperty.call(resources, key)) {
    const group = resources[key];
    const cssRecords = group.getRecordsByType(RESOURCE_TYPES.CSS);
    const groupCss = Object.keys(cssRecords)
      .map(key => [key, cssRecords[key]])
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(x => x[1].value)
      .join('');
    cssTextParts.push(groupCss);
  }
  return cssTextParts.join('');
}

function injectDepCSS(frameDoc, cssText) {
  let style = frameDoc.getElementById("IR_STYLE_TAG");
  if (!style) {
    style = frameDoc.createElement('style');
    frameDoc.head.appendChild(style);
  }
  style.type = 'text/css';
  style.id = 'IR_STYLE_TAG';
  if (style.styleSheet) {
    style.styleSheet.cssText = cssText;
  } else {
    if (style.firstChild) style.removeChild(style.firstChild);
    style.appendChild(document.createTextNode(cssText));
  }
}

function injectTestingState(renderTarget, editor) {
  if (editor.isTesting) {
    renderTarget.classList.remove('IR_IS_EDITING');
  } else {
    renderTarget.classList.add('IR_IS_EDITING');
  }
}

function renderReactElement(reactElem, name, renderTarget, node, editor) {
  const isTesting = editor.isTesting;
  const childId = node.id === editor.rootNode.id ? null : node.id;
  if (childId === null || childId === IR.ROOT_NODE_ID) {
    if (renderTarget.firstChild && _wasTesting !== editor.isTesting) {
      try {
        unmountComponentAtNode(renderTarget);
      } catch (e) {
        // ignore
      }
    }
    _wasTesting = isTesting;
    renderTarget.innerHTML = "";
    renderTarget.appendChild(document.createElement('div'));
    const mountTarget = renderTarget.firstChild;
    IR.renderReactElement(mountTarget, reactElem, isTesting);
  } else {
    let target = renderTarget.querySelector(`:scope [${IR.IRDOM_ID_ATTR}="${childId}"]`);
    IR.renderReactElement(target, reactElem, isTesting);
  }
}

async function renderPreview(renderTarget, editor, components, resources) {
  const queryTime = Date.now();
  _latestRenderQueryTime = queryTime;
  const shouldContinue = () => _latestRenderQueryTime === queryTime && renderTarget;

  const isTesting = editor.isTesting;
  const node = isTesting ? editor.rootNode : editor.getNodeById(editor.activeNodeId);
  const nodes = editor.nodes;

  const notifyError = (message, includeJSX = true) => {
    if (includeJSX) {
      const concreteJsx = ''; // IR.getNodeJSX(node, null, false);
      editor.setError(message + '\n' + concreteJsx);
    } else {
      editor.setError(message);
    }
  };

  const notifySuccess = message => {
    editor.setSuccess(message);
  };


  await waitNextTick();
  if (!shouldContinue()) return;
  try {
    var es5 = getES5(node, nodes, isTesting);
  } catch (e) {
    notifyError(`Parser error.🐦`);
    handleEvalError(e);
    return;
  }

  await waitNextTick();
  if (!shouldContinue()) return;
  try {
    injectRequire(renderTarget.ownerDocument.defaultView);
  } catch (e) {
    notifyError(e.message, false);
    handleEvalError(e);
    return;
  }

  await waitNextTick();
  if (!shouldContinue()) return;
  try {
    var depCode = getDepCode(node, nodes, editor, components);
  } catch (e) {
    if (e.componentName) {
      notifyError(`Dependency error in "${e.componentName}".🐦`);
    } else {
      notifyError(`Dependency error.🐦`);
    }
    handleEvalError(e);
    return;
  }

  await waitNextTick();
  if (!shouldContinue()) return;
  try {
    var reactElem = parseReactElement(es5, depCode, editor, resources, renderTarget.ownerDocument.defaultView);
  } catch (e) {
    notifyError(`Evaluation error.🐦\n${e.message}`);
    handleEvalError(e);
    return;
  }

  await waitNextTick();
  if (!shouldContinue()) return;
  try {
    renderReactElement(reactElem, name, renderTarget, node, editor);
  } catch (e) {
    // Shallow rendering errors.
  }

  injectTestingState(renderTarget, editor);
  const cssText = getDepCSS(resources);
  injectDepCSS(renderTarget.ownerDocument, cssText);

  notifySuccess('Changes applied successfully.🐶');

}

EditorPreviewPanel.propTypes = {
  onNodeClick: PropTypes.func,
}

export default connect(state => ({ editor: getActiveEditor(state.project), project: state.project, resources: state.resources }))(EditorPreviewPanel);