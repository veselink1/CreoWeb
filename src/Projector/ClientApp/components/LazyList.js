import { PureComponent, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

/**
 * Creates a list of items which are lazily rendered according to a projecting function.
 */
export default class LazyList extends PureComponent {

  constructor(props) {
    super(props);
    this.state = { scrollTop: 0 };
  }

  renderItems() {
    const scrollTop = this.state.scrollTop;
    const itemHeight = this.props.itemHeight;
    const height = this.props.height;
    const renderItem = this.props.renderItem;
    const itemCount = this.props.itemCount;
    const totalHeight = itemHeight * itemCount;

    const visibleItemCount = Math.min(Math.ceil(height / itemHeight) + 2, itemCount);
    const offsetItemCount = Math.max(Math.floor(scrollTop / itemHeight) - 1, 0);
    const lastItemIndex = Math.min(offsetItemCount + visibleItemCount, itemCount);

    const items = [];
    for (let i = 0; i < offsetItemCount; i++) {
      items.push(<Placeholder itemHeight={itemHeight} key={i} />);
    }
    for (let i = offsetItemCount; i < lastItemIndex; i++) {
      items.push(renderItem(i));
    }
    for (let i = lastItemIndex; i < itemCount; i++) {
      items.push(<Placeholder itemHeight={itemHeight} key={i} />);
    }

    return items;
  }

  componentDidMount() {
    let container = findDOMNode(this);
    let updateScroll = () => {
      this.setState({ scrollTop: container.scrollTop });
    };
    updateScroll();
    let listener = container.addEventListener('scroll', updateScroll);
    this.disposeListener = container.removeEventListener.bind(container, 'scroll', listener);
  }

  componentWillUnmount() {
    this.disposeListener();
  }

  render() {
    const Container = this.props.container || DefaultContainer;
    return (
      <Container style={{ height: this.props.height + 'px', overflowY: 'auto' }}>
        {this.renderItems()}
      </Container>
    );
  }

}

function Placeholder({ itemHeight }) {
  return <div className="item-placeholder" style={{ width: '100%', height: itemHeight + 'px' }} />
}

function DefaultContainer({ children, style }) {
  return <div className="lazy-list-container" style={style}>{children}</div>;
}

LazyList.propTypes = {
  container: PropTypes.func,
  height: PropTypes.number.isRequired,
  itemHeight: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  renderItem: PropTypes.func.isRequired,
};