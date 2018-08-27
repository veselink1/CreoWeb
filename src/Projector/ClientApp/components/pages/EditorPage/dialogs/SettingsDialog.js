import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { editorInterface } from '~/reducers/editor';
import { getActiveEditor } from '~/reducers/project';
import { Dialog, FlatButton, Divider, Subheader, Checkbox, TextField, IconButton } from 'material-ui';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import ActionDelete from 'material-ui/svg-icons/content/clear';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { TYPES, friendlyTypeName, typeOf } from '~/utils/convert';
import deepForceUpdate from 'react-deep-force-update';
import TypePicker from '~/components/TypePickerV2';
import Translate from '~/components/Translate';
import TabularEditor from '~/components/TabularEditor';

export default class SettingsDialog extends PureComponent {

  constructor(props) {
    super(props);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleApply = this.handleApply.bind(this);
  }

  handleCancel() {
    this.props.onRequestClose();
  }

  handleApply() {
    this.saveProps();
    this.saveState();
    this.props.onRequestClose();
  }

  render() {
    const actions = [
      <FlatButton
        label={<Translate message="EDITOR.SETTINGS_DIALOG.CANCEL_BUTTON" />}
        primary={true}
        onTouchTap={this.handleCancel}
      />,
      <FlatButton
        label={<Translate message="EDITOR.SETTINGS_DIALOG.APPLY_BUTTON" />}
        primary={true}
        onTouchTap={this.handleApply}
      />,
    ];

    return (
      <Dialog
        title={<div><Translate message="EDITOR.SETTINGS_DIALOG.DIALOG_TITLE" /></div>}
        actions={actions}
        modal={false}
        open={this.props.open}
        onRequestClose={this.props.onRequestClose}
        autoScrollBodyContent={true}
        bodyStyle={{ padding: '0 0 24px' }}
        autoDetectWindowHeight={true}
      >
        <Subheader> <Translate message="EDITOR.SETTINGS_DIALOG.COMPONENT_PROPS_TITLE" /> </Subheader>
        <div style={{ padding: '0 24px 12px' }}>
          <Translate message="EDITOR.SETTINGS_DIALOG.PROPS_EXPLAIN" />
        </div>
        <PropTypesEditor saveCallback={save => { this.saveProps = save; }} />
        <Subheader> <Translate message="EDITOR.SETTINGS_DIALOG.COMPONENT_STATE_TITLE" /> </Subheader>
        <div style={{ padding: '0 24px 12px' }}>
          <Translate message="EDITOR.SETTINGS_DIALOG.STATE_EXPLAIN" />
        </div>
        <InitialStateEditor saveCallback={save => { this.saveState = save; }} />
        <Divider style={{ marginLeft: '24px', marginRight: '24px' }} />
      </Dialog>
    );
  }

}

class SettingsCard extends PureComponent {

  render() {
    return (
      <Card
        style={{ borderRadius: '0px', boxShadow: 'none', marginTop: '2px', paddingLeft: '24px', paddingRight: '24px' }}
      >
        <CardHeader
          title={this.props.title}
          subtitle={this.props.subtitle}
        />
        <CardText style={{ paddingTop: '0' }}>
          {this.props.children}
        </CardText>
      </Card>
    );
  }

}

const PropTypesEditor = connect(state => ({ editor: getActiveEditor(state.project) }))
  (class PropTypesEditor extends PureComponent {

    constructor(props) {
      super(props);
      this.state = { defaultProps: [] };
    }

    componentDidMount() {
      let editor = editorInterface(this.props.editor);
      this.setState({ defaultProps: editor.defaultProps });
      this.props.saveCallback(() => {
        const editor = editorInterface(this.props.editor, this.props.dispatch);
        const defaultProps = this.state.defaultProps
          .map(config => ({
            name: config.name,
            value: config.value,
            type: typeOf(JSON.parse(config.value))
          }));
        editor.setDefaultProps(this.state.defaultProps, this.props.dispatch);
      });
    }

    handleRemoveProp(index) {
      const defaultProps = this.state.defaultProps.slice();
      defaultProps.splice(index, 1);
      this.setState({ defaultProps });
    }

    render() {
      return (
        <TabularEditor
          values={this.state.defaultProps}
          layout={{
            name: {
              index: 0,
              initialValue: '[undefined]',
              renderHeader: () => <Translate message="EDITOR.SETTINGS_DIALOG.PROPS_TABLE.NAME_HEADER" />,
              renderCell: ({ value, onChange }) => <TextField value={value} onChange={e => onChange(e.target.value)} fullWidth={true} />,
            },
            value: {
              index: 2,
              initialValue: '"Hello, World!"',
              renderHeader: () => <Translate message="EDITOR.SETTINGS_DIALOG.PROPS_TABLE.DEFAULT_VALUE_HEADER" />,
              renderCell: ({ value, onChange }) => {
                let parseError = null;
                try {
                  JSON.parse(value);
                } catch (error) {
                  parseError = error.message;
                }
                return (
                  <TextField value={value} onChange={e => onChange(e.target.value)} errorText={parseError} fullWidth={true} />
                );
              },
            },
            actions: {
              index: 3,
              initialValue: void 0,
              renderHeader: () => <Translate message="EDITOR.SETTINGS_DIALOG.PROPS_TABLE.ACTIONS_HEADER" />,
              renderCell: ({ index }) => (
                <IconButton onClick={this.handleRemoveProp.bind(this, index)}>
                  <ActionDelete />
                </IconButton>
              ),
            }
          }}
          onChange={defaultProps => {
            this.setState({ defaultProps });
          }}
        />
      );
    }

  });


const InitialStateEditor = connect(state => ({ editor: getActiveEditor(state.project) }))
  (class PropTypesEditor extends PureComponent {

    constructor(props) {
      super(props);
      this.state = { initialState: [] };
    }

    componentDidMount() {
      let editor = editorInterface(this.props.editor);
      this.setState({ initialState: editor.initialState });
      this.props.saveCallback(() => {
        const editor = editorInterface(this.props.editor, this.props.dispatch);
        const initialState = this.state.initialState
          .map(config => ({
            name: config.name,
            value: config.value,
            type: typeOf(JSON.parse(config.value))
          }));
        editor.setInitialState(initialState, this.props.dispatch);
      });
    }

    handleRemoveProp(index) {
      const initialState = this.state.initialState.slice();
      initialState.splice(index, 1);
      this.setState({ initialState });
    }

    render() {
      return (
        <TabularEditor
          values={this.state.initialState}
          layout={{
            name: {
              index: 0,
              initialValue: '[undefined]',
              renderHeader: () => <Translate message="EDITOR.SETTINGS_DIALOG.PROPS_TABLE.NAME_HEADER" />,
              renderCell: ({ value, onChange }) => <TextField value={value} onChange={e => onChange(e.target.value)} fullWidth={true} />,
            },
            value: {
              index: 2,
              initialValue: '"Hello, World!"',
              renderHeader: () => <Translate message="EDITOR.SETTINGS_DIALOG.PROPS_TABLE.DEFAULT_VALUE_HEADER" />,
              renderCell: ({ value, onChange }) => {
                let parseError = null;
                try {
                  JSON.parse(value);
                } catch (error) {
                  parseError = error.message;
                }
                return (
                  <TextField value={value} onChange={e => onChange(e.target.value)} errorText={parseError} fullWidth={true} />
                );
              },
            },
            actions: {
              index: 3,
              initialValue: void 0,
              renderHeader: () => <Translate message="EDITOR.SETTINGS_DIALOG.PROPS_TABLE.ACTIONS_HEADER" />,
              renderCell: ({ index }) => (
                <IconButton onClick={this.handleRemoveProp.bind(this, index)}>
                  <ActionDelete />
                </IconButton>
              ),
            }
          }}
          onChange={initialState => {
            this.setState({ initialState });
          }}
        />
      );
    }

  });

