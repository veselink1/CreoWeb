import * as IR from '~/utils/irdom';
import { combineShallow, combineDeep } from '~/utils/objectUtils';
import { createReducer } from '~/utils/reactUtils';
import { TYPES } from '~/utils/convert';

const A = {
  SET_ACTIVE_NODE: 'SET_ACTIVE_NODE',
  SET_ACTIVE_PROP: 'SET_ACTIVE_PROP',
  PATCH_NODE: 'PATCH_NODE',
  UPDATE_NODE_PROPS: 'UPDATE_NODE_PROPS',
  ADD_NODE: 'ADD_NODE',
  MOVE_NODE: 'MOVE_NODE',
  REMOVE_NODE: 'REMOVE_NODE',
  CLONE_NODE: 'CLONE_NODE',
  SET_IS_TESTING: 'SET_IS_TESTING',
  SET_ERROR: 'SET_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  UPDATE_PROP_DATA: 'UPDATE_COMPONENT_PROPS',
  UPDATE_STATE_DATA: 'UPDATE_STATE_DATA',
  UNDO_EDITOR: 'UNDO_EDITOR',
  REDO_EDITOR: 'REDO_EDITOR',
};

class EditorInterface {
  constructor(state, dispatch) {
    this.state = state;
    this.dispatch = dispatch;
  }
  get rootNode() {
    return IR.getRootNode(this.state.nodes);
  }
  get nodes() {
    return this.state.nodes;
  }
  get defaultProps() {
    return this.state.defaultProps;
  }
  get initialState() {
    return this.state.initialState;
  }
  get activeNodeId() {
    return this.state.activeNodeId;
  }
  get activeNode() {
    return this.getNodeById(this.activeNodeId);
  }
  get activePropName() {
    return this.state.activePropName;
  }
  get isTesting() {
    return this.state.isTesting;
  }
  get logs() {
    return this.state.logs;
  }
  get name() {
    return this.state.name;
  }
  getNodeById(id) {
    return IR.getNodeById(id, this.state.nodes);
  }
  getChildren(nodeId) {
    return IR.getChildrenById(nodeId, this.state.nodes);
  }
  setActiveNodeId(id) {
    this.dispatch({ type: A.SET_ACTIVE_NODE, nodeId: id });
  }
  setActivePropName(propName) {
    this.dispatch({ type: A.SET_ACTIVE_PROP, propName });
  }
  patchNode(newNode) {
    this.dispatch({ type: A.PATCH_NODE, nodeV2: newNode });
  }
  addChildNode(parentId, node) {
    this.dispatch({ type: A.ADD_NODE, node, parentId });
  }
  moveChildNode(nodeId, newIndex) {
    this.dispatch({ type: A.MOVE_NODE, nodeId, newIndex });
  }
  removeNodeById(id) {
    this.dispatch({ type: A.REMOVE_NODE, nodeId: id });
  }
  cloneNode(id) {
    this.dispatch({ type: A.CLONE_NODE, nodeId: id });
  }
  setIsTesting(enabled) {
    this.dispatch({ type: A.SET_IS_TESTING, enabled: enabled === true });
  }
  setError(msg) {
    this.dispatch({ type: A.SET_ERROR, message: msg });
  }
  setSuccess(msg) {
    this.dispatch({ type: A.SET_SUCCESS, message: msg });
  }
  setDefaultProps(defaultProps) {
    this.dispatch({ type: A.UPDATE_PROP_DATA, defaultProps });
  }
  setInitialState(initialState) {
    this.dispatch({ type: A.UPDATE_STATE_DATA, initialState });
  }
  undo() {
    this.dispatch({ type: A.UNDO_EDITOR });
  }
  redo() {
    this.dispatch({ type: A.REDO_EDITOR });
  }
}

export const editorInterface = (state, dispatch) => new EditorInterface(state, dispatch);
/*
  defaultNodes:
    0 => the container div
    1 => the title
    2 => the title's text
    3 => the label
    4 => the label's text
    5 => EN button
    6 => EN button's text
    7 => BG button
    8 => BG button's text
*/

const getDefaultRoot = () => IR.deserialize({
  component: 'div',
  props: {
    className: { type: TYPES.STRING, value: 'home-page' },
    style: {
      type: TYPES.STYLE, value: {
        'background': 'white',
        'box-shadow': '1px 2px 4px rgba(0,0,0,0.2)',
        'color': '#444',
        'font-family': 'Arial, Helvetica, sans-serif',
        'padding': '16px',
        'margin': '8px',
      },
    },
  },
  children: [
    {
      component: 'h1',
      props: {
        className: { type: TYPES.STRING, value: 'welcome-text' },
      },
      children: [
        { component: "#text", props: { text: { type: TYPES.DYNAMIC, value: '@GLOBAL.INTL[@state.lang].WELCOME' } } }
      ],
    },
    {
      component: 'p',
      props: {
        className: { type: TYPES.STRING, value: 'language-text' },
      },
      children: [
        { component: "#text", props: { text: { type: TYPES.DYNAMIC, value: '@GLOBAL.INTL[@state.lang].LANGUAGE' } } }
      ]
    },
    {
      component: 'button',
      props: {
        className: { type: TYPES.DYNAMIC, value: '@state.lang == "EN"\n  ? "my-button selected"\n  : "my-button"' },
        onClick: { type: TYPES.DYNAMIC, value: '#event#\n@state.lang="EN"' }
      },
      children: [
        { component: "#text", props: { text: { type: TYPES.STRING, value: 'EN' } } }
      ]
    },
    {
      component: 'button',
      props: {
        className: { type: TYPES.DYNAMIC, value: '@state.lang == "BG"\n  ? "my-button selected"\n  : "my-button"' },
        onClick: { type: TYPES.DYNAMIC, value: '#event#\n@state.lang="BG"' }
      },
      children: [
        { component: "#text", props: { text: { type: TYPES.STRING, value: 'BG' } } }
      ]
    },
    {
      component: 'button',
      props: {
        className: { type: TYPES.DYNAMIC, value: '@state.lang == "DE"\n  ? "my-button selected"\n  : "my-button"' },
        onClick: { type: TYPES.DYNAMIC, value: '#event#\n@state.lang="DE"' }
      },
      children: [
        { component: "#text", props: { text: { type: TYPES.STRING, value: 'DE' } } }
      ]
    },
    {
      component: 'button',
      props: {
        className: { type: TYPES.DYNAMIC, value: '@state.lang == "RU"\n  ? "my-button selected"\n  : "my-button"' },
        onClick: { type: TYPES.DYNAMIC, value: '#event#\n@state.lang="RU"' }
      },
      children: [
        { component: "#text", props: { text: { type: TYPES.STRING, value: 'RU' } } }
      ]
    },
    {
      component: 'button',
      props: {
        className: { type: TYPES.DYNAMIC, value: '@state.lang == "CH"\n  ? "my-button selected"\n  : "my-button"' },
        onClick: { type: TYPES.DYNAMIC, value: '#event#\n@state.lang="CH"' }
      },
      children: [
        { component: "#text", props: { text: { type: TYPES.STRING, value: 'CH' } } }
      ]
    },
  ]
});

// This is the state of the editor.
const getInitialState = () => {
  const defaultRoot = getDefaultRoot();
  return {
    id: null,
    name: "HomePage",
    title: "Untitled",
    description: "No description.",
    isPage: true,
    nodes: defaultRoot,
    activeNodeId: defaultRoot.id,
    activePropName: null,
    isTesting: false,
    logs: [],
    defaultProps: [

    ],
    initialState: [
      { name: 'lang', value: '"EN"' },
    ],
    timeline: {
      prev: [],
      next: [],
    },
    lastUndoableAction: ''
  };
};

function omit(object, ...keys) {
  const result = {};
  for (const key in object) {
    if (keys.indexOf(key) === -1) {
      result[key] = object[key];
    }
  }
  return result;
}

// Export the reducer function,
// which returns the new state based on
// the action type.
const editor = createReducer(getInitialState(), {
  [A.SET_ACTIVE_NODE]: (state, { nodeId }) => {
    if (!state.isTesting && state.activeNodeId !== nodeId) {
      return combineShallow(state, {
        activeNodeId: nodeId,
        activePropName: null,
      });
    } else {
      return state;
    }
  },
  [A.SET_ACTIVE_PROP]: (state, { propName }) => combineShallow(state, {
    activePropName: propName,
  }),
  [A.PATCH_NODE]: (state, { nodeV2 }) => combineShallow(state, {
    nodes: IR.patchNode(nodeV2, state.nodes),
    isTesting: false,
    timeline: {
      prev: state.timeline.prev.concat([omit(state, 'timeline')]),
      next: state.timeline.next.slice(0, -1),
    },
    lastUndoableAction: A.PATCH_NODE,
  }),
  [A.ADD_NODE]: (state, { parentId, node }) => combineShallow(state, {
    nodes: IR.addChild(parentId, node, state.nodes),
    isTesting: false,
    timeline: {
      prev: state.timeline.prev.concat([omit(state, 'timeline')]),
      next: state.timeline.next.slice(0, -1),
    },
    lastUndoableAction: A.ADD_NODE,
  }),
  [A.REMOVE_NODE]: (state, { nodeId }) => combineShallow(state, {
    nodes: IR.removeNodeById(nodeId, state.nodes),
    activeNodeId: IR.getRootNode(state.nodes).id,
    isTesting: false,
    timeline: {
      prev: state.timeline.prev.concat([omit(state, 'timeline')]),
      next: state.timeline.next.slice(0, -1),
    },
    lastUndoableAction: A.REMOVE_NODE,
  }),
  [A.MOVE_NODE]: (state, { nodeId, newIndex }) => combineShallow(state, {
    nodes: IR.moveChild(nodeId, newIndex, state.nodes),
    timeline: {
      prev: state.timeline.prev.concat([omit(state, 'timeline')]),
      next: state.timeline.next.slice(0, -1),
    },
    lastUndoableAction: A.MOVE_NODE,
  }),
  [A.CLONE_NODE]: (state, { nodeId }) => {
    const originalNode = IR.getNodeById(nodeId, state.nodes);
    const duplicateNode = IR.cloneNodeDeep(originalNode);
    const updatedTree = IR.addChild(originalNode.parent, duplicateNode, state.nodes);
    return combineShallow(state, {
      nodes: updatedTree,
      timeline: {
        prev: state.timeline.prev.concat([omit(state, 'timeline')]),
        next: state.timeline.next.slice(0, -1),
      },
      lastUndoableAction: A.CLONE_NODE,
    });
  },
  [A.SET_IS_TESTING]: (state, { enabled }) => combineShallow(state, {
    isTesting: enabled,
    activeNodeId: IR.getRootNode(state.nodes).id,
    activePropName: null,
  }),
  [A.SET_ERROR]: (state, { message }) => combineShallow(state, {
    logs: (state.logs.length >= 40 ? state.logs.slice(1, 39) : state.logs).concat([{ message, isError: true, timestamp: Date.now() }]),
  }),
  [A.SET_SUCCESS]: (state, { message }) => combineShallow(state, {
    logs: (state.logs.length >= 40 ? state.logs.slice(1, 39) : state.logs).concat([{ message, isError: false, timestamp: Date.now() }]),
  }),
  [A.UPDATE_PROP_DATA]: (state, { defaultProps }) => combineShallow(state, {
    defaultProps: defaultProps,
  }),
  [A.UPDATE_STATE_DATA]: (state, { initialState }) => combineShallow(state, {
    initialState: initialState,
  }),
  [A.REDO_EDITOR]: (state) => combineShallow(state, state.timeline.prev[state.timeline.prev.length - 1], {
    timeline: {
      prev: state.timeline.prev.concat([omit(state, 'timeline')]),
      next: state.timeline.next.slice(0, -1),
    },
  }),
  [A.UNDO_EDITOR]: (state) => combineShallow(state, state.timeline.prev[state.timeline.prev.length - 1], {
    timeline: {
      prev: state.timeline.prev.slice(0, -1),
      next: state.timeline.next.concat([omit(state, 'timeline')]),
    },
  }),
});

export default editor;
