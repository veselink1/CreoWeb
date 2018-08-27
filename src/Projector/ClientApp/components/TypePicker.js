import { PureComponent, PropTypes } from 'react';
import { SelectField, MenuItem } from 'material-ui';
import * as convert from '~/utils/convert';
const T = convert.TYPES;

typeof window !== 'undefined'
  && require('~/styles/val-editor.scss');

/**
 * Represents a type picker.
 */
export default class TypePicker extends PureComponent {

  constructor(props) {
    super(props);
  }

  notifyChange(type) {
    this.props.onChange(type);
  }

  render() {
    return (
      <div className="type-picker">
        <SelectField
          fullWidth={true}
          style={{ top: '2px' }}
          value={this.props.type}
          onChange={(e, i, v) => this.props.type !== v && this.notifyChange(v)}
          >
          {_.values(T)
            .sort((x, y) => convert.getUserTypeName(x).length > convert.getUserTypeName(y).length)
            .map((type, i) => (
            <MenuItem key={i} value={type} primaryText={convert.getUserTypeName(type)} />
          ))}
        </SelectField>
      </div>
    )
  }

}

TypePicker.propTypes = {
  // Called when the type changes. 
  // Argument is the new type.
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string
};