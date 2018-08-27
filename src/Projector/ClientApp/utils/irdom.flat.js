import * as _ from 'lodash';
import { render } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import guid from '~/utils/guid';
import { flatten, combine } from '~/utils/objectUtils';
import { TYPES } from '~/utils/convert';

let Babel = null;
if (typeof window !== 'undefined') {
  Babel = require('babel-standalone');
}

/**
 * Equal to "data-irdom-id". 
 * All IRNodes have this attribute.
 */
export const IRDOM_ID_ATTR = "data-irdom-id";
export const ROOT_NODE_ID = "ROOT";

export function isRootNode(node) {
  return node.id === ROOT_NODE_ID;
}

export function create(config) {
  if (config.component) {
    return createComponent(config.component, config.props);
  } else {
    return createTextNode(config.text);
  }
}

export function createComponent(component, props = {}, isRef = false) {
  return {
    id: guid(),
    component: component,
    props: props,
    isRef: isRef
  };
}

export function createTextNode(text) {
  return createComponent('#text', { text: typeof text === 'string' ? { type: TYPES.STRING, value: text } : text });
  /*
  return {
    id: guid(),
    text: text,
  };
  */
}

export function cloneNode(node) {
  if (node.text) {
    return createTextNode(node.text);
  } else {
    return createComponent(node.component, node.props, node.isRef);
  }
}

export function cloneNodeDeep(node, nodes) {
  let parent = getPairByChildId(node.id, nodes)[0];
  if (isTextNode(node)) {
    return [[parent, createTextNode(node.props.text.value)]];
  } else {
    let clone = cloneNode(node);
    let children = getChildrenById(node.id, nodes);
    let pair = [parent, clone];
    if (children.length === 0) {
      return [pair];
    } else {
      let childPairs = flatten(children.map(x => cloneNodeDeep(x, nodes)))
        .map(x => [clone, x[1]]);
      return [pair].concat(childPairs);
    }
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
 * Find a node by ID in an nodes matrix.
 */
export function getNodeById(id, nodes) {
  for (let pair of nodes) {
    if (pair[0].id === id) {
      return pair[0];
    } else if (pair[1].id === id) {
      return pair[1];
    }
  }
  throw new Error('No such node found!');
}

export function detachFromParent(nodeId, nodes) {
  return nodes.filter(pair => pair[1].id !== nodeId);
}

function getPairsByParentId(nodeId, nodes) {
  return nodes.filter(pair => pair[0].id === nodeId);
}

export function getPairByChildId(nodeId, nodes) {
  return nodes.find(pair => pair[1].id === nodeId);
}

export function moveChild(nodeId, newIndex, nodes) {
  let childPair = getPairByChildId(nodeId, nodes);
  let children = getPairsByParentId(childPair[0].id, nodes);
  let oldIndex = children.indexOf(childPair);
  let newIndexPair = children[newIndex];
  let newNodes = nodes
    .map(pair => pair === childPair
      ? newIndexPair
      : pair === newIndexPair
        ? childPair : pair);
  if (oldIndex < newIndex) {
    for (let i = oldIndex + 1; i < newIndex; i++) {
      newNodes = moveChild(children[i][1].id, i - 1, newNodes);
    }
  } else {
    for (let i = newIndex + 1; i < oldIndex; i++) {
      newNodes = moveChild(children[i][1].id, i + 1, newNodes);
    }
  }
  return newNodes;
}

export function addChild(parentId, child, nodes) {
  let parent = getNodeById(parentId, nodes);
  return nodes.concat([[parent, child]]);
}

export function getChildrenById(id, nodes) {
  let children = [];
  for (let pair of nodes) {
    if (pair[0].id === id) {
      children.push(pair[1]);
    }
  }
  return children;
}

export function removeNodeById(id, nodes) {
  let newNodes = [];
  let pairsToRemove = markPairsWithNodeAndChildren(id, nodes);
  for (let pair of nodes) {
    let indexInMarked = pairsToRemove.indexOf(pair);
    if (indexInMarked !== -1) {
      pairsToRemove[indexInMarked] = null;
    } else {
      newNodes.push(pair);
    }
  }
  return newNodes;
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

export function markPairsWithNodeAndChildren(id, nodes) {
  let pairsToRemove = [];
  for (let i = 0; i < nodes.length; i++) {
    let pair = nodes[i];
    if (pair[0].id === id) {
      let childPairs = markPairsWithNodeAndChildren(pair[1].id, nodes);
      pairsToRemove = pairsToRemove.concat(childPairs);
    } else if (pair[1].id === id) {
      pairsToRemove.push(pair);
    }
  }
  return pairsToRemove;
}

export function patchNode(nodeV2, nodes) {
  let newNodes = [];
  for (let pair of nodes) {
    if (pair[0].id === nodeV2.id) {
      newNodes.push([nodeV2, pair[1]]);
    } else if (pair[1].id === nodeV2.id) {
      newNodes.push([pair[0], nodeV2]);
    } else {
      newNodes.push(pair);
    }
  }
  return newNodes;
}

export function getRootNode(nodes) {
  for (let pair of nodes) {
    if (pair[0].id === ROOT_NODE_ID) {
      return pair[1];
    }
  }
  throw new Error("Irregular structure detected.");
}

const DASH_GLOBAL_REGEX = /-/g;
const SPACE_GLOBAL_REGEX = / /g;

function moduleCase(name) {
  return _.startCase(_.kebabCase('material-ui').replace(DASH_GLOBAL_REGEX, ' ')).replace(SPACE_GLOBAL_REGEX, '');
}

export function getNodeCreateCode(node, nodes, preserveId = false) {
  if (node.id === ROOT_NODE_ID) {
    let topNode = getChildrenById(ROOT_NODE_ID, nodes)[0];
    return getNodeCreateCode(topNode, nodes, preserveId);
  }

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
    return getNodeCreateCode(newNode, nodes, preserveId);
  }

  let type = !node.isRef ? `"${node.component}"` : node.component;

  let props = null;
  if (preserveId) {
    props = getJSONWithRawEscape({ type: TYPES.OBJECT, value: Object.assign({}, node.props, { [IRDOM_ID_ATTR]: { type: TYPES.STRING, value: node.id } }) });
  } else {
    props = getJSONWithRawEscape({ type: TYPES.OBJECT, value: node.props });
  }

  let children = nodes ? getChildrenById(node.id, nodes)
    .map(x => `(${getNodeCreateCode(x, nodes, preserveId)})`)
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
    case TYPES.NULL:
      return 'null';
    default: 
      throw new Error("Unknown type \"" + value.type + "\".");
  }
}

export function getDependencyCodeFromCompnent(component) {
  let props = {};
  component.defaultProps.forEach(x => {
    props[x.name] = x.value || defaultForType(x.type)
  });
  let rootNode = combine(getRootNode(component.nodes), { props: { [IRDOM_ID_ATTR]: rawJs(`this.props["${IRDOM_ID_ATTR}"]`) } });
  let createCode = getNodeCreateCode(rootNode, component.nodes, false);
  let depCode = `var ${component.name} = (${createComponentClassCode(createCode, component.name, props)})`;
  return depCode;
}

const RAW_OPEN = '{ir_raw{';
const RAW_CLOSE = '}war_ri}';

function espaceJSON(val) {
  return val
    .replace(/\b/g, '\\b')
    .replace(/\f/g, '\\f')
    .repace(/\n/g, '\\n')
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

function parseAssignSyntax(s) {
  let exprs = s
    .replace('#assign#', '')
    .replace(/;/, '\n')
    .split('\n');
  let objInner = exprs
    .filter(expr => {
      expr = expr.trim();
      return expr.length !== 0 // || !(expr[0] === '#' && expr[expr.length - 1] === '#')
    })
    .map(expr => expr.split('=')
      .map(x => {
        if (!x) {
          console.error('Each expression must be in the form "[key] = [value]".');
        }
        return x.trim();
      }))
    .map(([lhs, rhs]) => `${lhs}: ${rhs}`)
    .join(',');
  let code = `(function(_IR_INTERNAL_EVENT_) { if (_IR_INTERNAL_EVENT_) { var _IR_INTERNAL_TARGET_ = _IR_INTERNAL_EVENT_.target; if (_IR_INTERNAL_TARGET_) { var _IR_INTERNAL_VALUE_ = _IR_INTERNAL_TARGET_.value; } } __CW_INTERNAL_SELF__.setState({${objInner}}); })`
    .replace(/@event/g, replaceIfNotPrecededBy("\\", "(_IR_INTERNAL_EVENT_)"))
    .replace(/@target/g, replaceIfNotPrecededBy("\\", "(_IR_INTERNAL_TARGET_)"))
    .replace(/@value/g, replaceIfNotPrecededBy("\\", "(_IR_INTERNAL_VALUE_)"));
  return code;
}

function parseEventSyntax(s) {
  s = s
    .replace('#event#', '');
  let code = `(function(event) { 
    if (event && event.target) {
      var target = event.target;
      if (target.value) {
        var value = target.value;
      }
    }
    ${s} 
    }).bind(this)`;
  return code;
}

function injectInternalSelf(s) {
  return `(function() { var __CW_INTERNAL_SELF__ = this; return ${s}; }).call(this)`
}

function parseBindSyntax(s) {
  s = s
    .replace('#bind#', '');
  let code = `(function() {${s}}).bind(this)`;
  return code;
}

function parseShorthandSyntax(s) {
  let result = s;
  if (s.trimLeft().indexOf('#assign#') === 0) {
    result = parseAssignSyntax(result);
  }
  if (s.trimLeft().indexOf('#event#') === 0) {
    result = parseEventSyntax(result);
  }
  if (s.trimLeft().indexOf('#bind#') === 0) {
    result = parseBindSyntax(result);
  }
  result = result
    .replace(/@state/g, replaceIfNotPrecededBy("\\", "(__CW_INTERNAL_SELF__.state)"))
    .replace(/@props/g, replaceIfNotPrecededBy("\\", "(__CW_INTERNAL_SELF__.props)"))
    .replace(/@LOCAL/g, replaceIfNotPrecededBy("\\", "(__CW_RESOURCES__[__CW_SELF_NAME__])"))
    .replace(/@GLOBAL/g, replaceIfNotPrecededBy("\\", "(__CW_RESOURCES__.GLOBAL)"));
  return injectInternalSelf(result);
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
    renderStatic(elem, reactElem);
  } else {
    return renderDynamic(elem, reactElem);
  }
}

export function createComponentClassCode(es5, name, defaultProps = {}, initialState = {}) {
  return `React.createClass({
      getDefaultProps: function() { return ${getJSONWithRawEscape({ type: TYPES.OBJECT, value: defaultProps })}; },
      getInitialState: function() { return ${getJSONWithRawEscape({ type: TYPES.OBJECT, value: initialState })}; },
      render: function() { var __CW_SELF_NAME__ = "${name}"; return (${es5}); },
    })`;
}

export function parseReactElement(es5, name, context, defaultProps = {}, depCode = '', global = window) {
  const fnBody = `
    ${depCode};
    return React.createElement(${createComponentClassCode(es5, name, defaultProps)});
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
