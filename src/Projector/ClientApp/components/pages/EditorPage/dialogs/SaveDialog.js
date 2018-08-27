import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { editorInterface } from '~/reducers/editor';
import { getActiveEditor } from '~/reducers/project';
import { Dialog, FlatButton, Divider, Subheader, Checkbox, TextField, IconButton, RadioButtonGroup, RadioButton } from 'material-ui';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import ActionDelete from 'material-ui/svg-icons/content/clear';
import { TYPES, friendlyTypeName } from '~/utils/convert';
import deepForceUpdate from 'react-deep-force-update';
import TypePicker from '~/components/TypePickerV2';
import Translate from '~/components/Translate';

let ProjectGenerator = null;
if (typeof window === 'object') {
  ProjectGenerator = require('~/utils/projectGenerator').default;
}

const SAVE_TYPE = {
  DOWNLOAD_ONLY: 'DOWNLOAD_ONLY',
  UPLOAD_ONLY: 'UPLOAD_ONLY',
  DOWNLOAD_AND_UPLOAD: 'DOWNLOAD_AND_UPLOAD',
};

export class SaveDialog extends PureComponent {

  constructor(props) {
    super(props);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.state = { applyChanges: false, saveType: SAVE_TYPE.DOWNLOAD_ONLY };
  }

  handleCancel() {
    this.setState({ applyChanges: false });
    this.props.onRequestClose();
  }

  handleApply() {
    switch (this.state.saveType) {
      case SAVE_TYPE.DOWNLOAD_ONLY:
        ProjectGenerator.downloadProjectZipAsync(this.props.project, this.props.resources);
      case SAVE_TYPE.UPLOAD_ONLY:
        ProjectGenerator.uploadProjectZipAsync(this.props.project, this.props.resources);
      case SAVE_TYPE.DOWNLOAD_AND_UPLOAD:
        ProjectGenerator.downloadAndUploadProjectZipAsync(this.props.project, this.props.resources);
    }
    this.setState({ applyChanges: true });
    this.props.onRequestClose();
  }

  handleSaveTypeChange(event, value) {
    this.setState({ saveType: value });
  }

  render() {
    const actions = [
      <FlatButton
        label={<Translate message="EDITOR.SAVE_DIALOG.CANCEL_BUTTON" />}
        primary={true}
        onTouchTap={this.handleCancel}
      />,
      <FlatButton
        label={<Translate message="EDITOR.SAVE_DIALOG.SAVE_BUTTON" />}
        primary={true}
        onTouchTap={this.handleApply}
      />,
    ];

    const radioStyles = {
      marginBottom: 8,
    };

    const radioButtons = this.props.project.isHosted ? 
      [
        <RadioButton
          value={SAVE_TYPE.DOWNLOAD_ONLY}
          label="Download Only"
          style={radioStyles}
        />,
        <RadioButton
          value={SAVE_TYPE.UPLOAD_ONLY}
          label="Upload Only"
          style={radioStyles}
        />,
        <RadioButton
          value={SAVE_TYPE.DOWNLOAD_AND_UPLOAD}
          label="Download & Upload"
          style={radioStyles}
        />
      ] : [
        <RadioButton
          value={SAVE_TYPE.DOWNLOAD_ONLY}
          label="Download"
          style={radioStyles}
        />
      ];

    return (
      <Dialog
        title={<div><Translate message="EDITOR.SAVE_DIALOG.DIALOG_TITLE" /></div>}
        actions={actions}
        modal={false}
        open={this.props.open}
        onRequestClose={this.props.onRequestClose}
        autoScrollBodyContent={true}
        bodyStyle={{ padding: '0 0 24px' }}
        autoDetectWindowHeight={true}
      >
        <div style={{ margin: '24px' }}>
          <div style={{ marginBottom: '16px' }}>Do you want to save this project?</div>
          <RadioButtonGroup 
            value={this.state.saveType}
            onChange={this.handleSaveTypeChange.bind(this)}>
            {radioButtons}
          </RadioButtonGroup>
        </div>
      </Dialog>
    );
  }
}

export default connect(state => ({ project: state.project, resources: state.resources }))(SaveDialog);