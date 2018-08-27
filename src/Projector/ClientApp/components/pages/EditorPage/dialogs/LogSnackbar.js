import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Snackbar } from 'material-ui';
import { editorInterface } from '~/reducers/editor';
import { getActiveEditor } from '~/reducers/project';

class EditorSnackbar extends PureComponent {
  constructor(props) {
    super(props);

    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.state = {
      open: false,
      message: '',
    };
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  componentWillReceiveProps(nextProps) {
    const oldEditor = editorInterface(this.props.editor);
    const newEditor = editorInterface(nextProps.editor);
    if (oldEditor.logs.length !== newEditor.logs.length && newEditor.logs.length > 0) {
      const lastLog = newEditor.logs[newEditor.logs.length - 1];
      this.setState({
        open: true,
        message: lastLog.message,
      });
    }
  }

  render() {
    return (
      <Snackbar
        open={this.state.open}
        message={this.state.message}
        action="dismiss"
        autoHideDuration={4000 /* ms */}
        onActionTouchTap={this.handleRequestClose}
        onRequestClose={this.handleRequestClose}
      />
    );
  }
}

export default connect(state => ({ editor: getActiveEditor(state.project) }))(EditorSnackbar);