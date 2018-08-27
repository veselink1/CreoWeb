import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IconButton, TextField, FloatingActionButton, Paper } from 'material-ui';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn, TableFooter } from 'material-ui/Table';
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import { editorInterface } from '~/reducers/editor';
import { getActiveEditor } from '~/reducers/project';
import ValEditor from '~/components/ValEditor';
import TypePicker from '~/components/TypePicker';
import * as convert from '~/utils/convert';
import * as _ from 'lodash';
const T = convert.TYPES;
import { combineDeep, combineShallow, throttle } from '~/utils/objectUtils';
import PropValueEditor from './PropValueEditor';
import reactAttr from '~/utils/reactKnownHtmlAttr';
import AnimateOnChange from 'react-animate-on-change';
import HelpLink from '~/components/HelpLink';
import Translate, { TranslationProvider, translateMessage } from '~/components/Translate';

import ValEditorV2 from '~/components/ValEditorV2';

typeof window !== 'undefined'
  && require('~/styles/node-properties.scss');

export default connect(state => ({ editor: getActiveEditor(state.project) }))(class NodePropertiesPanel extends PureComponent {

  constructor(props) {
    super(props);
    this.state = this.getStateFromProps(props);
    this.dispatchNodePatch = throttle((node) => {
      const editor = editorInterface(this.props.editor, this.props.dispatch);
      const newNode = Object.assign({}, editor.activeNode, { props: node.props });
      editor.patchNode(newNode);
    }, 200);
  }

  componentDidMount() {
    this.supportedStyleKeys = Object.keys(getComputedStyle(document.createElement('div')))
      .filter(key => key.indexOf('webkit') !== 0
        || key.indexOf('moz') !== 0
        || key.indexOf('ms') !== 0);
  }

  getStateFromProps(props) {
    let editor = editorInterface(props.editor);
    return {
      activeNode: editor.activeNodeId ? editor.getNodeById(editor.activeNodeId) : null,
      newPropName: '',
      prevActiveNodeId: this.props.editor.activeNodeId,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.editor.activeNodeId !== nextProps.editor.activeNodeId) {
      this.state = this.getStateFromProps(nextProps);
    } else {
      this.setState({ prevActiveNodeId: this.props.editor.activeNodeId });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState ||
      editorInterface(this.props.editor).activeNodeId !== editorInterface(nextProps.editor).activeNodeId;
  }

  handleEditProperty(propName) {
    this.state.prevActiveNodeId = this.props.editor.activeNodeId;
    editorInterface(this.props.editor, this.props.dispatch)
      .setActivePropName(propName);
  }

  handleNodePropValueChange(node, propKey, value) {
    let newState = combineDeep(this.state, { activeNode: { props: { [propKey]: value } }, prevActiveNodeId: this.props.editor.activeNodeId });
    this.setState(newState);
    setImmediate(() => {
      this.dispatchNodePatch(node, newState.activeNode.props);
    });
  }

  handleNodePropTypeChange(node, propKey, type) {
    this.handleNodePropValueChange(node, propKey, convert.defaultForType(type));
  }

  handleNodePropsChange(node, props) {
    let nodeV2 = combineShallow(this.state.activeNode, { props: props });
    let newState = combineShallow(this.state, { activeNode: nodeV2 });
    this.setState(newState);
    setImmediate(() => {
      this.dispatchNodePatch(newState.activeNode);
    });
  }

  handleAddProperty(node, propName) {
    let newPropName = convert.unfriendlyPropNameOf(this.state.newPropName);
    this.handleNodePropValueChange(node, newPropName, '');
    this.setState({ newPropName: '' })
  }

  suggestProps(node, path) {
    if (node.isRef) {
      return [];
    } else {
      if (path.indexOf('.') === -1) {
        try {
          var domElement = document.createElement(node.component);
          return reactAttr.filter(attr => attr in domElement);
        } catch (e) {
          // do nothing
        }
      } else {
        let keys = path.split('.');
        if (keys[0] === 'style') {
          if (keys.length === 2) {
            return this.supportedStyleKeys;
          } else {
            // TODO: add autocomplete for common CSS props
          }
        }
      }
    }

    return [];
  }

  render() {
    if (!this.state.activeNode)
      return null;
    let activeNode = this.state.activeNode;
    if (!activeNode.props)
      return null;
    return (
      <div className="properties-panel">
        <div className="properties-panel-header">
          {`${activeNode.component}`}
        </div>
        {/*<div className="help-link-wrapper" style={{ padding: '8px', paddingBottom: '0px' }}>
          <HelpLink
            className="help-link"
            title={<Translate message="EDITOR.PANELS.NODE_PROPERTIES.HOW_TO.TITLE" />}
            content={<Translate message="EDITOR.PANELS.NODE_PROPERTIES.HOW_TO.CONTENT" />}
          />
        </div>*/}
        <AnimateOnChange
          baseClassName="properties-block"
          animationClassName="properties-block-change"
          animate={false}
        >
          <Paper zDepth={1} style={{ margin: '8px' }}>
            <ValEditorV2
              suggest={path => this.suggestProps(activeNode, path)}
              value={activeNode.props}
              type={T.OBJECT}
              onChange={this.handleNodePropsChange.bind(this, activeNode)}
              topLevelType={false}
              topPropAddition={true}
              />
          </Paper>
        </AnimateOnChange>
      </div>
    );
          }

          });