import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { TextField, Dialog, SelectField, MenuItem, FlatButton } from 'material-ui';
import Translate from '~/components/Translate';
import * as pacman from '~/api/pacman';

class NewExternalCompDialog extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      packages: [],
      packageName: null,
      selector: '',
    };
    this.handlePackageChange = this.handlePackageChange.bind(this);
    this.handleSelectorChange = this.handleSelectorChange.bind(this);
  }

  async componentDidMount() {
    try {
      const { initialized, packageUrl } = await pacman.isInitializedAsync(this.props.projectId);
      if (initialized) {
        this.setState({ packages: await this.getPackageList(packageUrl) });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async getPackageList(packageUrl) {
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

  handlePackageChange(event, index, value) {
    this.setState({
      packageName: value,
    });
  }

  handleSelectorChange(event) {
    this.setState({
      selector: event.target.value
    });
  }

  render() {
    const actions = [
      <FlatButton
        label={<Translate message="EDITOR.EXTERNAL_COMP_DIALOG.CANCEL_BUTTON" />}
        primary={true}
        onTouchTap={this.props.onRequestClose}
      />,
      <FlatButton
        label={<Translate message="EDITOR.EXTERNAL_COMP_DIALOG.CREATE_BUTTON" />}
        primary={true}
        onTouchTap={this.props.onApply}
      />,
    ];

    return (
      <Dialog
        title={<div><Translate message="EDITOR.EXTERNAL_COMP_DIALOG.TITLE" /></div>}
        open={this.props.open}
        onRequestClose={this.props.onRequestClose}
        actions={actions}
      >
        <SelectField
          floatingLabelText="Package"
          value={this.state.packageName}
          onChange={this.handlePackageChange}
        >
          {this.state.packages.map(pkg => (
            <MenuItem
              value={pkg.name}
              primaryText={pkg.name}
            />
          ))}
        </SelectField>
        <br />
        <TextField
          floatingLabelText={<Translate message="EDITOR.EXTERNAL_COMP_DIALOG.SELECTOR_LABEL" />}
          hintText={<Translate message="EDITOR.EXTERNAL_COMP_DIALOG.DEFAULT_EXPORT_HINT" />}
          onChange={this.handleSelectorChange}
        />
      </Dialog>
    );
  }

}

export default connect(state => ({ projectId: state.project.id }))(NewExternalCompDialog);