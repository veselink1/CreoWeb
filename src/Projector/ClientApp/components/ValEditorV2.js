import { PureComponent, PropTypes } from 'react';
import { combineShallow, combine } from '~/utils/objectUtils';
import { TextField, SelectField, MenuItem, IconButton, Chip, AutoComplete } from 'material-ui';
import TypePicker from './TypePickerV2';
import { TYPES, typeOf, defaultForType, friendlyTypeName, createBinding } from '~/utils/convert';
import HKArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import HKArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import CAddBox from 'material-ui/svg-icons/content/add-box';
import guid from '~/utils/guid';
import { rawJs, isRawJs, extractJsFromRaw } from '~/utils/irdom';
import Reorder from 'react-reorder';
import EditorDragHandle from 'material-ui/svg-icons/editor/drag-handle';
import { isEqual } from 'lodash';
import { ChromePicker } from 'react-color';
import StyleEditor from './StyleEditor';
import styleConfig from '~/data/element-properties/style-config';

if (typeof window !== 'undefined') {
  require('~/styles/val-editor-v2.scss');
}

export default class ValEditor extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      newProperty: '',
      uniqueId: guid(),
      newPropertyDataSource: []
    };
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleExpand = this.handleExpand.bind(this);
    this.handleAddProperty = this.handleAddProperty.bind(this);
    this.handleUpdateKeySource = this.handleUpdateKeySource.bind(this);
    this.handleColorChangeComplete = this.handleColorChangeComplete.bind(this);
  }

  get editors() {
    return {
      [TYPES.STRING]: this.renderStringEditor,
      [TYPES.NUMBER]: this.renderNumberEditor,
      [TYPES.OBJECT]: this.renderObjectEditor,
      [TYPES.NULL]: this.renderNullEditor,
      [TYPES.ARRAY]: this.renderArrayEditor,
      [TYPES.BOOLEAN]: this.renderBooleanEditor,
      [TYPES.DYNAMIC]: this.renderDynamicEditor,
      [TYPES.COLOR]: this.renderColorEditor,
      [TYPES.STYLE]: this.renderStyleEditor,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(this.state, nextState)) {
      return true;
    }
    if (typeof nextProps.value === 'object' && typeof this.props.value === 'object') {
      const oldKeys = Object.keys(this.props);
      const newKeys = Object.keys(nextProps);
      if (oldKeys.length !== newKeys.length) {
        return true;
      }
      for (let i = 0; i < oldKeys.length; i++) {
        const key = oldKeys[i];
        if (this.props[key] !== nextProps[key]) {
          return true;
        }
      }
      return false;
    } else if (nextProps.value !== this.props.value) {
      return true;
    } else {
      return this.props.type !== nextProps.type;
    }
  }

  handleValueChange(value) {
    this.props.onChange && this.props.onChange(value);
  }

  render() {
    let type = this.props.type;
    let renderEditor = this.editors[type];
    let children = null;
    try {
      children = renderEditor.call(this);
    } catch (e) {
      children = "An unexpected error occurred.";
      console.error("Error in ValEditor.", e);
    }
    return (
      <div className="val-editor">
        {children}
      </div>
    );
  }

  renderStringEditor() {
    return (
      <div className="string-editor">
        <TextField
          type="text"
          name={this.state.uniqueId}
          fullWidth={true}
          multiLine={true}
          value={this.props.value}
          onChange={e => this.handleValueChange(e.target.value)}
        />
      </div>
    );
  }

  renderNumberEditor() {
    return (
      <div className="number-editor">
        <TextField
          type="number"
          name={this.state.uniqueId}
          fullWidth={true}
          value={this.props.value}
          onChange={e => this.handleValueChange(Number(e.target.value))}
        />
      </div>
    );
  }

  handleColorChangeComplete(color) {
    const cssValue = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
    this.handleValueChange(cssValue);
  }

  renderColorEditor() {
    return (
      <div className="color-editor">
        <ChromePicker
          color={this.props.value}
          onChangeComplete={this.handleColorChangeComplete}
        />
      </div>
    );
  }

  handleExpand(key) {
    this.setState({ expanded: Object.assign({}, this.state.expanded, { [key]: !this.state.expanded[key] }) });
  }

  handleAddProperty() {
    let key = this.state.newProperty;
    if (!key.trim()) {
      this.setState({ newPropertyErrorText: 'Property name cannot be empty.' });
      return;
    }
    this.setState({ newProperty: '' })
    this.handleValueChange(combine(this.props.value, { [key]: { value: '', type: TYPES.STRING, } }));
    this.forceUpdate();
  }

  handleRequestDelete(prop) {
    let clone = combineShallow(this.props.value);
    delete clone[prop];
    this.handleValueChange(clone);
  }

  handleUpdateKeySource(value) {
    this.setState({ newProperty: value, newPropertyErrorText: null });
    if (value.length >= 3) {
      let used = Object.keys(this.props.value);
      let suggested = this.props.suggest
        ? this.props.suggest(value)
          .map(key => [key, key.indexOf(value)])
          .filter(([key, index]) => index !== -1 && used.indexOf(key) === -1)
          .sort(([keyA, indexA], [keyB, indexB]) => indexA === indexB ? keyA.length - keyB.length : indexA - indexB)
          .map(([key, index]) => key)
        : [];
      this.setState({
        newPropertyDataSource: suggested
      });
    } else if (this.state.newPropertyDataSource.length > 0) {
      this.setState({
        newPropertyDataSource: [],
      });
    }
  }

  renderObjectEditor() {
    const chipStyle = {
      fontFamily: "'Fira Mono', monospace",
    };
    return (
      <div className="object-editor">
        {!(this.props.topPropAddition === false)
          ? <div className="add-property">
            <div className="text-field">
              <AutoComplete
                hintText="new property"
                errorText={this.state.newPropertyErrorText}
                textFieldStyle={chipStyle}
                fullWidth={true}
                value={this.state.newProperty}
                dataSource={this.state.newPropertyDataSource}
                onUpdateInput={this.handleUpdateKeySource}
              />
            </div>
            <div className="button">
              <IconButton
                tooltip="Add"
                onClick={this.handleAddProperty}
              >
                <CAddBox />
              </IconButton>
            </div>
          </div>
          : null
        }
        {Object.keys(this.props.value)
          .sort()
          .map(key => {
            return (
              <div key={key} className={`property ${this.props.value[key].type.toLowerCase()}-property ${(this.props.value[key].type === TYPES.OBJECT || this.props.value[key].type === TYPES.ARRAY || this.props.value[key].type === TYPES.STYLE) && !this.state.expanded[key] ? 'collapsed' : ''}`}>
                <div className="key">
                  <Chip labelStyle={chipStyle} onRequestDelete={() => this.handleRequestDelete(key)}> {key} </Chip>
                </div>
                <div className="type">
                  <TypePicker
                    value={this.props.value[key].type}
                    onChange={newType =>
                      this.handleValueChange(combineShallow(this.props.value, { [key]: { value: defaultForType(newType), type: newType } }))
                    }
                  />
                </div>
                {this.props.value[key].type === TYPES.OBJECT
                  ? <div className="toggle">
                    <IconButton tooltip="Expand object properties." onClick={this.handleExpand.bind(this, key)}>
                      {this.state.expanded[key]
                        ? <HKArrowUp />
                        : <HKArrowDown />
                      }
                    </IconButton>
                  </div>
                  : null
                }
                {this.props.value[key].type === TYPES.STYLE
                  ? <div className="toggle">
                    <IconButton tooltip="Expand style properties." onClick={this.handleExpand.bind(this, key)}>
                      {this.state.expanded[key]
                        ? <HKArrowUp />
                        : <HKArrowDown />
                      }
                    </IconButton>
                  </div>
                  : null
                }
                {this.props.value[key].type === TYPES.ARRAY
                  ? <div className="toggle">
                    <IconButton tooltip="Expand array items." onClick={this.handleExpand.bind(this, key)}>
                      {this.state.expanded[key]
                        ? <HKArrowUp />
                        : <HKArrowDown />
                      }
                    </IconButton>
                  </div>
                  : null
                }
                <div className="value">
                  <ValEditor
                    value={this.props.value[key].value}
                    type={this.props.value[key].type}
                    onChange={newValue =>
                      this.handleValueChange(combineShallow(this.props.value, { [key]: { value: newValue, type: this.props.value[key].type } }))
                    }
                    suggest={this.props.suggest ? path => this.props.suggest(key + '.' + path) : null}
                  />
                </div>
              </div>
            );
          })
        }
      </div>
    );
  }

  renderNullEditor() {
    return (
      <div className="null-editor">
      </div>
    );
  }

  renderBooleanEditor() {
    return (
      <div className="boolean-editor">
        <SelectField
          fullWidth={true}
          value={this.props.value}
          onChange={e =>
            this.handleValueChange(e.target.value === true || e.target.value === 'true')}
        >
          <MenuItem value={true} primaryText="true" />
          <MenuItem value={false} primaryText="false" />
        </SelectField>
      </div>
    );
  }

  renderDynamicEditor() {
    return (
      <div className="dynamic-editor">
        <ValEditor
          value={extractJsFromRaw(this.props.value)}
          type={TYPES.STRING}
          onChange={val => this.handleValueChange(rawJs(val))}
        />
      </div>
    );
  }

  renderStyleEditor() {
    return (
      <StyleEditor
        config={styleConfig}
        values={this.props.value}
        onChange={(event, css, value) => {
          const oldValue = this.props.value;
          const newValue = Object.assign({}, oldValue, { [css]: value });
          this.handleValueChange(newValue);
        }}
      />
    );
  }

  handleAddItem() {
    let newArray = this.props.value.slice();
    newArray.push('');
    this.handleValueChange(newArray);
  }

  handleRequestSplice(index) {
    let newArray = this.props.value.slice();
    newArray.splice(index, 1);
    this.handleValueChange(newArray);
  }

  handleItemTypeChange(index, newType) {
    const newArray = this.props.value.slice();
    newArray[index] = defaultForType(newType);
    this.handleValueChange(newArray);
  }

  handleItemValueChange(index, newValue) {
    const newArray = this.props.value.slice();
    newArray[index] = newValue;
    this.handleValueChange(newArray);
  }

  reorderCallback(event, itemThatHasBeenMoved, itemsPreviousIndex, itemsNewIndex, reorderedArray) {
    this.handleValueChange(reorderedArray.map(x => x.value));
  }

  renderArrayEditor() {
    return this.editors[TYPES.OBJECT].call(this);
    /*return (
      <div className="array-editor">
        {!(this.props.topPropAddition === false)
          ? <div className="add-item">
            <div className="button">
              <IconButton
                onClick={() => this.handleAddItem()}
              >
                <CAddBox />
              </IconButton>
            </div>
          </div>
          : null
        }
        <Reorder
          // The key of each object in your list to use as the element key
          itemKey="key"
          // Lock horizontal to have a vertical list
          lock="horizontal"
          // The milliseconds to hold an item for before dragging begins
          holdTime="200"
          // The list to display
          list={this.props.value.map((x, i) => ({ value: x.value, type: x.type, key: i }))}
          // A template to display for each list item
          template={({ item: {value, type, key} }) => (
            <div key={key} className={`property ${this.props.type.toLowerCase()}-property ${type === TYPES.OBJECT && !this.state.expanded[key] ? 'collapsed' : ''}`}>
              <div className="key">
                <Chip onRequestDelete={this.handleRequestSplice.bind(this, key)}> {key} </Chip>
              </div>
              <div className="type">
                <TypePicker
                  type={type}
                  onChange={this.handleItemTypeChange.bind(this, key)}
                />
              </div>
              <div className="toggle">
                <IconButton
                  tooltip="Move"
                  disableTouchRipple={true}
                  disableFocusRipple={true}
                  disableKeyboardFocus={true}
                  style={{ cursor: 'n-resize' }}
                  iconStyle={{ color: "#b3b3b3" }}>
                  <EditorDragHandle />
                </IconButton>
              </div>
              {type === TYPES.OBJECT
                ? <div className="toggle">
                  <IconButton tooltip="Expand list items." onClick={this.handleExpand.bind(this, key)}>
                    {this.state.expanded[key]
                      ? <HKArrowUp />
                      : <HKArrowDown />
                    }
                  </IconButton>
                </div>
                : null
              }
              <div className="value">
                <ValEditor
                  value={value}
                  type={type}
                  onChange={this.handleItemValueChange.bind(this, key)}
                />
              </div>
            </div>
          )}
          // Function that is called once a reorder has been performed
          callback={this.reorderCallback.bind(this)}
          // Class to be applied to the outer list element
          listClass="reorder-list"
          // The item to be selected (adds 'selected' class)
          selected={this.state.selected}
          // The key to compare from the selected item object with each item object
          selectedKey="id"
          // Allows reordering to be disabled
          disableReorder={false} />
      </div>
    );
    */
  }

}

ValEditor.propTypes = {
  value: PropTypes.any.isRequired,
  type: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  topLevelType: PropTypes.bool,
  topPropAddition: PropTypes.bool,
};