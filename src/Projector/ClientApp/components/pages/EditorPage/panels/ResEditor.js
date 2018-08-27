import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IconButton, TextField } from 'material-ui';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Tabs, Tab } from 'material-ui/Tabs';
import * as IR from '~/utils/irdom';
import * as convert from '~/utils/convert';
import { resourcesInterface, RESOURCE_TYPES } from '~/reducers/resources';
import { combineDeep } from '~/utils/objectUtils';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import MonacoEditor from '~/components/MonacoEditor';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { convertToRaw, EditorState, ContentState } from 'draft-js';

const DraftEditor = require('react-draft-wysiwyg').Editor;

if (typeof window !== 'undefined') {
  require('react-draft-wysiwyg/dist/react-draft-wysiwyg.css');
}

export default connect(state => ({ resources: state.resources }))(class ResEditorPanel extends PureComponent {

  constructor(props) {
    super(props);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleDraftStateChange = this.handleDraftStateChange.bind(this);
    this.lastText = null;
    this.draftState = null;
  }

  handleTextChange(text) {
    this.lastText = text;
  }

  handleDraftStateChange(editorState) {
    this.draftState = editorState;
  }

  componentWillUnmount() {
    if (this.lastText !== null) {
      const R = resourcesInterface(this.props.resourceStore, this.props.resources, this.props.dispatch);
      R.patchResource(this.props.resourceId, { value: this.lastText });
    }
    if (this.draftState !== null) {
      const html = draftToHtml(convertToRaw(this.draftState.getCurrentContent()));
      const R = resourcesInterface(this.props.resourceStore, this.props.resources, this.props.dispatch);
      R.patchResource(this.props.resourceId, { value: html });
    }
  }

  getResInterface(props = this.props) {
    return resourcesInterface(props.resourceStore, props.resources, props.dispatch);
  }

  getDefaultDraftState(html) {
    const blocksFromHTML = htmlToDraft(html || '<p></p>');
    const contentState = ContentState.createFromBlockArray(blocksFromHTML);
    const editorState = EditorState.createWithContent(contentState);
    return editorState;
  }

  render() {
    const R = this.getResInterface();
    const records = R.records;
    const resource = R.records[this.props.resourceId];
    if (!resource) return null;
    return (
      <div
        style={{ width: '100%', height: '100%' }}>
        {resource.type === RESOURCE_TYPES.TEXT ?
        <DraftEditor 
          onEditorStateChange={this.handleDraftStateChange}
          defaultEditorState={this.getDefaultDraftState(resource.value)}
        />
        :
        <MonacoEditor
          model={
            [
              resource.value,
              getMimeType(resource.type)
            ]
          }
          onChange={this.handleTextChange}
        />
        }
      </div>
    );
  }

});

function getMimeType(resType) {
  switch (resType) {
    case RESOURCE_TYPES.TEXT: return 'text/plain';
    case RESOURCE_TYPES.CSS: return 'text/css';
    case RESOURCE_TYPES.JSON: return 'application/json';
    case RESOURCE_TYPES.JS: return 'text/javascript';
    default: throw new Error('Unknown type ' + resType);
  }
}