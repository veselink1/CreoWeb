import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { } from 'material-ui';
import { editorInterface } from '~/reducers/editor';
import { getActiveEditor } from '~/reducers/project';

typeof window !== 'undefined'
  && require('~/styles/error-viewer.scss');

export default connect(state => ({ editor: getActiveEditor(state.project) }))(class ErrorViewerPanel extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    if (editorInterface(this.props.editor).logs !== editorInterface(nextProps.editor).logs) {
      if (this.errorViewer) {
        this.errorViewer.scrollTop = this.errorViewer.scrollHeight;
      }
    }
  }

  render() {
    let editor = editorInterface(this.props.editor);
    return (
      <div className="error-viewer" ref={x => this.errorViewer = x}>
        <div className="error-list">
          {editor.logs.map(log =>
            log.isError ?
              <Error
                key={log.timestamp}
                timestamp={log.timestamp}
                message={log.message} />
              :
              <Success
                key={log.timestamp}
                timestamp={log.timestamp}
                message={log.message} />
          )}
        </div>
      </div>
    );
  }
});

const Error = ({ message, timestamp }) => (
  <div className="error">
    <div className="timestamp">
      {new Date(timestamp).toLocaleTimeString()}
    </div>
    <div className="message">
      {message}
    </div>
  </div>
);

const Success = ({ message, timestamp }) => (
  <div className="success">
    <div className="timestamp">
      {new Date(timestamp).toLocaleTimeString()}
    </div>
    <div className="message">
      {message}
    </div>
  </div>
);