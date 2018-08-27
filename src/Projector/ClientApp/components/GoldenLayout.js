import { PureComponent, PropTypes } from 'react';
import { Provider } from 'react-redux';
import { isEqual } from 'lodash';

let GLNative = null;

if (typeof window !== 'undefined') {
  window.React = require('react');
  window.ReactDOM = require('react-dom');
  GLNative = require('golden-layout');
  require('../../node_modules/golden-layout/src/css/goldenlayout-base.css');
}

export default class GLayout extends PureComponent {

  shouldComponentUpdate(nextProps, nextState) {
    let update = !isEqual(this.props, nextProps);
    return false;
  }

  componentWillUnmount() {
    this.destroyLayout();
  }

  renderLayout() {
    let renderTarget = this.renderTarget;
    switch (this.props.theme) {
      case 'dark':
        require('../../node_modules/golden-layout/src/css/goldenlayout-dark-theme.css');
        break;
      case 'light':
        require('../../node_modules/golden-layout/src/css/goldenlayout-light-theme.css');
        break;
      case 'translucent':
        require('../../node_modules/golden-layout/src/css/goldenlayout-translucent-theme.css');
        break;
      case 'default':
      default:
        require('../../node_modules/golden-layout/src/css/default-theme.css');
        break;
    }

    let config = {
      settings: this.props.settings,
      dimensions: this.props.dimensions,
      labels: this.props.labels,
      content: this.props.content,
    };

    let applyPatch = patchReactComponents.call(this, config.content);
    let layout = new GLNative(config, renderTarget);
    applyPatch(layout);
    this.props.onInit && this.props.onInit(layout);

    layout.init();
    this.gl = layout;
  }

  destroyLayout() {
    this.gl.destroy();
  }

  handleContainerRef(renderTarget) {
    if (!renderTarget) {
      if (this.gl) {
        this.destroyLayout();
      }
      this.renderTarget = null;
    } else {
      this.renderTarget = renderTarget;
      this.renderLayout();
    }
  }

  render() {
    return (
      <div
        ref={this.handleContainerRef.bind(this)}
        className={this.props.className || ''}
        style={this.props.style || { width: '100%', height: '100%' }}
        />
    );
  }

}

GLayout.contextTypes = {
  store: PropTypes.object
};

GLayout.propTypes = {
  onInit: PropTypes.func,
  theme: PropTypes.string,
  settings: PropTypes.object,
  dimensions: PropTypes.object,
  labels: PropTypes.object,
  content: PropTypes.array,
  style: PropTypes.object,
  className: PropTypes.string,
}

let usedCompIds = [];
function randCompName() {
  let id = (Math.random() * 1000000) | 0;
  if (usedCompIds.indexOf(id) === -1) {
    return 'Comp' + id;
  } else {
    return randCompName();
  }
}

function patchReactComponents(content) {
  let comps = [];
  let patches = [];
  for (let i = 0; i < content.length; i++) {
    let comp = content[i];
    if (typeof comp.render !== 'undefined') {
      let name = randCompName();
      content[i] = { title: comp.title, type: 'react-component', component: name, props: {}, height: comp.height, width: comp.width };
      comps.push({ name: name, render: comp.render });
    } else if (comp.content) {
      patches = patches.concat(patchReactComponents.call(this, comp.content));
    }
  }

  let patchRender = null;

  let reduxStore = this.context.store;
  if (reduxStore) {
    patchRender = render => function () {
      return (
        <Provider store={reduxStore}>
          <div style={{ width: '100%', height: '100%' }}>
            {render.call(this)}
          </div>
        </Provider>
      );
    };
  } else {
    patchRender = render => render;
  }

  return (gl) => {
    for (let comp of comps) {
      gl.registerComponent(comp.name, window.React.createClass({ render: patchRender(comp.render) }));
    }
    for (let patch of patches) {
      patch(gl);
    }
  };
}
