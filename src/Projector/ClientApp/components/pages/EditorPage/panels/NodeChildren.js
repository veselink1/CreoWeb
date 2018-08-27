import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IconButton, TextField, Chip, Paper, Subheader, Divider, SvgIcon } from 'material-ui';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import * as IR from '~/utils/irdom';
import { TYPES } from '~/utils/convert';
import { editorInterface } from '~/reducers/editor';
import { getActiveEditor } from '~/reducers/project';
import { combineDeep } from '~/utils/objectUtils';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import AnimateOnChange from 'react-animate-on-change';
import HelpLink from '~/components/HelpLink';
import Translate from '~/components/Translate';
import Reorder from 'react-reorder';

import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentContentCopy from 'material-ui/svg-icons/content/content-copy';
import ActionDelete from 'material-ui/svg-icons/content/clear';
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import ActionZoomIn from 'material-ui/svg-icons/action/zoom-in';
import ActionSwapVert from 'material-ui/svg-icons/action/swap-vert';

import HKArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import HKArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import ContentReport from 'material-ui/svg-icons/content/report';
import EditorDragHandle from 'material-ui/svg-icons/editor/drag-handle';

typeof window !== 'undefined'
  && require('~/styles/node-children.scss');

function arraysEqualShallow(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export default connect(state => ({ editor: getActiveEditor(state.project) }))(class NodeChildrenPanel extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      prevActiveNodeId: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.editor.activeNodeId !== nextProps.editor.activeNodeId) {
      this.setState({ prevActiveNodeId: this.props.editor.activeNodeId });
    }
  }

  render() {
    const editor = editorInterface(this.props.editor, this.props.dispatch);
    const activeNodeId = editor.activeNodeId;
    if (!activeNodeId) return null;

    const children = [];
    climbUp(activeNodeId, editor.nodes, node => {
      children.push(
        <ContentBlock
          key={node.id}
          parentNodeId={node.id}
        />
      );
    })

    return (
      <div className="node-children-root content-panel-root">
        <div className="help-link-wrapper" style={{ padding: '8px', paddingBottom: '0px' }}>
          <HelpLink
            className="help-link"
            label={<Translate message="EDITOR.PANELS.NODE_CHILDREN.HOW_TO.LABEL" />}
            title={<Translate message="EDITOR.PANELS.NODE_CHILDREN.HOW_TO.TITLE" />}
            content={<Translate message="EDITOR.PANELS.NODE_CHILDREN.HOW_TO.CONTENT" />}
          />
        </div>
        <div className="children">
          {children}
        </div>
      </div>
    );
  }

});

function climbUp(nodeId, nodes, f) {
  let node = IR.getNodeById(nodeId, nodes);
  while (true) {
    f(node);
    if (node.parent === null) {
      break;
    } else {
      node = IR.getNodeById(node.parent, nodes);
    }
  }
}

const ContentBlock = connect(state => ({ editor: getActiveEditor(state.project) }))(class ContentBlock extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      selected: "",
      prevParentNodeId: null,
      prevChildCount: -1,
    };
    this.reorderCallback = this.reorderCallback.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const newEditor = editorInterface(nextProps.editor);
    this.setState({
      prevParentNodeId: this.props.parentNodeId,
      prevChildCount: newEditor.getNodeById(nextProps.parentNodeId).children.length,
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.editor.nodes != nextProps.editor.nodes
      || this.state !== nextState;
  }


  handleEditChildClick(child) {
    editorInterface(this.props.editor, this.props.dispatch)
      .setActiveNodeId(child.id);
  }

  handleRemoveChildClick(child) {
    editorInterface(this.props.editor, this.props.dispatch)
      .removeNodeById(child.id);
  }

  handleMoveChild(childId, newIndex) {
    let editor = editorInterface(this.props.editor, this.props.dispatch);
    editor.moveChildNode(childId, newIndex);
  }

  handleDuplicateChildClick(child) {
    editorInterface(this.props.editor, this.props.dispatch)
      .cloneNode(child.id);
  }

  renderTableBody() {
    let editor = editorInterface(this.props.editor, this.props.dispatch);
    const children = editor.getChildren(this.props.parentNodeId);
    return (
      <TableBody
        displayRowCheckbox={false}
        stripedRows={false}>
        {children.map((child, i) => (
          <TableRow key={child.id + '-' + i}>
            <TableRowColumn>
              <IconButton disabled={i === 0}>
                <HKArrowUp onClick={() => this.handleMoveChild(child.id, i - 1)} />
              </IconButton>
              <IconButton disabled={i === children.length - 1}>
                <HKArrowDown onClick={() => this.handleMoveChild(child.id, i + 1)} />
              </IconButton>
            </TableRowColumn>
            <TableRowColumn>
              <Chip onRequestDelete={this.handleRemoveChildClick.bind(this, child)}>
                {child.component}
              </Chip>
            </TableRowColumn>
            <TableRowColumn style={{ paddingLeft: 0, paddingRight: 0 }}>
              <IconButton onClick={this.handleEditChildClick.bind(this, child)}>
                <ActionZoomIn />
              </IconButton>
            </TableRowColumn>
          </TableRow>
        ))}
      </TableBody>
    );
  }

  reorderCallback(event, itemThatHasBeenMoved, itemsPreviousIndex, itemsNewIndex, reorderedArray) {
    this.handleMoveChild(itemThatHasBeenMoved.id, itemsNewIndex);
  }

  friendlyCompDesc(node) {
    const parts = [node.component];
    const id = node.props.id;
    if (id && id.value) {
      if (id.type === TYPES.STRING) {
        parts.push('#' + id.value);
      } else if (id.type === TYPES.DYNAMIC) {
        parts.push('#[dynamic]');
      } else {
        parts.push('#[error]');
      }
    }
    const className = node.props.className;
    if (className && className.value && className.value.trim().length !== 0) {
      if (className.type === TYPES.STRING) {
        parts.push('.' + className.value.split(' ').map(x => x.trim()).join('.'));
      } else if (className.type === TYPES.DYNAMIC) {
        parts.push('.[dynamic]');
      } else {
        parts.push('.[error]');
      }
    }
    return parts.join('');
  }

  render() {
    let editor = editorInterface(this.props.editor, this.props.dispatch);
    const node = editor.getNodeById(this.props.parentNodeId);
    const isRoot = node.id === editor.rootNode.id;
    const children = editor.getChildren(this.props.parentNodeId);
    const headerStyle = node.id === editor.activeNodeId ?
      { backgroundColor: '#FFE0B2', fontSize: '14px', textAlign: 'center', color: 'black' } :
      { fontSize: '14px', textAlign: 'center' };
    const activeNodeStyle =
      { backgroundColor: '#FFE0B2', fontSize: '14px', textAlign: 'center', color: 'black' };
    const activeNodeLabelStyle = { fontFamily: "'Fira Mono', monospace", };

    return (
      <AnimateOnChange
        baseClassName="content-block-item"
        animationClassName="content-block-item-change"
        animate={node.children.length !== this.state.prevChildCount}
      >
        <div className="content-list">

          <Paper zDepth={1} style={{ margin: '8px' }}>
            <Table
              fixedHeader={true}
              selectable={false}
            >
              <TableHeader
                displaySelectAll={false}
                adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn colSpan={2} style={headerStyle}><Translate message="EDITOR.PANELS.NODE_CHILDREN.CONTENT_OF_PREFIX" /> {isRoot ? editor.name : this.friendlyCompDesc(node)}</TableHeaderColumn>
                </TableRow>
              </TableHeader>
            </Table>
            <Reorder
              // The key of each object in your list to use as the element key
              itemKey="id"
              // Lock horizontal to have a vertical list
              lock="horizontal"
              // The milliseconds to hold an item for before dragging begins
              holdTime="200"
              // The list to display
              list={children}
              // A template to display for each list item
              template={({item}) => (
                <Paper zDepth={1} rounded={false} className="list-item" key={item.id}>
                  <div className="list-item-col">
                    <div className="comp-name">
                      <Chip labelStyle={activeNodeLabelStyle} style={item.id === editor.activeNodeId ? activeNodeStyle : void 0} onRequestDelete={this.handleRemoveChildClick.bind(this, item)}>
                        {this.friendlyCompDesc(item)}
                      </Chip>
                    </div>
                  </div>
                  <div className="list-item-col">
                    <div className="comp-actions">
                      <IconButton
                        tooltip="Move"
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        disableKeyboardFocus={true}
                        style={{ cursor: 'n-resize' }}
                        iconStyle={{ color: "#b3b3b3" }}>
                        <EditorDragHandle />
                      </IconButton>
                      <IconButton tooltip="Edit" onClick={this.handleEditChildClick.bind(this, item)}>
                        <EditorModeEdit />
                      </IconButton>
                      <IconButton tooltip="Duplicate" onClick={this.handleDuplicateChildClick.bind(this, item)}>
                        <ContentContentCopy />
                      </IconButton>
                    </div>
                  </div>
                </Paper>
              )}
              // Function that is called once a reorder has been performed
              callback={this.reorderCallback}
              // Class to be applied to the outer list element
              listClass="reorder-list"
              // The item to be selected (adds 'selected' class)
              selected={this.state.selected}
              // The key to compare from the selected item object with each item object
              selectedKey="id"
              // Allows reordering to be disabled
              disableReorder={false} />
            {children.length === 0 ? (
              <div style={{ padding: '16px' }}>
                <SvgIcon style={{ width: '48px', height: '48px', display: 'block', margin: '0 auto' }}>
                  <ContentReport />
                </SvgIcon>
                <div>
                  <Subheader style={{ textAlign: 'center' }}> It's lonely here... </Subheader>
                  <div style={{ textAlign: 'center' }}> You can add content to this element using the components tab. </div>
                </div>
              </div>
            ) : null}
          </Paper>
        </div>
      </AnimateOnChange>
    );
  }
});