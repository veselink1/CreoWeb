import { PureComponent, PropTypes } from 'react';
import { RaisedButton, FlatButton, Dialog, Subheader, IconButton } from 'material-ui';
import { random } from 'lodash';
import Translate, { translateMessage, addTranslationContext } from '~/components/Translate';
import ActionHelp from 'material-ui/svg-icons/action/help-outline';

export default class HelpLink extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.handleRequestOpen = this.handleRequestOpen.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  handleRequestOpen() {
    this.setState({ open: true });
  }

  handleRequestClose() {
    this.setState({ open: false });
  }

  render() {
    const actions = [
      <FlatButton
        label={translateMessage(this.context.translationContext, 'HELP_DIALOG.CLOSE_BUTTON')}
        primary={true}
        onClick={this.handleRequestClose}
        />,
    ];

    return (
      <div className={this.props.className}>
        <FlatButton
          style={{ width: '100%' }}
          label={this.props.label}
          icon={<ActionHelp color="black" />}
          onClick={this.handleRequestOpen}
        />
        <Dialog
          title={translateMessage(this.context.translationContext, 'HELP_DIALOG.TITLE')}
          actions={actions}
          modal={false}
          open={this.state.open}
          autoScrollBodyContent={true}
          onRequestClose={this.handleRequestClose}
          >
          <Subheader>
            {this.props.title}
          </Subheader>
            {this.props.image ? (
              <div className="image"
                style={{
                  backgroundImage: `url('${this.props.image}')`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  height: '18em',
                  marginBottom: '1em',
                }}
                />
            ) : null}
          <div className="content">
            {this.props.content}
          </div>
        </Dialog>
      </div>
    );
  }
}

addTranslationContext(HelpLink);

HelpLink.propTypes = {
  label: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  image: PropTypes.string,
};