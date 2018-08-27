import { Component, PureComponent } from 'react';
import { connect } from 'react-redux';
import { IconButton, TextField, Dialog, RaisedButton, Chip, Paper, AutoComplete, CircularProgress } from 'material-ui';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Tabs, Tab } from 'material-ui/Tabs';
import * as IR from '~/utils/irdom';
import * as convert from '~/utils/convert';
import * as _ from 'lodash';
import { resourcesInterface, RESOURCE_TYPES, GLOBAL_GROUP, EXTERNAL_GROUP } from '~/reducers/resources';
import { editorInterface } from '~/reducers/editor';
import { getActiveEditor } from '~/reducers/project';
import { combineDeep } from '~/utils/objectUtils';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import ContentLink from 'material-ui/svg-icons/content/link';
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import ResEditor from './ResEditor';
import CAddBox from 'material-ui/svg-icons/content/add-box';
import TypePicker from '~/components/TypePickerV2';
import Translate from '~/components/Translate';
import * as pacman from '~/api/pacman';
import * as fileman from '~/api/fileman';

if (typeof window === 'object') {
  window.fileman = fileman;
}

const ResViewer = connect(state => ({ resources: state.resources }))(class ResViewerPanel extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      activeResId: null,
      newResourceName: '',
      newResourceType: RESOURCE_TYPES.JSON
    };
    this.handleAddResource = this.handleAddResource.bind(this);
    this.handleNewResourceNameChange = this.handleNewResourceNameChange.bind(this);
    this.handleNewResourceTypeChange = this.handleNewResourceTypeChange.bind(this);
  }

  getResInterface(props = this.props) {
    return resourcesInterface(this.props.resourceStore, this.props.resources, this.props.dispatch);
  }

  handleEditRecord(resId) {
    this.setState({ activeResId: resId });
  }

  handleCloseDialog() {
    this.setState({ activeResId: null });
  }

  render() {
    const R = this.getResInterface();
    const records = R.records;
    return (
      <Paper zDepth={1} style={{ margin: '8px' }}>
        <Dialog
          title={
            <div>
              <Translate message="EDITOR.PANELS.RES_VIEWER.EDITING_HEADER" />
            </div>
          }
          actions={<RaisedButton onClick={() => this.handleCloseDialog()} label="Close" primary={true} />}
          modal={true}
          open={!!this.state.activeResId}
          bodyStyle={{ overflowY: 'visible' }}
        >
          <div style={{ height: 'calc(90vh - 16em)' }}>
            <ResEditor resourceStore={this.props.resourceStore} resourceId={this.state.activeResId} />
          </div>
        </Dialog>
        <Table
          fixedHeader={true}
          fixedFooter={true}
          selectable={false}>
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>
                <Translate message="EDITOR.PANELS.RES_VIEWER.NAME_HEADER" />
              </TableHeaderColumn>
              <TableHeaderColumn>
                <Translate message="EDITOR.PANELS.RES_VIEWER.DATA_TYPE_HEADER" />
              </TableHeaderColumn>
              <TableHeaderColumn>
                <Translate message="EDITOR.PANELS.RES_VIEWER.ACTIONS_HEADER" />
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
            stripedRows={false}
          >
            {Object.keys(records)
              .sort((a, b) => a.type < b.type)
              .map((recId, i) => {
                let rec = records[recId];
                return (
                  <TableRow key={i}>
                    <TableRowColumn>
                      <Chip> {rec.name} </Chip>
                    </TableRowColumn>
                    <TableRowColumn>
                      {getUserTypeName(rec.type)}
                    </TableRowColumn>
                    <TableRowColumn style={{ overflow: 'visible' }}>
                      <IconButton
                        tooltip="Edit"
                        onClick={this.handleEditRecord.bind(this, recId)}
                        style={{ marginTop: '5px' }}>
                        <EditorModeEdit />
                      </IconButton>
                      <IconButton
                        tooltip="Delete"
                        onClick={this.handleRemoveResource.bind(this, recId)}
                        style={{ marginTop: '5px' }}>
                        <ActionDelete />
                      </IconButton>
                    </TableRowColumn>
                  </TableRow>
                );
              }
              )}
            <TableRow style={{ height: '64px' }} key={'add-new-resource'}>
              <TableRowColumn>
                {
                  this.state.newResourceType === RESOURCE_TYPES.LINK ?
                    <NPMModuleNameInput
                      value={this.state.newResourceName}
                      onChange={this.handleNewResourceNameChange}
                    />
                    :
                    <TextField
                      fullWidth={true}
                      hintText={<Translate message="EDITOR.PANELS.RES_VIEWER.RES_NAME_HINT" />}
                      errorText={this.state.newResourceErrorText}
                      value={this.state.newResourceName}
                      onChange={this.handleNewResourceNameChange}
                    />
                }
              </TableRowColumn>
              <TableRowColumn>
                <TypePicker
                  value={this.state.newResourceType}
                  onChange={this.handleNewResourceTypeChange}
                  types={_.omit(RESOURCE_TYPES, 'LINK')}
                  friendlyTypeName={getUserTypeName}
                  style={{
                    position: 'relative',
                    top: '5.5px',
                  }}
                />
              </TableRowColumn>
              <TableRowColumn style={{ overflow: 'visible' }}>
                <IconButton
                  onClick={this.handleAddResource}
                  style={{ marginTop: '5px' }}>
                  <CAddBox />
                </IconButton>
              </TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    );
  }

  handleAddResource() {
    const R = this.getResInterface();
    const name = this.state.newResourceName;
    const type = this.state.newResourceType;
    if (!name) {
      this.setState({ newResourceErrorText: 'The resource name cannot be empty.' });
    } else if (R.getRecordByName(name)) {
      this.setState({ newResourceErrorText: 'A resource with the same name already exists.' });
    } else {
      R.addResource({ name, type });
      this.setState({ newResourceName: '', newResourceType: RESOURCE_TYPES.JSON });
    }
  }

  handleNewResourceNameChange(e) {
    this.setState({ newResourceName: e.target.value });
  }

  handleNewResourceTypeChange(type) {
    this.setState({ newResourceType: type });
  }

  handleRemoveResource(resId) {
    const R = this.getResInterface();
    R.deleteResource(resId);
  }

});

const ExternalResViewer = connect(state => ({ resources: state.resources, projectId: state.project.id }))(class ResViewerPanel extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      activeResId: null,
      newResourceName: '',
      packages: [],
      pendingPackageName: '',
    };
    this.handleInstallPackageAsync = this.handleInstallPackageAsync.bind(this);
    this.handleNewResourceNameChange = this.handleNewResourceNameChange.bind(this);
  }

  async componentDidMount() {
    try {
      const { initialized, packageUrl } = await pacman.isInitializedAsync(this.props.projectId);
      if (initialized) {
        this.setState({ packages: await this.getPackageListAsync(packageUrl) });
      }
    } catch (e) {
      console.log('Loading of user packages failed!', e);
    }
  }

  async getPackageListAsync(packageUrl) {
    try {
      const packages = (await pacman.getPackageJSONAsync(packageUrl)).dependencies;
      const list = [];
      for (let pkg in packages) {
        list.push({ name: pkg, version: packages[pkg] });
      }
      return list;
    } catch (e) {
      return [{ name: '~ERROR~', version: '?' }];
    }
  }

  render() {
    return (
      <Paper zDepth={1} style={{ margin: '8px' }}>
        <Table
          fixedHeader={true}
          fixedFooter={true}
          selectable={false}>
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>
                <Translate message="EDITOR.PANELS.RES_VIEWER.NAME_HEADER" />
              </TableHeaderColumn>
              <TableHeaderColumn>
                <Translate message="EDITOR.PANELS.RES_VIEWER.VERSION_HEADER" />
              </TableHeaderColumn>
              <TableHeaderColumn>
                <Translate message="EDITOR.PANELS.RES_VIEWER.ACTIONS_HEADER" />
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
            stripedRows={false}
          >
            {this.state.packages
              .sort()
              .map(pkg => {
                return (
                  <TableRow key={pkg.name}>
                    <TableRowColumn>
                      <Chip> {pkg.name} </Chip>
                    </TableRowColumn>
                    <TableRowColumn>
                      {pkg.version ||
                        <CircularProgress size={32} thickness={3} />}
                    </TableRowColumn>
                    <TableRowColumn style={{ overflow: 'visible' }}>
                      <IconButton
                        tooltip="Delete"
                        onClick={this.handleUninstallPackageAsync.bind(this, pkg.name)}
                        style={{ marginTop: '5px' }}>
                        <ActionDelete />
                      </IconButton>
                      <a href={`https://www.npmjs.com/package/${encodeURIComponent(pkg.name)}`} target="_blank">
                        <IconButton
                          tooltip={<Translate message="EDITOR.PANELS.RES_VIEWER.VIEW_REFERENCE_TOOLTIP" />}
                          style={{ marginTop: '5px' }}>
                          <ContentLink />
                        </IconButton>
                      </a>
                    </TableRowColumn>
                  </TableRow>
                );
              }
              )}
            <TableRow style={{ height: '64px' }} key={'add-new-resource'}>
              <TableRowColumn colSpan={2}>
                <NPMModuleNameInput
                  value={this.state.newResourceName}
                  errorText={this.state.newResourceErrorText}
                  onChange={this.handleNewResourceNameChange}
                />
              </TableRowColumn>
              <TableRowColumn style={{ overflow: 'visible' }}>
                <IconButton
                  onClick={this.handleInstallPackageAsync}
                  style={{ marginTop: '5px' }}>
                  <CAddBox />
                </IconButton>
              </TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    );
  }

  async handleUninstallPackageAsync(packageName) {
    if (packageName == '~ERROR~') return;
    this.setState({
      packages: this.state.packages.map(x => x.name === packageName ? { name: x.name } : x),
    });
    try {
      const installResult = await pacman.uninstallPackageAsybc(this.props.projectId, packageName);
      const { packageUrl } = await pacman.isInitializedAsync(this.props.projectId);
      this.setState({ packages: await this.getPackageListAsync(packageUrl) });
    } catch (e) {
      console.log('Uninstallation of package "' + packageName + '" failed!', e);
    }
  }

  async handleInstallPackageAsync() {
    const packageName = this.state.newResourceName;
    if (packageName == '~ERROR~') return;
    if (!packageName) {
      this.setState({ newResourceErrorText: 'The package name cannot be empty.' });
    } else if (this.state.packages.find(x => x.name === packageName)) {
      this.setState({ newResourceErrorText: 'A package with the same name has already been added.' });
    } else {
      const isValid = await isValidPackageAsync(packageName);
      if (isValid) {
        this.setState({
          newResourceName: '',
          newResourceType: RESOURCE_TYPES.JSON,
          packages: this.state.packages.concat({ name: packageName }),
        });
        try {
          const installResult = await pacman.installPackageAsync(this.props.projectId, packageName);
          const { packageUrl } = await pacman.isInitializedAsync(this.props.projectId);
          this.setState({ packages: await this.getPackageListAsync(packageUrl) });
        } catch (e) {
          console.log('Installation of package "' + packageName + '" failed!', e);
        }
      } else {
        this.setState({ newResourceErrorText: 'This package does not exist.' });
      }
    }
  }

  handleNewResourceNameChange(e) {
    this.setState({ newResourceName: e.target.value, newResourceErrorText: '' });
  }

});


const FileResViewer = connect(state => ({ resources: state.resources, projectId: state.project.id }))(class ResViewerPanel extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      files: [],
      addFileDialogOpen: false,
    };
  }

  async componentDidMount() {
    const files = await fileman.getFilesAsync(this.props.projectId);
    this.setState({ files });
  }

  async handleDeleteFile(file) {
    await fileman.deleteFileAsync(this.props.projectId, file.path);
    this.setState({ files: this.state.files.filter(x => x.path !== file.path) });
  }

  addFileInfo(fileInfo) {
    this.setState({ files: this.state.files.concat([fileInfo]) });
  }

  handleAddFile() {
    this.setState({ addFileDialogOpen: true });
  }

  async handleAcceptFile(file, path) {
    await fileman.writeFileAsync(this.props.projectId, path, file, file.type);
    this.addFileInfo({
      path: path,
      contentType: file.type,
      size: file.size,
    });
  }

  render() {
    return (
      <div>
        <Paper zDepth={1} style={{ margin: '8px' }}>

          <Table
            fixedHeader={true}
            fixedFooter={true}
            selectable={false}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn>
                  <Translate message="EDITOR.PANELS.RES_VIEWER.NAME_HEADER" />
                </TableHeaderColumn>
                <TableHeaderColumn>
                  <Translate message="EDITOR.PANELS.RES_VIEWER.ACTIONS_HEADER" />
                </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
              stripedRows={false}
            >
              {this.state.files.map((file, i) => (
                <TableRow key={i}>
                  <TableRowColumn>
                    <Chip> {file.path} </Chip>
                  </TableRowColumn>
                  <TableRowColumn>
                    <IconButton
                      tooltip="Delete"
                      onClick={this.handleDeleteFile.bind(this, file)}
                      style={{ marginTop: '5px' }}>
                      <ActionDelete />
                    </IconButton>
                  </TableRowColumn>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        </Paper>

        <FloatingActionButton
          onClick={this.handleAddFile.bind(this)}
          style={{
            position: 'absolute',
            bottom: '64px',
            right: '24px',
          }}
        >
          <ContentAdd />
        </FloatingActionButton>

        <AddFileDialog
          open={this.state.addFileDialogOpen}
          onAccept={this.handleAcceptFile.bind(this)}
          onRequestClose={() => this.setState({ addFileDialogOpen: false })}
        />

      </div>
    );
  }

});

class AddFileDialog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      file: null,
      path: '',
    };
  }

  onFileChange(event) {
    let file = event.target.files[0];
    if (file) {
      this.setState({
        file: file,
        path: '/' + file.name,
      });
    } else {
      this.setState({
        file: null,
        path: '',
      });
    }
  }

  pathHasErrors() {
    return this.state.path.length == 0;
  }

  getPathErrorText() {
    if (this.pathHasErrors()) {
      if (this.state.path.length == 0) {
        return 'The path cannot be empty.';
      } else {
        return 'Invalid path.';
      }
    } else {
      return '';
    }
  }

  render() {
    return (
      <Dialog
        title={
          <div>
            <Translate message="EDITOR.PANELS.RES_VIEWER.ADD_FILE_HEADER" />
          </div>
        }
        actions={[
          <RaisedButton
            onClick={() => this.props.onAccept(this.state.file, this.state.path)}
            label="Accept"
            primary={true}
            disabled={this.state.file == null || this.pathHasErrors()}
            style={{ marginRight: '8px' }} />,
          <RaisedButton
            onClick={() => this.props.onRequestClose()}
            label="Close" />
        ]}
        modal={true}
        open={this.props.open}
        onRequestClose={this.props.onRequestClose}
        bodyStyle={{ overflowY: 'visible' }}
      >
        <div>
          <TextField
            value={this.state.path}
            onChange={e => this.setState({ path: e.target.value })}
            hintText="/path/to/file.ext"
            floatingLabelText="Virtual Path"
            errorText={this.state.file ? this.getPathErrorText() : ''}
          />
          <br />
          <RaisedButton
            containerElement='label'
            label='Choose File'>
            <input type="file" onChange={this.onFileChange.bind(this)} style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              display: 'block',
            }} />
          </RaisedButton>
        </div>
      </Dialog>
    );
  }
}


function getUserTypeName(type) {
  switch (type) {
    case RESOURCE_TYPES.TEXT: return 'Markup';
    case RESOURCE_TYPES.JS: return 'Script';
    case RESOURCE_TYPES.CSS: return 'Style';
    case RESOURCE_TYPES.JSON: return 'Data';
    case RESOURCE_TYPES.LINK: return 'Package';
    default: throw new Error('Unknown type ' + type);
  }
}

async function isValidPackageAsync(pkg) {
  pkg = pkg.trim();
  if (pkg.length == 0) {
    return false;
  } else {
    let res = null;
    try {
      res = await fetch(`https://api.npms.io/v2/search/suggestions?q=${encodeURIComponent(pkg)}&size=4`);
    } catch (e) {
      return true;
    }

    if (!res.ok) {
      return true;
    }

    const json = await res.json();
    return json.some(metaData => metaData.package.name === pkg);
  }
}

const FullSizeTabTemplate = ({ children, style, selected }) => (
  <div style={{ position: 'absolute', width: '100%', height: '100%', display: selected ? 'block' : 'none' }}>
    {children}
  </div>
);

export default connect(state => ({ editor: getActiveEditor(state.project) }))(({ editor }) => (
  <Tabs 
      tabTemplate={FullSizeTabTemplate}>
    <Tab label={<Translate message="EDITOR.PANELS.RES_VIEWER.LOCAL_LABEL" />}>
      <ResViewer resourceStore={editorInterface(editor).name} />
    </Tab>
    <Tab label={<Translate message="EDITOR.PANELS.RES_VIEWER.GLOBAL_LABEL" />}>
      <ResViewer resourceStore={GLOBAL_GROUP} />
    </Tab>
    <Tab label={<Translate message="EDITOR.PANELS.RES_VIEWER.EXTERNAL_LABEL" />}>
      <ExternalResViewer />
    </Tab>
    <Tab label={<Translate message="EDITOR.PANELS.RES_VIEWER.FILES_LABEL" />}>
      <FileResViewer />
    </Tab>
  </Tabs >
));

class NPMModuleNameInput extends PureComponent {

  constructor(props) {
    super(props);
    this.state = { dataSource: [] };
  }

  handleUpdateInput(newValue) {
    if (!newValue) {
      this.setState({ dataSource: [] });
    }
    fetch(`https://api.npms.io/v2/search/suggestions?q=${encodeURIComponent(newValue)}&size=8`)
      .then(res => {
        if (res.ok) {
          return res.json()
        } else {
          this.setState({
            dataSource: []
          });
        }
      })
      .then(json => {
        this.setState({
          dataSource: json.map(metaData => metaData.package.name)
        });
      })
      .catch(e => {
        this.setState({
          dataSource: []
        });
      });

    this.props.onChange({ target: { value: newValue } });
  }

  render() {
    return (
      <AutoComplete
        fullWidth={true}
        hintText={<Translate message="EDITOR.PANELS.RES_VIEWER.PKG_NAME_HINT" />}
        errorText={this.props.errorText}
        value={this.props.value}
        dataSource={this.state.dataSource}
        onUpdateInput={this.handleUpdateInput.bind(this)}
      />
    )
  }
}