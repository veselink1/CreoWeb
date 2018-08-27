import { PureComponent, PropTypes } from 'react';
import { IconButton } from 'material-ui';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import ContentAdd from 'material-ui/svg-icons/content/add';

export default class TabularEditor extends PureComponent {

  constructor(props) {
    super(props);
    this.handleAdd = this.handleAdd.bind(this);
  }

  createEmpty() {
    const object = {};
    const layout = this.props.layout;

    for (let key in layout) {
      if (Object.prototype.hasOwnProperty.call(layout, key)) {
        object[key] = layout[key].initialValue;
      }
    }

    return object;
  }

  handleAdd() {
    const values = this.props.values.slice();
    values.push(this.createEmpty());
    this.props.onChange && this.props.onChange(values);
  }

  render() {
    const layout = this.props.layout;
    const values = this.props.values;

    const columnConfig = Object.keys(layout)
      .map(x => [x, layout[x]])
      .sort(([keyA, configA], [keyB, configB]) => configA.index - configB.index);

    const headerColumns = [];
    const valueColumns = [];

    for (let [key, config] of columnConfig) {
      const { initialValue, renderHeader } = config;
      headerColumns.push(
        <TableHeaderColumn key={key}>
          {renderHeader({ initialValue: initialValue })}
        </TableHeaderColumn>
      );
    }

    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const columns = [];
      for (let [key, config] of columnConfig) {
        const { initialValue, renderCell } = config;
        const onChange = newValue => {
          const values = this.props.values.slice();
          values[i] = Object.assign({}, values[i], {
            [key]: newValue
          });
          this.props.onChange && this.props.onChange(values);
        };
        columns.push(
          <TableRowColumn key={key}>
            {renderCell({ index: i, value: value[key], onChange: onChange })}
          </TableRowColumn>
        );
      }
      valueColumns.push(columns);
    }

    const addRowFill = [];
    for (let i = 0; i < columnConfig.length - 1; i++) {
      addRowFill.push(
        <TableRowColumn key={i} />
      );
    }

    return (
      <Table selectable={false}>
        <TableHeader
          displaySelectAll={false}
          adjustForCheckbox={false}>
          <TableRow>
            {headerColumns}
          </TableRow>
        </TableHeader>
        <TableBody
          displaySelectAll={false}
          adjustForCheckbox={false}
          displayRowCheckbox={false}>
          {valueColumns.map((columns, index) => (
            <TableRow key={index}> {columns} </TableRow>
          ))}
          <TableRow>
            {addRowFill}
            <TableRowColumn>
              <IconButton onClick={this.handleAdd}>
                <ContentAdd />
              </IconButton>
            </TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

}

TabularEditor.propTypes = {
  layout: PropTypes.object.isRequired,
  values: PropTypes.array,
  onChange: PropTypes.func,
};

TabularEditor.defaultProps = {
  values: [],
  onChange: null,
};