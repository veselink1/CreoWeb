import { PureComponent, PropTypes } from 'react';
import { TextField, SelectField, MenuItem, RaisedButton, FloatingActionButton } from 'material-ui';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { updateStateKey } from '~/utils/reactUtils';
import { combineShallow, combineDeep } from '~/utils/objectUtils';
import { ChromePicker } from 'react-color';
import * as convert from '~/utils/convert';
import * as imm from 'immutable';
import * as IR from '~/utils/irdom';
import { updateNodeProps } from '~/reducers/editor';
const T = convert.TYPES;

typeof window !== 'undefined'
  && require('../styles/val-editor.scss');

/**
 * Represents a value editor which supports type conversion.
 */
export default class ValEditor extends PureComponent {

  constructor(props) {
    super(props);
  }

  notifyChange(value) {
    this.valueCache = value;
    this.props.onChange(value);
  }

  handleValueChange(newValue) {
    this.notifyChange(newValue);
  }

  render() {
    return (
      <div className="val-editor">
        {this.renderValueEditor()}
      </div>
    );
  }

  renderValueEditor() {
    switch (this.props.value.type) {
      case T.STRING:
        return this.renderStringEditor();
      case T.NUMBER:
        return this.renderNumberEditor();
      case T.BOOL:
        return this.renderBoolEditor();
      case T.ARRAY:
        return this.renderArrayEditor();
      case T.OBJECT:
        return this.renderObjectEditor();
      case T.IRTEXTNODE:
        return this.renderTextNodeEditor();
      case T.IRCOMPONENT:
        return this.renderComponentEditor();
      case T.COLOR:
        return this.renderColorEditor();
      case T.JS:
        return this.renderCodeEditor();
      default:
        return this.renderStringEditor();
    }
  }

  renderStringEditor() {
    return (
      <div className="string-editor">
        <TextField
          fullWidth={true}
          multiLine={true}
          name={this.props.labelPrefix}
          type="text"
          value={this.props.value}
          onChange={(e, v) => this.handleValueChange(v)}
          />
      </div>
    );
  }

  renderNumberEditor() {
    return (
      <div className="number-editor">
        <TextField
          fullWidth={true}
          name={this.props.labelPrefix}
          type="number"
          value={this.props.value}
          onChange={(e, v) => this.handleValueChange(convert.toType(T.NUMBER, v))}
          />
      </div>
    );
  }

  renderBoolEditor() {
    return (
      <SelectField
        fullWidth={true}
        className="bool-editor"
        style={{ top: '10px' }}
        value={!!this.props.value}
        onChange={(e, i, v) => this.handleValueChange(v)}>
        <MenuItem value={true} primaryText="true" />
        <MenuItem value={false} primaryText="false" />
      </SelectField>
    );
  }

  renderArrayEditor() {
    const value = this.props.value;
    if (this.props.focusIcon) {
      return this.props.focusIcon;
    }
    return (
      <div className="array-editor">
        {Object.keys(value).map(k => (
          <ValEditor
            key={k}
            type={value[k].type}
            value={value[k].value}
            labelPrefix={k}
            enableTypePicker={this.props.enableTypePicker === true}
            focusIcon={this.props.focusIcon}
            onChange={(val, typ) => {
              let oldArray = this.props.value;
              let newArray = imm.List(oldArray).set(k, val).toArray();
              this.notifyChange(newArray);
            } }
            />
        ))}
      </div>
    );
  }

  renderObjectEditor() {
    const value = this.props.value;
    if (this.props.focusIcon) {
      return this.props.focusIcon;
    }
    let updateProperty = (k, val) => {
      let value = _.merge({}, this.props.value, { [k]: val });
      this.notifyChange(value);
    };
    let Wrapper = this.props.childPropEditorContainer ? this.props.childPropEditorContainer : ({children}) => children;
    return (
      <div className="object-editor">
        {Object.keys(value).sort().map(k => (
          <Wrapper
            key={k}
            title={k}
            value={value[k]}
            updateProperty={updateProperty.bind(this, k)}
            children={
              <ValEditor
                value={value[k]}
                enableTypePicker={this.props.enableTypePicker === true}
                focusIcon={this.props.focusIcon}
                labelPrefix={k}
                onChange={updateProperty.bind(this, k)}
                />
            } />
        ))}
      </div>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.value !== nextProps.value && !_.isEqual(this.props, nextProps);
  }

  handleTextNodeChange(text) {
    text = _.escape(text);
    const newState = combineDeep(this.state, { value: { text } });
    this.setState(newState);
    this.handleValueChange(newState.value);
  }

  renderTextNodeEditor() {
    return (
      <div className="text-node-editor">
        <TextField
          fullWidth={true}
          name={this.props.labelPrefix}
          type="text"
          value={_.unescape(this.props.value.text)}
          onChange={(e, v) => this.handleTextNodeChange(v)}
          />
      </div>
    );
  }

  handleComponentChange(component, nextProps) {
    let newComp;
    if (component !== null) {
      newComp = combineDeep(this.props.value, { component });
    } else {
      newComp = combineDeep(this.props.value, { props: nextProps });
    }
    this.notifyChange(newComp.value);
  }

  renderComponentEditor() {
    return (
      <div className="component-editor">
        <TextField
          fullWidth={true}
          name={this.props.labelPrefix}
          value={this.props.value.component}
          onChange={(e, v) => this.handleComponentChange(v, null)}
          />
        <ValEditor
          value={this.props.value.props}
          onChange={nextProps => this.handleComponentChange(null, nextProps)}
          />
      </div>
    );
  }

  colorToRGBA(color) {
    return `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
  }

  renderColorEditor() {
    return (
      <div>
        <ChromePicker
          onChangeComplete={color => {
            this.setState({ value: color });
            this.notifyChange(this.colorToRGBA(color));
          } }
          color={this.props.value}
          />
      </div>
    );
  }

  renderCodeEditor() {
    return (
      <div className="code-editor">
        <TextField
          fullWidth={true}
          multiLine={true}
          name={this.props.labelPrefix}
          type="text"
          style={{ fontFamily: 'monospace' }}
          value={IR.extractJsFromRaw(this.props.value)}
          onChange={(e, v) => this.handleValueChange(IR.rawJs(v))}
          />
      </div>
    );
  }

}

ValEditor.PropTypes = {
  // Called when the value changes. 
  // Argument is the new value, converted to the specified type.
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any.isRequired,
  // The prefix of the label of the text field.
  labelPrefix: PropTypes.string,
  focusIcon: PropTypes.node,
};