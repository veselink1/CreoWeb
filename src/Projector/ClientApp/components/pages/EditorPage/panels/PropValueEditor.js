import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { TextField, FloatingActionButton } from 'material-ui';
import ContentAdd from 'material-ui/svg-icons/content/add';
import * as convert from '~/utils/convert';
import TypePicker from '~/components/TypePicker';
import { editorInterface } from '~/reducers/editor';
import { getActiveEditor } from '~/reducers/project';
import ValEditor from '~/components/ValEditor';
import { combineDeep, combineShallow, throttle } from '~/utils/objectUtils';


import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn, TableFooter } from 'material-ui/Table';

export default connect(state => ({ editor: getActiveEditor(state.project) }))(class PropValueEditorPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = this.getStateFromProps(props);
    this.handleActivePropChange = this.handleActivePropChange.bind(this);
    this.handleAddProperty
    this.dispatchNodePatch = throttle((node, props) => {
      let newNode = combineShallow(node, { props });
      editorInterface(this.props.editor, this.props.dispatch)
        .patchNode(newNode);
    }, 66);
  }

  getStateFromProps(props) {
    let editor = editorInterface(props.editor);
    return {
      activeNode: editor.activeNodeId ? editor.getNodeById(editor.activeNodeId) : null,
      activePropName: editor.activePropName,
      newPropName: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    this.state = this.getStateFromProps(nextProps);
  }

  handleAddProperty() {
    let editor = editorInterface(this.props.editor, this.props.dispatch);
    let node = editor.getNodeById(editor.activeNodeId);
    let propName = editor.activePropName;
    editor.patchNode(combineDeep(node, { props: { [propName]: { [this.state.newPropName]: '' } } }));
    this.setState({ newPropName: '' });
  }

  handleActivePropChange(value) {
    let editor = editorInterface(this.props.editor, this.props.dispatch);
    let node = editor.getNodeById(editor.activeNodeId);
    let propName = editor.activePropName;
    let newState = combineDeep(this.state, { activeNode: { props: { [propName]: value } } });
    this.setState(newState);
    setImmediate(() => {
      this.dispatchNodePatch(node, newState.activeNode.props);
    });
  }

  render() {
    let node = this.state.activeNode;
    let propName = this.state.activePropName;
    if (!node || !propName) {
      return null;
    }
    return (
      <div className="value-editor-wrapper">
        <div className="value-editor-header">
          {`${propName}`}
        </div>
        <Table selectable={false}>
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>
                Name
              </TableHeaderColumn>
              <TableHeaderColumn>
                Data Type
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
        </Table>
        <div className="value-editor">
          <ValEditor
            type={node.props[propName].type}
            value={node.props[propName].value}
            childPropEditorContainer={ChildPropEditorContainer}
            onChange={this.handleActivePropChange}
            />
        </div>
        <div className="add-property">
          <TextField
            fullWidth={true}
            floatingLabelFixed={true}
            floatingLabelText="new property"
            name="new property"
            type="text"
            value={this.state.newPropName}
            onChange={(e, v) => this.setState({ newPropName: v })}
            />
          <FloatingActionButton secondary={true} style={{ position: 'absolute', right: '16px', bottom: '16px' }} onClick={this.handleAddProperty.bind(this)}>
            <ContentAdd />
          </FloatingActionButton>
        </div>
      </div>
    );
  }
});

const ChildPropEditorContainer = ({children, title, value, updateProperty}) => (
  <div className="property">
    <div className="title-type-picker">
      <div className="title">
        {title}
      </div>
      <TypePicker
        type={value.type}
        onChange={type => updateProperty(convert.defaultForType(type))}
        />
    </div>
    <div>
      {children}
    </div>
  </div>
);