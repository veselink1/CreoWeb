import { Component, PureComponent } from 'react';
import { kebabCase, upperFirst } from 'lodash';
import { TYPES } from '~/utils/convert';
import ValEditor from '~/components/ValEditorV2';

if (typeof window !== 'undefined') {
  require("~/styles/style-editor.scss");
}

function userCase(string) {
  return kebabCase(string)
    .split('-')
    .map(upperFirst)
    .join(' ');
}

export default class StyleEditor extends Component {

  shouldComponentUpdate(nextProps) {
    return this.props.config !== nextProps.config
      || this.props.values !== nextProps.values;
  }

  render() {
    if (typeof window !== 'object') {
      return null;
    }
    const {
      config, values, onChange
    } = this.props;
    return this.template({ config, values, onChange });
  }

  template({ config, values, onChange }) {
    return (
      <div className="style-editor">
        <div className="style-editor-groups">
          {config.map((x, i) => {
            if ('css' in x && 'syntax' in x) {
              return (
                <Property
                  key={i}
                  value={values[x.css]}
                  editor={x.editor}
                  onChange={value => onChange(event.target, event, x.css, event.target.value)}
                  title={x.css}
                  syntax={x.syntax}
                />
              )
            } else if ('group' in x && 'properties' in x) {
              return (
                <PropertyGroup
                  key={i}
                  values={values}
                  onChange={onChange}
                  title={x.group}
                  properties={x.properties}
                />
              );
            } else {
              console.error("Unknown item type in <StyleEditor />");
              return "ERROR";
            }
          })}
        </div>
      </div>
    );
  }

}

function arraysEqual(xs, ys) {
  if (xs.length !== ys.length) {
    return false;
  }
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] !== ys[i]) {
      return false;
    }
  }
  return true;
}

class PropertyGroup extends Component {

  shouldComponentUpdate(nextProps) {
    return this.props.title !== nextProps.title
      || this.props.properties !== nextProps.properties
      || !arraysEqual(this.props.properties.map(x => this.props.values[x.css]),
        nextProps.properties.map(x => nextProps.values[x.css]));
  }

  render() {
    const {
      title, properties, values, onChange
    } = this.props;
    return this.template({ title, properties, values, onChange });
  }

  template({ title, properties, values, onChange }) {
    return (
      <div className="style-editor-property-group">
        <header className="style-editor-property-group-title"> {userCase(title)} </header>
        <div className="style-editor-properties">
          {properties.map((x, i) => {
            if ('css' in x && 'syntax' in x) {
              return (
                <Property
                  key={i}
                  value={values[x.css]}
                  onChange={event => onChange.call(event.target, event, x.css, event.target.value)}
                  title={x.css}
                  syntax={x.syntax}
                  editor={x.editor}
                />
              )
            } else if ('group' in x && 'properties' in x) {
              return (
                <PropertyGroup
                  key={i}
                  values={values}
                  onChange={onChange}
                  title={x.group}
                  properties={x.properties}
                />
              )
            } else {
              console.error("Unknown item type in <PropertyGroup />");
              return "ERROR";
            }
          })}
        </div>
      </div>
    );
  }
}

class Property extends Component {

  shouldComponentUpdate(nextProps) {
    return this.props.title !== nextProps.title
      || this.props.syntax !== nextProps.syntax
      || this.props.value !== nextProps.value;
  }

  render() {
    const {
          title, syntax, value, onChange, editor
    } = this.props;
    return this.template({
      title,
      syntax,
      value,
      onChange,
      editor
    });
  }

  template({ title, syntax, value, onChange, editor }) {
    if (editor) {
      switch (editor) {
        case TYPES.COLOR:
          return (
            <div className="style-editor-property pure-g">
              <header className="style-editor-property-title pure-u-1-3"> {userCase(title)} </header>
              <div className="style-editor-property-editor pure-u-2-3">
                <ValEditor
                  value={value}
                  type={editor}
                  onChange={value => {
                    const target = Object.create(HTMLElement.prototype);
                    Object.defineProperty(target, 'value', {
                      value: value,
                    });

                    const event = Object.create(Event.prototype);
                    Object.defineProperty(event, 'target', {
                      value: target,
                    });

                    onChange(event);
                  }}
                />
              </div>
            </div>
          );
        default:
          return "ERROR";
      }
    } else {
      return (
        <div className="style-editor-property pure-g">
          <header className="style-editor-property-title pure-u-1-3"> {userCase(title)} </header>
          <div className="style-editor-property-editor pure-u-2-3">
            <input
              className="style-editor-property-input"
              value={value || null}
              onChange={onChange}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false} />
            <SyntaxDropdown
              value={value || null}
              onChange={onChange}
              options={syntax}
            />
          </div>
        </div>
      );
    }
  }
}


class SyntaxDropdown extends PureComponent {

  render() {
    return this.template({ options: this.props.options, value: this.props.value, onChange: this.props.onChange });
  }

  template({ value, options, onChange }) {
    if (options.length === 0) {
      return (
        <select value={value} onChange={onChange} tabIndex={-1}>
          <Syntax value="initial" />;
        </select>
      );
    }

    return (
      <select value={value} onChange={onChange} tabIndex={-1}>
        {options.map((x, i) => {
          if ('group' in x && 'values' in x) {
            return <SyntaxGroup key={i} title={x.group} values={x.values} />;
          } else if ('value' in x) {
            return <Syntax key={i} value={x.value} />;
          } else {
            return "ERROR";
          }
        })}
      </select>
    );
  }
}


class Syntax extends PureComponent {

  render() {
    return this.template({ value: this.props.value });
  }

  template({ value }) {
    return (
      <option
        value={value}>
        {value}
      </option>
    );
  }
}

class SyntaxGroup extends PureComponent {

  render() {
    return this.template({ title: this.props.title, values: this.props.values });
  }

  template({ title, values }) {
    return (
      <optgroup
        label={userCase(title)}>
        {values.map((x, i) => (
          <Syntax key={i} value={x.value} />
        ))}
      </optgroup>
    );
  }
}