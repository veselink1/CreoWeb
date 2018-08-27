import { PureComponent, DOM } from 'react';
import { connect } from 'react-redux';
import { IconButton, TextField, Paper, Chip, Dialog } from 'material-ui';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import { editorInterface } from '~/reducers/editor';
import { projectInterface, getActiveEditor } from '~/reducers/project';
import { combineDeep, throttle } from '~/utils/objectUtils';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Translate from '~/components/Translate';
import * as IR from '~/utils/irdom';
import * as _ from 'lodash';
import { defaultForType, TYPES } from '~/utils/convert';
import htmlTagsDefaults from '~/utils/htmlTagsDefaults';
import NewExternalCompDialog from '~/components/pages/EditorPage/dialogs/NewExternalCompDialog';

import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentLink from 'material-ui/svg-icons/content/link';
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit';

import ActionSwapVert from 'material-ui/svg-icons/action/swap-vert';
import ActionCode from 'material-ui/svg-icons/action/code';
import ActionBuild from 'material-ui/svg-icons/action/build';
import ActionSystemUpdateAlt from 'material-ui/svg-icons/action/system-update-alt';

import htmlTagsDescription from '~/utils/htmlTagsDescription';

typeof window !== 'undefined'
  && require('~/styles/comp-list.scss');

const predefined = Object.keys(DOM).map(k => ({
  name: k,
  isRef: false,
}));

export default connect(state => ({ project: state.project, editor: getActiveEditor(state.project) }))(class ComponentListPanel extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      filter: "",
      newUserCompDialogOpen: false,
      newExternalCompDialogOpen: false,
    };
    this.handleFilterChange = throttle(filter => this.setState({ filter }), 400);
    this.handleNewCompClick = this.handleNewCompClick.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.state, nextState)
      || projectInterface(this.props.project).activeComponentIndex !== projectInterface(nextProps.project).activeComponentIndex;
  }

  selectItem(index) {
    this.setState({ selectedIndex: index });
  }

  // HTML

  handleAddHtml(comp) {
    let editor = editorInterface(this.props.editor, this.props.dispatch);
    if (comp === '#text') {
      editor.addChildNode(editor.activeNodeId, IR.createTextNode("Hello, World!"));
    } else {
      let defaults = htmlTagsDefaults[comp.name];
      if (typeof defaults === 'object') {
        editor.addChildNode(editor.activeNodeId, IR.deserialize(Object.assign({ component: comp.name }, defaults)));
      } else {
        editor.addChildNode(editor.activeNodeId, IR.createComponent(comp.name));
      }
    }
  }

  renderHtml() {

    const chipStyle = {
      fontFamily: "'Fira Mono', monospace",
    };

    const rows = [
      <TableRow key={"unique"}>
        <TableRowColumn>
          <ListItem chipStyle={chipStyle} name="#text" description={"Defines a text node."} isRef={false} />
        </TableRowColumn>
        <TableRowColumn style={{ overflow: 'visible' }}>
          <IconButton
            onClick={() => this.handleAddHtml("#text")}
            tooltip={<Translate message="EDITOR.PANELS.COMPONENT_LIST.VIEW_REFERENCE_TOOLTIP" />}
          >
            <ContentAdd />
          </IconButton>
        </TableRowColumn>
      </TableRow>
    ];

    const doesHaveInfoForTag = x => {
      let name = x.name;
      let desc = htmlTagsDescription[`<${x.name}>`];
      return name.indexOf(this.state.filter) !== -1 || desc && desc.indexOf(this.state.filter) !== -1;
    };

    const createPredefinedTableRow = x => (
      <TableRow key={x.name}>
        <TableRowColumn>
          <ListItem chipStyle={chipStyle} name={x.name} description={htmlTagsDescription[`<${x.name}>`]} isRef={x.isRef} />
        </TableRowColumn>
        <TableRowColumn style={{ overflow: 'visible' }}>
          <IconButton
            onClick={this.handleAddHtml.bind(this, x)}
            tooltip={<Translate message="EDITOR.PANELS.COMPONENT_LIST.ADD_TO_SELECTION_TOOLTIP" />}
          >
            <ContentAdd />
          </IconButton>
          <a href={`https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${x.name}`} target="_blank">
            <IconButton
              tooltip={<Translate message="EDITOR.PANELS.COMPONENT_LIST.VIEW_REFERENCE_TOOLTIP" />}
            >
              <ContentLink />
            </IconButton>
          </a>
        </TableRowColumn>
      </TableRow>
    );

    for (let x of predefined) {
      if (doesHaveInfoForTag(x)) {
        rows.push(createPredefinedTableRow(x));
      }
    }

    return rows;
  }

  // ENDHTML

  // USER

  handleAddComp(comp) {
    let editor = editorInterface(this.props.editor, this.props.dispatch);
    let props = IR.deserializeComponentDefaults(comp.defaultProps);
    let node = IR.createComponent(comp.name, props, true);
    editor.addChildNode(editor.activeNodeId, node);
  }

  handleEditComp(comp) {
    let project = projectInterface(this.props.project, this.props.dispatch);
    project.editComponent(comp.name);
  }

  renderUser() {
    const chipStyle = {
      fontFamily: "'Fira Mono', monospace",
    };
    // const disableAddition = editorInterface(this.props.editor).getNodeById(this.props.editor.activeNodeId).component === '#text';
    let project = projectInterface(this.props.project);
    return project.components
      .filter(x => !x.isPage && x.name !== this.props.editor.name)
      .map(x => (
        <TableRow key={x.name}>
          <TableRowColumn>
            <ListItem style={chipStyle} name={x.name} description={htmlTagsDescription[`<${x.name}>`]} isRef={x.isRef} />
          </TableRowColumn>
          <TableRowColumn style={{ overflow: 'visible' }}>
            <IconButton
              onClick={() => this.handleAddComp(x)}
              tooltip={<Translate message="EDITOR.PANELS.COMPONENT_LIST.ADD_TO_SELECTION_TOOLTIP" />}
            >
              <ContentAdd />
            </IconButton>
          </TableRowColumn>
        </TableRow>
      ));
  }

  // ENDUSER

  renderExternal() {
    // const disableAddition = editorInterface(this.props.editor).getNodeById(this.props.editor.activeNodeId).component === '#text';
    return null;
  }

  renderContent() {
    switch (this.state.selectedIndex) {
      case 0: return this.renderHtml();
      case 1: return this.renderUser();
      case 2: return this.renderExternal();
    }
  }

  handleNewCompClick() {
    const page = this.state.selectedIndex;
    switch (page) {
      case 1: this.handleNewUserComp(); break;
      case 2: this.handleNewExternalComp(); break;
    }
  }

  handleNewUserComp() {
    this.setState({
      newUserCompDialogOpen: true
    });
  }

  handleNewExternalComp() {
    this.setState({
      newExternalCompDialogOpen: true
    });
  }

  render() {
    return (
      <div className="comp-list">

        <NewExternalCompDialog
          open={this.state.newExternalCompDialogOpen}
          onRequestClose={() => this.setState({ newExternalCompDialogOpen: false })}
          onApply={() => void 0}
        />

        <Paper className="search-box" zDepth={1}>
          <TextField
            fullWidth={true}
            hintText={<Translate message="EDITOR.PANELS.COMPONENT_LIST.SEARCH_HINT" />}
            onChange={(e, value) => this.handleFilterChange(value)}
            underlineShow={false}
            floatingLabelStyle={{ color: 'transparent' }}
            floatingLabelFocusStyle={{ color: 'transparent' }}
          />
        </Paper>
        <Paper className="comp-table" zDepth={1}>
          <Table
            fixedHeader={true}
            selectable={false}
          >
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}
            >
              <TableRow>
                <TableHeaderColumn><Translate message="EDITOR.PANELS.COMPONENT_LIST.NAME_HEADER" /></TableHeaderColumn>
                <TableHeaderColumn><Translate message="EDITOR.PANELS.COMPONENT_LIST.ACTIONS_HEADER" /></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
              stripedRows={false}
            >

              {this.renderContent()}

              <TableRow key="empty">
              </TableRow>
            </TableBody>
          </Table>
          {
            this.state.selectedIndex === 2 ?
              <FloatingActionButton
                onClick={this.handleNewCompClick}
                style={{
                  position: 'absolute',
                  bottom: '80px',
                  right: '24px',
                }}
              >
                <ContentAdd />
              </FloatingActionButton>
              :
              null
          }
        </Paper>
        <Paper className="bottom-nav" zDepth={3}>
          <BottomNavigation selectedIndex={this.state.selectedIndex}>
            <BottomNavigationItem
              label={<Translate message="EDITOR.PANELS.COMPONENT_LIST.HTML_NAV_ITEM" />}
              icon={<ActionCode />}
              onTouchTap={() => this.selectItem(0)}
            />
            <BottomNavigationItem
              label={<Translate message="EDITOR.PANELS.COMPONENT_LIST.USER_NAV_ITEM" />}
              icon={<ActionBuild />}
              onTouchTap={() => this.selectItem(1)}
            />
            <BottomNavigationItem
              label={<Translate message="EDITOR.PANELS.COMPONENT_LIST.EXTERNAL_NAV_ITEM" />}
              icon={<ActionSystemUpdateAlt />}
              onTouchTap={() => this.selectItem(2)}
            />
          </BottomNavigation>
        </Paper>
      </div>
    );
  }

});

const ListItem = ({ name, description, chipStyle }) => (
  <div className="comp">
    <Chip labelStyle={chipStyle}>
      {name}
    </Chip>
    <div className="description">
      {description}
    </div>
  </div>
);

const NewUserCompDialog = ({ open = false, onRequestClose = null }) => (
  <Dialog
    open={open}
    onRequestClose={onRequestClose}
  >
    USER BLAR
  </Dialog>
);