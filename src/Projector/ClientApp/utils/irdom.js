import * as _ from 'lodash';
import { render } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import guid from '~/utils/guid';
import { flatten, combine } from '~/utils/objectUtils';
import { TYPES, typeOf } from '~/utils/convert';
import { GLOBAL_GROUP } from '~/reducers/resources';

let Babel = null;
if (typeof window !== 'undefined') {
  Babel = require('babel-standalone');
}

/**
 * Equal to "data-irdom-id". 
 * All IRNodes have this attribute.
 */
export const IRDOM_ID_ATTR = "data-irdom-id";

export function create(config) {
  if (config.component) {
    if (config.component === '#text') {
      return createTextNode(config.props.text);
    } else {
      return createComponent(config.component, config.props, config.isRef);
    }
  } else if (typeof config.text === 'string') {
    return createTextNode(config.text);
  } else {
    throw new Error('Invalid argument!');
  }
}

export function createComponent(component, props = {}, isRef = false) {
  return {
    id: guid(),
    component: component,
    isRef: isRef,
    props: props,
    parent: null,
    children: [],
  };
}

export function deserialize(object) {
  const node = create(object);
  if (object.children) {
    for (const child of object.children) {
      const childNode = deserialize(child);
      childNode.parent = node.id;
      node.children.push(childNode);
    }
  }
  return node;
}

export function serialize(node) {
  const object = {
    component: node.component,
    props: node.props,
    isRef: node.isRef,
  };
  if (node.children) {
    object.children = [];
    for (const childNode of node.children) {
      const child = serialize(childNode);
      object.children.push(child);
    }
  }
  return object;
}

export function createTextNode(text) {
  return createComponent('#text', { text: typeof text === 'string' ? { type: TYPES.STRING, value: text } : text });
}

export function cloneNode(node) {
  if (node.text) {
    return createTextNode(node.text);
  } else {
    return createComponent(node.component, node.props, node.isRef);
  }
}

function rebindChildrenDeep(node) {
  for (const child of node.children) {
    child.parent = node;
    if (child.children) {
      for (const subchild of child.children) {
        rebindChildrenDeep(subchild);
      } 
    }
  }
}

export function cloneNodeDeep(node) {
  if (node.text) {
    return createTextNode(node.text);
  } else {
    const clone = Object.assign({}, node, { id: guid() });
    clone.children = clone.children.map(cloneNodeDeep);
    return clone;
  }
}

export function isComponent(node) {
  return typeof node.component === 'string'
    && typeof node.id === 'string'
    && typeof node.props === 'object';
}

export function isTextNode(node) {
  return node.component === '#text'
    && typeof node.id === 'string'
}

/** 
 * Find a node by ID in an node tree.
 */
export function getNodeById(id, rootNode) {
  const queue = [rootNode];
  if (rootNode.id === id) {
    return rootNode;
  }
  while (queue.length > 0) {
    const current = queue.shift();
    if (current.children) {
      for (const child of current.children) {
        if (child.id === id) {
          return child;
        }
        queue.push(child);
      }
    }
  }
  throw new Error('No such node found!');
}

function skipIndex(array, index) {
  const newArray = new Array(array.length - 1);
  for (let i = 0; i < array.length; i++) {
    if (i < index) {
      newArray[i] = array[i];
    } else if (i > index) {
      newArray[i - 1] = array[i];
    }
  }
  return newArray;
}

export function detachFromParent(nodeId, rootNode) {
  const node = getNodeById(nodeId, rootNode);
  const parent = node.parent;
  const children = parent.children;
  const index = children.findIndex(x => x.id === node.id);
  const newChildren = skipIndex(children, index);
  const newParent = Object.assign({}, parent);
  newParent.children = newChildren;
  return patchNode(newParent, rootNode);
}

export function moveChild(nodeId, newIndex, rootNode) {
  const node = getNodeById(nodeId, rootNode);
  const parent = getNodeById(node.parent, rootNode);
  const children = parent.children;
  const index = children.findIndex(x => x.id === node.id);
  const newChildren = skipIndex(children.slice(), index);
  newChildren.splice(index, 0, node);
  const newParent = Object.assign({}, parent);
  newParent.children = newChildren;
  return patchNode(newParent, rootNode);
}

export function addChild(parentId, child, rootNode) {
  const parent = getNodeById(parentId, rootNode);
  const children = parent.children;
  const newChildren = children.concat([Object.assign({}, child, { parent: parent.id })]);
  const newParent = Object.assign({}, parent);
  newParent.children = newChildren;
  return patchNode(newParent, rootNode);
}

export function getChildrenById(nodeId, rootNode) {
  return getNodeById(nodeId, rootNode).children;
}

export function removeNodeById(nodeId, rootNode) {
  const node = getNodeById(nodeId, rootNode);
  const parent = getNodeById(node.parent, rootNode);
  const children = parent.children;
  const index = children.findIndex(x => x.id === node.id);
  if (index === -1) {
    throw new Error("Could not determine the index of the child to be removed.");
  }
  const newChildren = skipIndex(children, index);
  const newParent = Object.assign({}, parent);
  newParent.children = newChildren;
  return patchNode(newParent, rootNode);
}

export function fromXML(code) {
  const doc = (new DOMParser()).parseFromString(code, 'text/xml');
  const nodes = fromDOM(doc.firstChild);
}

function fromDOMNode(node) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const attrs = node.attributes;
    const props = {};
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      props[attr.name] = attr.value;
    }
    return createComponent(node.tagName.toLowerCase(), props, false);
  } else if (node.nodeType === Node.TEXT_NODE) {
    return createTextNode(node.textContent);
  }
}

/**
 * @param {Node} root
 * aodkasodoaidoiasdoiaoisdoiadioaisodiaoisdoaidoiasodi
 */
function fromDOM(root) {
  const nodes = [];
  const irRoot = fromDOMNode(root);
  for (var i = 0; i < root.childNodes.length; i++) {
    const node = root.childNodes[i];
    nodes.push([root, fromDOMNode(node)]);
  }
}

export function patchNode(nodeV2, rootNode) {
  if (nodeV2.id == rootNode.id) {
    return nodeV2;
  }
  const parent = getNodeById(nodeV2.parent, rootNode);
  const children = parent.children;
  const newParent = Object.assign({}, parent);
  const newChildren = children.map(child => child.id === nodeV2.id
    ? nodeV2
    : child);
  newParent.children = newChildren;
  return patchNode(newParent, rootNode);
}

export function getRootNode(rootNode) {
  return rootNode;
}

const DASH_GLOBAL_REGEX = /-/g;
const SPACE_GLOBAL_REGEX = / /g;

function moduleCase(name) {
  return _.startCase(_.kebabCase('material-ui').replace(DASH_GLOBAL_REGEX, ' ')).replace(SPACE_GLOBAL_REGEX, '');
}

export function getNodeCreateCode(node, rootNode, preserveId = false) {
  if (node.component === '#text') {
    let span = createComponent('span', Object.assign({}, node.props, {
      dangerouslySetInnerHTML: { type: TYPES.OBJECT, value: { __html: node.props.text } }
    }));
    delete span.props.text;
    span.id = node.id;
    return getNodeCreateCode(span, null, preserveId);
  }

  if (node.component.indexOf('@') !== -1) {
    let pkg = node.component.substr(1).split('.', 1)[0];
    let selector = node.component.length > 2 + pkg.length ? node.component.substr(2 + pkg.length) : null;
    let componentTag = selector ? moduleCase(pkg) + selector : moduleCase(pkg) + '.default';
    let newNode = createComponent(componentTag, node.props);
    newNode.id = node.id;
    return getNodeCreateCode(newNode, rootNode, preserveId);
  }

  let type = !node.isRef ? `"${node.component}"` : node.component;

  let props = null;
  if (preserveId) {
    props = getJSONWithRawEscape({ type: TYPES.OBJECT, value: Object.assign({}, node.props, { [IRDOM_ID_ATTR]: { type: TYPES.STRING, value: node.id } }) });
  } else {
    props = getJSONWithRawEscape({ type: TYPES.OBJECT, value: node.props });
  }

  let children = rootNode ? node.children
    .map(x => `(${getNodeCreateCode(x, rootNode, preserveId)})`)
    : [];

  let args = [type, props, ...children];
  let createElementCall = `React.createElement(${args.join(',')})`;
  return createElementCall;
}

export function getJSONWithRawEscape(value) {
  if (typeof value !== 'object') {
    return JSON.stringify(value);
  } else if (value === null) {
    return 'null';
  }

  switch (value.type) {
    case TYPES.NUMBER:
      var number = value.value;
      return number.toString();
    case TYPES.BOOLEAN:
      var boolean = value.value;
      return boolean ? 'true' : 'false';
    case TYPES.STRING:
      var string = value.value;
      return JSON.stringify(string);
    case TYPES.OBJECT:
      var object = value.value;
      return `{${Object.keys(object)
        .map(key => `"${key}":${getJSONWithRawEscape(object[key])}`)
        .join(',')}}`;
    case TYPES.ARRAY:
      var array = value.value;
      return `{${array
        .map((x, i) => `${i}:${getJSONWithRawEscape(x)}`)
        .join(',')}}`;
    case TYPES.DYNAMIC:
      var code = value.value;
      return parseShorthandSyntax(extractJsFromRaw(code));
    case TYPES.COLOR:
      var rgba = value.value;
      return JSON.stringify(rgba);
    case TYPES.NULL:
      return 'null';
    case TYPES.STYLE: 
      var styles = value.value;
      return JSON.stringify(styles);
    default:
      return 'null';
  }
}

export function getDependencyCodeFromCompnent(component) {
  let defaultProps = deserializeComponentDefaults(component.defaultProps);
  let initialState = deserializeComponentDefaults(component.initialState);
  let rootNode = combine(getRootNode(component.nodes), { props: { [IRDOM_ID_ATTR]: { type: TYPES.DYNAMIC, value: `this.props["${IRDOM_ID_ATTR}"]` } } });
  let createCode = getNodeCreateCode(rootNode, component.nodes, false);
  let depCode = `var ${component.name} = (self.__CW_COMPONENTS__ || (self.__CW_COMPONENTS__ = {})).${component.name} = (${createComponentClassCode(createCode, component.name, defaultProps, initialState)})`;
  return depCode;
}

export function deserializeComponentDefaults(defaults) {
  const dest = {};
  for (let def of defaults) {
    let value = JSON.parse(def.value);
    dest[def.name] = { type: typeOf(value), value: value };
  }
  return dest;
}

const RAW_OPEN = '{ir_raw{';
const RAW_CLOSE = '}war_ri}';

function espaceJSON(val) {
  return val
    .replace(/\b/g, '\\b')
    .replace(/\f/g, '\\f')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\\/, '\\\\')
    .replace(/\"/, '\\"')
    .replace(/\\/, '\\\\');
}

function createJSON(obj) {
  let type = typeof obj;
  if (type === 'object') {
    if (obj === null) return 'null';
    let props = [];
    for (let key in obj) {
      let val = obj[key];
      if (typeof val === 'string' && isRawJs(val)) {
        val = `${parseShorthandSyntax(extractJsFromRaw(val))}`;
      } else if (typeof val === 'object') {
        val = createJSON(val);
      } else {
        val = JSON.stringify(val);
      }
      props.push(`${key}: ${val}`);
    }
    return '{' + props.join(',') + '}'
  } else if (type === 'string' && isRawJs(obj)) {
    return parseShorthandSyntax(extractJsFromRaw(obj));
  } else {
    return JSON.stringify(obj);
  }
}

/**
 * Create a new string, which will be injected as code.
 * @param {string} code - The JS code which will be injected.
 * @returns {string}
 */
export function rawJs(code) {
  return `${RAW_OPEN}${code}${RAW_CLOSE}`;
}

export function isRawJs(s) {
  return s.indexOf(RAW_OPEN) === 0 && s.lastIndexOf(RAW_CLOSE) === s.length - RAW_CLOSE.length;
}

const RAW_OPEN_REGEX = new RegExp(RAW_OPEN, 'g');
const RAW_CLOSE_REGEX = new RegExp(RAW_CLOSE, 'g');

const RAW_OPEN_Q_REGEX = new RegExp('"' + RAW_OPEN, 'g');
const RAW_CLOSE_Q_REGEX = new RegExp(RAW_CLOSE + '"', 'g');

function replaceIfNotPrecededBy(notPrecededBy, replacement) {
  return function (match) {
    return match.slice(0, notPrecededBy.length) === notPrecededBy
      ? match
      : replacement;
  }
};

function parseEventSyntax(s) {
  s = s
    .replace('#event#', '');
  let code =
    `(function() { 
  var __CW_INTERNAL_EVENT__ = arguments[0];
  var __CW_INTERNAL_TARGET__ = null;
  var __CW_INTERNAL_VALUE__ = null;
  if (__CW_INTERNAL_EVENT__ != null && __CW_INTERNAL_EVENT__.target != null && __CW_INTERNAL_EVENT__.target instanceof HTMLElement) { 
    __CW_INTERNAL_TARGET__ = __CW_INTERNAL_EVENT__.target; 
    if (__CW_INTERNAL_TARGET__) { 
      __CW_INTERNAL_VALUE__ = __CW_INTERNAL_TARGET__.value; 
    } 
  } else {
    __CW_INTERNAL_EVENT__ = null;
  }
  ${s};
})`
      .replace(/@event/g, replaceIfNotPrecededBy("\\", "(__CW_INTERNAL_EVENT__)"))
      .replace(/@target/g, replaceIfNotPrecededBy("\\", "(__CW_INTERNAL_TARGET__)"))
      .replace(/@value/g, replaceIfNotPrecededBy("\\", "(__CW_INTERNAL_VALUE__)"));
  return code;
}

function getProjectId() {
  return window.__STORE.getState().project.id;
}

function parseShorthandSyntax(s) {
  let result = s;
  if (s.trimLeft().indexOf('#event#') === 0) {
    result = parseEventSyntax(result);
  }
  result = result
    .replace(/@state/g, replaceIfNotPrecededBy("\\", "(__CW_INTERNAL_STATE_PROXY__)"))
    .replace(/@props/g, replaceIfNotPrecededBy("\\", "(__CW_INTERNAL_SELF__.props)"))
    .replace(/@LOCAL/g, replaceIfNotPrecededBy("\\", "(__CW_RESOURCES__[__CW_SELF_NAME__])"))
    .replace(/@FILES\((.*)\)/g, `(${JSON.stringify(location.origin + `/api/userfiles/${getProjectId()}/read/`)} + encodeURIComponent($1))`)
    .replace(/@GLOBAL/g, replaceIfNotPrecededBy("\\", `(__CW_RESOURCES__["${GLOBAL_GROUP}"])`));
  return result;
}

export function extractJsFromRaw(s) {
  return s
    .replace(RAW_OPEN_REGEX, '')
    .replace(RAW_CLOSE_REGEX, '');
}

function parseJsFromJson(s) {
  if (typeof s !== 'string') throw new TypeError();
  let open = s.match(RAW_OPEN_Q_REGEX);
  let close = s.match(RAW_CLOSE_Q_REGEX);
  if (open && close) {
    for (let i = 0; i < open.length; i++) {
      let js = s.substring(open.index, close.index);
      debugger;
    }
  }
}

/**
 * Render JSX code into a DOM node.
 * @param {Node} elem - The Node in which the JSX will be rendered.
 * @param {string} code - The JSX code which will be rendered.
 * @returns {Object} context - The context of the component.
 */
export function renderReactElement(elem, reactElem, useDynamicRenderer = false) {
  if (!useDynamicRenderer) {
    return renderStatic(elem, reactElem);
  } else {
    return renderDynamic(elem, reactElem);
  }
}

export function createComponentClassCode(es5, name, defaultProps = {}, initialState = {}, beforeRender = '') {
  const errorBlockStyle = JSON.stringify({
    background: 'rgb(255,240,240)',
    color: 'rgb(255,59,59)',
    fontFamily: 'Consolas, Menlo, Monaco, "Courier New", monospace',
    fontSize: '16px',
    lineHeight: '20px',
    padding: '4px 8px',
    borderTop: '1px solid rgb(255,215,215)',
    borderBottom: '1px solid rgb(255,215,215)',
  });

  return `React.createClass({
  getDefaultProps: function() { return ${getJSONWithRawEscape({ type: TYPES.OBJECT, value: defaultProps })}; },
  getInitialState: function() { return ${getJSONWithRawEscape({ type: TYPES.OBJECT, value: initialState })}; },
  render: function() {
    ${beforeRender};
    var __CW_SELF_NAME__ = "${name}"; 
    var __CW_INTERNAL_SELF__ = this; 
    var __CW_INTERNAL_STATE_PROXY__ = (function() {
      var proxy = {};
      var newState = Object.assign({}, __CW_INTERNAL_SELF__.state);
      var timeoutHandle = null;
      var registerKey = (function(key) {
        Object.defineProperty(proxy, key, {
          get: function() {
            return newState[key];
          },
          set: function(value) {
            newState[key] = value;
            if (timeoutHandle === null) {
              clearTimeout(timeoutHandle);
            }
            timeoutHandle = setTimeout(function() {
              __CW_INTERNAL_SELF__.setState(newState);
            }, 0);
          },
        });
      });
      for (var key in newState) {
        registerKey(key);
      }
      return proxy;
    })();
    try {
      return (${es5});
    } catch (e) {
      return React.createElement(
        'div', 
        { style: ${errorBlockStyle} }, 
        '"' + __CW_SELF_NAME__ + '" failed: ', 
        React.createElement('div', { style: { paddingLeft: '24px' } } ,  e.name + ': ' + e.message)
      );
    }
  },
})`;
}

export function parseReactElement(es5, name, context, defaultProps = {}, initialState = {}, depCode = '', global = window) {
  const componentClassCode = createComponentClassCode(es5, name, defaultProps, initialState);
  const fnBody = `
    ${depCode};
    return React.createElement(${componentClassCode});
  `;
  const evalReactElement = new Function('__CW_RESOURCES__', fnBody);
  return evalReactElement.call(global, context);
}

function renderStatic(elem, reactElem) {
  const containerTag = typeof HTMLTemplateElement !== 'undefined' ? 'template' : 'div';
  const html = renderToStaticMarkup(reactElem);
  const container = document.createElement('div');
  container.innerHTML = `<${containerTag}>${html}</${containerTag}>`;
  const newElem = containerTag === 'template' ? container.firstChild.content.firstChild : container.firstChild.firstChild;
  elem.parentElement.replaceChild(newElem, elem);
}

function renderDynamic(elem, reactElem) {
  return render(reactElem, elem.parentElement);
}
