import { PureComponent, PropTypes } from 'react';
import * as _ from 'lodash';

// Public API is at https://microsoft.github.io/monaco-editor/api/modules/monaco.editor.html

export default class MonacoEditor extends PureComponent {

  constructor(props) {
    super(props);
    this.handleContainerRef = this.handleContainerRef.bind(this);
    this.handleEditorContentChange = this.handleEditorContentChange.bind(this);

    let disposers = [];
    this.onDispose = f => {
      disposers.push(f);
    };
    this.handleDispose = () => {
      for (let d of disposers) {
        d.call(this);
      }
    };
    this.lastTextContent = null;
  }

  shouldComponentUpdate(nextProps) {
    return this.editor.getValue() !== nextProps.model[0]
      || !_.isEqual(this.props.model.slice(2), nextProps.model.slice(2));
  }

  componentWillUnmount() {
    this.handleDispose();
  }

  componentWillReceiveProps(nextProps) {
    if (this.shouldComponentUpdate(nextProps)) {
      this.updateEditor(nextProps);
    }
  }

  handleEditorContentChange() {
    let text = this.editor.getValue();
    this.props.onChange && this.props.onChange(text);
  }

  createEditor(container) {
    let editor = this.monaco.create(container, { model: this.monaco.createModel(...this.props.model) });
    this.editor = editor;

    let disposeDidChange = editor.onDidChangeModelContent(this.handleEditorContentChange);

    // Update the editor dimensions when the container 
    // width or height changes.
    let lastWidth = container.scrollWidth;
    let lastHeight = container.scrollHeight;
    let intHandle = setInterval(() => {
      if (container.scrollWidth !== lastWidth
        || container.scrollHeight !== lastHeight) {
        editor.layout();
        lastWidth = container.scrollWidth;
        lastHeight = container.scrollHeight;
      }
    }, 100);
    // Clear the timeout on unmount.
    this.onDispose(() => {
      disposeDidChange.dispose();
      this.editor.dispose();
      clearInterval(intHandle);
    });
  }

  updateEditor(props) {
    if (this.editor) {
      let model = this.monaco.createModel(...props.model);
      this.editor.setModel(model);
    }
  }

  handleContainerRef(container) {
    if (!container) return null;
    this.container = container;
    window.onMonacoEditorLoad(monaco => {
      this.monaco = monaco;
      this.createEditor(container);
    });
  }

  render() {
    return (
      <div
        ref={this.handleContainerRef}
        style={{ width: '100%', height: '100%' }} />
    );
  }
}

MonacoEditor.propTypes = {
  model: PropTypes.array.isRequired,
}