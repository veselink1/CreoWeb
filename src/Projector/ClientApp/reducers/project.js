import { combineShallow, keyMirror, throttle, indexOf } from '~/utils/objectUtils';
import { createReducer } from '~/utils/reactUtils';
import editor from './editor';
import { TYPES } from '~/utils/convert';
import * as IR from '~/utils/irdom';
import { editSite, getComponentData, getResourceData } from '~/api/sites';
import { resourcesInterface } from './resources';

const A = {
  ADD_COMPONENT: 'ADD_COMPONENT',
  REMOVE_COMPONENT: 'REMOVE_COMPONENT',
  EDIT_COMPONENT: 'EDIT_COMPONENT',
  SET_PROJECT_ID: 'SET_PROJECT_ID',
  LOAD_PROJECT: 'LOAD_PROJECT',
};

export const getActiveEditor = project => {
  return project.components[project.activeComponentIndex];
}

class ProjectInterface {
  constructor(state, dispatch) {
    this.state = state;
    this.dispatch = dispatch;
  }
  get components() {
    return this.state.components;
  }
  get activeComponentIndex() {
    return this.state.activeComponentIndex;
  }
  get id() {
    return this.state.id;
  }
  get isHosted() {
    return this.state.isHosted;
  }
  get isPublic() {
    return this.state.isPublic;
  }
  get url() {
    return this.state.url;
  }
  async load(projectInfo, componentInfo, activeComponentId) {
    const components = [];
    resourcesInterface(null, null, this.dispatch).resetAll();
    for (const cinfo of componentInfo) {
      const componentId = cinfo.id;
      const componentData = await getComponentData(componentId);
      componentData.name = cinfo.name;
      componentData.isPage = cinfo.isPage == true;
      componentData.id = componentId;
      if (!componentData.nodes) {
        for (let key in initialEditorState) {
          if (Object.prototype.hasOwnProperty.call(initialEditorState, key)) {
            if (!(key in componentData)) {
              componentData[key] = initialEditorState[key];
            }
          }
        }
      }
      // Deserialize the component's nodes.
      componentData.nodes = IR.deserialize(componentData.nodes);
      componentData.activeNodeId = componentData.nodes.id;

      const records = await getResourceData({ componentId: cinfo.id });
      const resources = resourcesInterface(cinfo.name, null, this.dispatch);
      resources.loadRecords(records);
      components.push(componentData);
    }

    const grecords = await getResourceData({ siteId: projectInfo.id });
    const gresources = resourcesInterface(null, null, this.dispatch);
    gresources.loadRecords(grecords);

    this.dispatch({
      type: A.LOAD_PROJECT,
      projectInfo: { 
        id: projectInfo.id, 
        name: projectInfo.name || projectInfo.siteName,  
        isHosted: projectInfo.isHosted,
        isPublic: projectInfo.isPublic,
        url: projectInfo.url,
      }, components, activeComponentId
    });

    setTimeout(() => {
      window.dbHandle.enable();
    }, 800);
  }
  setId(id) {
    this.dispatch({
      type: A.SET_PROJECT_ID,
      id
    });
  }
  getComponents() {
    return this.state.components;
  }
  addComponent(component) {
    this.dispatch({
      type: A.ADD_COMPONENT,
      component
    });
  }
  removeComponent(componentName) {
    this.dispatch({
      type: A.REMOVE_COMPONENT,
      componentName
    })
  }
  editComponent(componentName) {
    this.dispatch({
      type: A.EDIT_COMPONENT,
      componentName
    })
  }
}

const initialEditorState = editor(void 0, {});

const ytVideoPlayer = (function () {
  const nodes = IR.deserialize({
    component: 'div',
    props: {
      style: {
        type: TYPES.OBJECT, value: {
          width: { type: TYPES.DYNAMIC, value: '@props.width' },
          height: { type: TYPES.DYNAMIC, value: '@props.height' },
          maxWidth: { type: TYPES.DYNAMIC, value: '@props.maxWidth' },
          maxHeight: { type: TYPES.DYNAMIC, value: '@props.maxHeight' },
          margin: { type: TYPES.DYNAMIC, value: '@props.margin' },
          backgroundColor: { type: TYPES.STRING, value: '#303030' },
          overflow: { type: TYPES.STRING, value: 'hidden' },
          borderRadius: { type: TYPES.STRING, value: '4px' },
          boxShadow: { type: TYPES.STRING, value: '0px 1px 4px rgba(0, 0, 0, 0.2)' }
        },
      },
    },
    children: [{
      component: 'iframe',
      props: {
        className: { type: TYPES.STRING, value: "yt-player" },
        style: {
          type: TYPES.OBJECT, value: {
            width: { type: TYPES.STRING, value: '100%' },
            height: { type: TYPES.STRING, value: '100%' }
          },
        },
        src: { type: TYPES.DYNAMIC, value: '"https://www.youtube.com/embed/" + @props.video' },
        frameBorder: { type: TYPES.NUMBER, value: 0 },
        allowFullScreen: { type: TYPES.DYNAMIC, value: '@props.allowFullScreen' }
      },
    }]
  });
  return combineShallow(initialEditorState, {
    name: "YouTubePlayer",
    nodes: nodes,
    activeNodeId: nodes.id,
    defaultProps: [
      { name: 'video', type: TYPES.STRING, value: 'iNJdPyoqt8U', isRequired: true },
      { name: 'allowFullScreen', type: TYPES.BOOLEAN, value: true, isRequired: true },
      { name: 'margin', type: TYPES.STRING, value: '16px 0px', isRequired: true },
      { name: 'width', type: TYPES.STRING, value: '100%', isRequired: true },
      { name: 'height', type: TYPES.STRING, value: '100%', isRequired: true },
      { name: 'maxWidth', type: TYPES.STRING, value: '320px', isRequired: true },
      { name: 'maxHeight', type: TYPES.STRING, value: '240px', isRequired: true },
    ],
    initialState: [
      // stateless
    ],
    isPage: false,
  });
}());

const slider = (function () {
  const nodes = IR.deserialize({
    component: 'div',
    props: {
      style: {
        type: TYPES.OBJECT, value: {
          className: { type: TYPES.DYNAMIC, value: '@props.className' },
          style: { type: TYPES.DYNAMIC, value: '@props.style' },
        },
      },
    },
    children: [{
      component: 'label',
      props: {
        className: { type: TYPES.STRING, value: "slider-label" },
      },
      children: [
        { component: '#text', props: { text: { type: TYPES.DYNAMIC, value: '@props.label' } } }
      ],
    }, {
      component: 'input',
      props: {
        className: { type: TYPES.STRING, value: "slider-input" },
        min: { type: TYPES.DYNAMIC, value: '@props.min' },
        max: { type: TYPES.DYNAMIC, value: '@props.max' },
        step: { type: TYPES.DYNAMIC, value: '@props.step' },
        value: { type: TYPES.DYNAMIC, value: '@props.value' },
        onChange: { type: TYPES.DYNAMIC, value: '#event#\n@props.onChange && @props.onChange(@value)' }
      },
    }, {
      component: '#text', props: { text: { type: TYPES.STRING, value: '@props.value + @props.unit' } }
    }]
  });
  return combineShallow(initialEditorState, {
    name: "Slider",
    nodes: nodes,
    activeNodeId: nodes.id,
    defaultProps: [
      { name: 'unit', type: TYPES.STRING, value: '%', isRequired: true },
      { name: 'value', type: TYPES.NUMBER, value: 0, isRequired: true },
      { name: 'min', type: TYPES.NUMBER, value: 0, isRequired: true },
      { name: 'max', type: TYPES.NUMBER, value: 100, isRequired: true },
      { name: 'step', type: TYPES.NUMBER, value: 1, isRequired: true },
      { name: 'label', type: TYPES.STRING, value: 'Percentage', isRequired: true },
    ],
    initialState: [
      // stateless
    ],
    isPage: false,
  });
}());

const initialPageEditorNodes = [[
  { id: IR.ROOT_NODE_ID },
  { component: 'h1', props: { children: { type: TYPES.STRING, value: "Hello, World!" } } }
]];

const defaults = [initialEditorState, ytVideoPlayer];

const initialState = {
  id: null,
  isHosted: false,
  isPublic: false,
  url: null,
  components: [],
  activeComponentIndex: 0,
};

export const projectInterface = (state, dispatch) => new ProjectInterface(state, dispatch);

export default createReducer(initialState, {
  [A.ADD_COMPONENT]: (state, { component }) => {
    if (!component.nodes) {
      component = Object.assign({}, component, {
        nodes: initialEditorState.nodes,
        activeNodeId: initialEditorState.nodes.id,
        defaultProps: [],
        initialState: [],
      });
    }
    return combineShallow(state, {
      components: state.components.concat([component])
    })
  },
  [A.REMOVE_COMPONENT]: (state, { componentName }) => combineShallow(state, {
    components: state.components.filter(x => x.name !== componentName)
  }),
  [A.EDIT_COMPONENT]: (state, { componentName }) => combineShallow(state, {
    activeComponentIndex: indexOf(state.components, x => x.name === componentName)
  }),
  [A.SET_PROJECT_ID]: (state, { id }) => combineShallow(state, {
    id
  }),
  [A.LOAD_PROJECT]: (state, { projectInfo, components, activeComponentId }) => combineShallow(state, {
    id: projectInfo.id,
    isHosted: projectInfo.isHosted,
    isPublic: projectInfo.isPublic,
    url: projectInfo.url,
    name: projectInfo.name,
    components: components,
    activeComponentIndex: components.findIndex(x => x.id === activeComponentId)
  }),
  _: (state, action) => {
    let editorState = getActiveEditor(state);
    let newEditorState = editor(editorState, action);
    if (editorState !== newEditorState) {
      let newComponents = state.components.slice();
      newComponents[state.activeComponentIndex] = newEditorState;
      return combineShallow(state, {
        components: newComponents
      });
    }
    return state;
  }
});
