import { PureComponent, PropTypes } from 'react';
import classNames from 'classnames';

typeof window !== 'undefined'
  && require('../styles/expandable-menu.scss');

/**
 * Creates an expandable menu. Check the propTypes for more info.
 */
export default class ExpandableMenu extends PureComponent {

  constructor(props) {
    super(props);
    this.state = { expanded: props.expanded === true }
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    return (
      <div
        {..._.omit(this.props, [Object.keys(ExpandableMenu.propTypes)])}
        className={classNames(
          "expandable-menu",
          this.state.expanded ? 'expandable-menu-expanded' : 'expandable-menu-collapsed',
          this.props.className)
        }>
        <div className="expandable-menu-header">
          <span className="expandable-menu-toggle" onClick={this.handleClick}>
            {this.state.expanded ? this.props.toggleExpanded : this.props.toggleCollapsed}
          </span>
          <span className="expandable-menu-title">
            {this.props.title}
          </span>
        </div>
        <div className="expandable-menu-items">
          {this.props.children.map((item, i) => (
            <div key={i} className="expandable-menu-item">
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

}

ExpandableMenu.propTypes = {
  toggleExpanded: PropTypes.node.isRequired,
  toggleCollapsed: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  expanded: PropTypes.bool,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  className: PropTypes.string,
};