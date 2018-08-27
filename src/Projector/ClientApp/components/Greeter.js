import { PureComponent, PropTypes } from 'react';
import { RaisedButton, FlatButton, Dialog, Subheader } from 'material-ui';
import { random } from 'lodash';
import Translate, { translateMessage, addTranslationContext } from '~/components/Translate';

export default class Greeter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      screenIndex: random(props.screens.length - 1),
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleShowNext = this.handleShowNext.bind(this);
    this.handleDontShowAgain = this.handleDontShowAgain.bind(this);
  }

  get dontShowGreeterKey() {
    return 'dont_show_' + this.props.scope.toLowerCase() + '_greeter';
  }

  componentDidMount() {
    const dontShowGreeter = this.dontShowGreeterKey;
    let skipCount = Number(localStorage.getItem(dontShowGreeter));
    localStorage.setItem(dontShowGreeter, Math.max(0, skipCount - 1));
    this.setState({ open: skipCount < 1 });
  }

  handleClose() {
    this.setState({ open: false });
  }

  handleShowNext() {
    const isLastIndex = (arr, i) => arr.length - 1 === i;
    let nextIndex = isLastIndex(this.props.screens, this.state.screenIndex) ? 0 : this.state.screenIndex + 1;
    this.setState({ screenIndex: nextIndex });
  }

  handleDontShowAgain() {
    this.handleClose();
    localStorage.setItem(this.dontShowGreeterKey, 10);
  }

  render() {
    const actions = [
      <FlatButton
        label="Never show"
        secondary={true}
        onClick={this.handleDontShowAgain}
        />,
      <RaisedButton
        label="Next"
        primary={true}
        onClick={this.handleShowNext}
        />,
      <FlatButton
        label="Close"
        primary={true}
        onClick={this.handleClose}
        />,
    ];

    const screen = this.props.screens[this.state.screenIndex];

    return (
      <Dialog
        title={this.props.title}
        actions={actions}
        modal={false}
        open={this.state.open}
        autoScrollBodyContent={true}
        onRequestClose={this.handleClose}
        >
        <Subheader>
          {translateMessage(this.context.translationContext, screen.title)}
        </Subheader>
        {screen.image ? (
          <div className="image"
            style={{
              backgroundImage: `url('${screen.image}')`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              height: '18em',
              marginBottom: '1em',
            }}
            />
        ) : null}
        <div className="content">
          {translateMessage(this.context.translationContext, screen.content)}
        </div>
      </Dialog>
    );
  }
}

addTranslationContext(Greeter);

Greeter.propTypes = {
  scope: PropTypes.string.isRequired,
  title: PropTypes.string,
  screens: PropTypes.array.isRequired,
};