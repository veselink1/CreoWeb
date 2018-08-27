import { PureComponent, PropTypes } from 'react';
import { SelectField, MenuItem } from 'material-ui';
import { combineShallow } from '~/utils/objectUtils';
import { rawJs, isRawJs, extractJsFromRaw } from '~/utils/irdom';
import { TYPES, typeOf, defaultForType, friendlyTypeName } from '~/utils/convert';

if (typeof window !== 'undefined') {
  require('~/styles/type-picker.scss');
}

export default class TypePicker extends PureComponent {

  constructor(props) {
    super(props);
    this.handleTypeChange = this.handleTypeChange.bind(this);
  }

  handleTypeChange(value) {
    this.props.onChange && this.props.onChange(value);
  }

  render() {
    const typeItemStyle = {
      fontFamily: "'Fira Mono', monospace",
    };
    return (
      <div className="type-picker" style={this.props.style}>
        <SelectField
          fullWidth={true}
          value={this.props.value}
          onChange={(e, i, v) => this.handleTypeChange(v)}
          labelStyle={typeItemStyle}
        >
          {Object.keys(this.props.types)
            .sort((x, y) => this.props.friendlyTypeName(x).length > this.props.friendlyTypeName(y).length)
            .map(key => (
              <MenuItem
                key={key}
                value={this.props.types[key]}
                primaryText={this.props.friendlyTypeName(this.props.types[key])}
                style={typeItemStyle} 
              />
            ))}
        </SelectField>
      </div>
    );
  }

}

TypePicker.defaultProps = {
  types: TYPES,
  friendlyTypeName: friendlyTypeName,
}

TypePicker.propTypes = {
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func,
};