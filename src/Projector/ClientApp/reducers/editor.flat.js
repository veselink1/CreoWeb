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
  get activeNodeId() {
    return this.state.activeNodeId;
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
  updatePropData(defaultProps) {
    this.dispatch({ type: A.UPDATE_PROP_DATA, defaultProps });
  }
}

export const editorInterface = (state, dispatch) => new EditorInterface(state, dispatch);

const defaultNodes =
  [
    {
      component: 'div', props: {
        style: {
          type: TYPES.OBJECT, value: {
            background: { value: 'white', type: TYPES.STRING },
            boxShadow: { value: '1px 2px 4px rgba(0,0,0,0.2)', type: TYPES.STRING },
            color: { value: '#444', type: TYPES.STRING },
            fontFamily: { value: 'Arial, Helvetica, sans-serif', type: TYPES.STRING },
            padding: { value: '16px', type: TYPES.STRING },
          },
        },
      }
    },
    { component: 'h1', props: {} },
    { text: { value: IR.rawJs('@LOCAL.INTL[@state.lang || "EN"].WELCOME'), type: TYPES.DYNAMIC } },
    {
      component: 'label', props: {
        htmlFor: { value: 'input-field', type: TYPES.STRING },
        style: {
          type: TYPES.OBJECT, value: {
            display: { value: 'block', type: TYPES.STRING },
            padding: { value: '4px 0px', type: TYPES.STRING },
          },
        },
      }
    },
    { text: { value: IR.rawJs('@LOCAL.INTL[@state.lang || "EN"].LANGUAGE'), type: TYPES.DYNAMIC } },
    {
      component: 'button', props: {
        type: { value: 'button', type: TYPES.STRING },
        className: { value: 'my-button', type: TYPES.STRING },
        onClick: { value: IR.rawJs('#assign#\nlang="EN"'), type: TYPES.DYNAMIC },
      }
    },
    { text: { value: 'EN', type: TYPES.STRING } },
    {
      component: 'button', props: {
        type: { value: 'button', type: TYPES.STRING },
        className: { value: 'my-button', type: TYPES.STRING },
        onClick: { value: IR.rawJs('#assign#\nlang="BG"'), type: TYPES.DYNAMIC },
      }
    },
    { text: { value: 'BG', type: TYPES.STRING } },
  ].map(IR.create);

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

const defaultNodePairs =
  // [parent, child]
  [
    [{ id: IR.ROOT_NODE_ID }, defaultNodes[0]],
    // The title.
    [defaultNodes[0], defaultNodes[1]],
    [defaultNodes[1], defaultNodes[2]],
    // The label.
    [defaultNodes[0], defaultNodes[3]],
    [defaultNodes[3], defaultNodes[4]],
    // The EN Button.
    [defaultNodes[0], defaultNodes[5]],
    [defaultNodes[5], defaultNodes[6]],
    // The BG Button.
    [defaultNodes[0], defaultNodes[7]],
    [defaultNodes[7], defaultNodes[8]],
  ];

// This is the state of the editor.
const initialState = {
  name: "HomePage",
  title: "Untitled",
  description: "No description.",
  isPage: true,
  nodes: defaultNodePairs,
  activeNodeId: IR.getRootNode(defaultNodePairs).id,
  activePropName: null,
  isTesting: false,
  logs: [],
  defaultProps: [
    { name: 'title', type: TYPES.STRING, isRequired: true, value: 'Default Title' },
    { name: 'description', type: TYPES.STRING, isRequired: true, value: 'Default Description' }
  ],
  initialState: [
    // EMPTY
  ],
};

// Export the reducer function,
// which returns the new state based on
// the action type.
const editor = createReducer(initialState, {
  [A.SET_ACTIVE_NODE]: (state, { nodeId }) => combineShallow(state, {
    activeNodeId: nodeId,
    activePropName: null,
  }),
  [A.SET_ACTIVE_PROP]: (state, { propName }) => combineShallow(state, {
    activePropName: propName,
  }),
  [A.PATCH_NODE]: (state, { nodeV2 }) => combineShallow(state, {
    nodes: IR.patchNode(nodeV2, state.nodes),
    isTesting: false,
  }),
  [A.ADD_NODE]: (state, { parentId, node }) => combineShallow(state, {
    nodes: IR.addChild(parentId, node, state.nodes),
    isTesting: false,
  }),
  [A.REMOVE_NODE]: (state, { nodeId }) => combineShallow(state, {
    nodes: IR.removeNodeById(nodeId, state.nodes),
    activeNodeId: IR.getRootNode(state.nodes).id,
    isTesting: false,
  }),
  [A.MOVE_NODE]: (state, { nodeId, newIndex }) => combineShallow(state, {
    nodes: IR.moveChild(nodeId, newIndex, state.nodes),
  }),
  [A.CLONE_NODE]: (state, { nodeId }) => {
    const index = _.findIndex(state.nodes, pair => pair[1].id === nodeId);
    const newNodes = IR.cloneNodeDeep(IR.getNodeById(nodeId, state.nodes), state.nodes);
    if (index === state.nodes.length - 1) {
      return combineShallow(state, {
        nodes: state.nodes.concat(newNodes),
      });
    } else if (index === 0) {
      return combineShallow(state, {
        nodes: newNodes.concat(state.nodes),
      });
    } else {
      const before = state.nodes.slice(0, index);
      const after = state.nodes.slice(index);
      return combineShallow(state, {
        nodes: before.concat(newNodes, after),
      });
    }
  },
  [A.SET_IS_TESTING]: (state, { enabled }) => combineShallow(state, {
    isTesting: enabled,
    activeNodeId: IR.getRootNode(state.nodes).id,
    activePropName: null,
  }),
  [A.SET_ERROR]: (state, { message }) => combineShallow(state, {
    logs: state.logs.concat([{ message, isError: true, timestamp: Date.now() }]),
  }),
  [A.SET_SUCCESS]: (state, { message }) => combineShallow(state, {
    logs: state.logs.concat([{ message, isError: false, timestamp: Date.now() }]),
  }),
  [A.UPDATE_PROP_DATA]: (state, { defaultProps }) => combineShallow(state, {
    defaultProps: defaultProps,
  }),
});

export default editor;
