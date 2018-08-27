import PageBase from './PageBase';
import { Paper, RaisedButton, TextField, Snackbar, Checkbox, FloatingActionButton, LinearProgress } from 'material-ui';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { updateStateKey } from '~/utils/reactUtils';
import { loginUser } from '~/reducers/auth';
import { getPasswordErrorText, getEmailErrorText } from '~/utils/validate';
import Translate, { translateMessage, addTranslationContext } from '~/components/Translate';
import { getRequestParams } from '~/utils/requests';

typeof window !== 'undefined'
  && require('~/styles/login-page.scss');

export class LoginPage extends PageBase {

  constructor(props) {
    super(props, { isImmersive: false, backgroundStyle: 'url("/img/bg/login-bg.jpg") center/cover', title: "Login" });
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { email: "", emailChanged: false, password: "", passwordChanged: false };
  }

  handleSubmit() {
    this.props.dispatch(loginUser(this.state.email, this.state.password));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      const params = getRequestParams();
      if ('ReturnUrl' in params) {
        const url = params['ReturnUrl'];
        this.context.router.replace(url);
      } else {
        this.context.router.replace('/Dashboard');
      }
    }
  }

  renderPageContent() {
    const auth = this.props.auth;
    const translate = translateMessage.bind(null, this.context.translationContext);
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div className="login-page">
          <Card className="login-paper" zDepth={1}>
            <form onSubmit={e => e.preventDefault()}>
              <Link to="/Signup" className="fab-signup">
                <FloatingActionButton secondary={true} zDepth={2}>
                  <ContentAdd />
                </FloatingActionButton>
              </Link>
              <CardHeader title={<Translate message="LOGIN.LOGIN_HEADER" />} titleStyle={{ fontSize: '1.8em' }} />
              <CardText className="login-form">
                <TextField
                  type="email"
                  fullWidth={true}
                  hintText={translate("LOGIN.EMAIL_LABEL")}
                  floatingLabelText={translate("LOGIN.EMAIL_LABEL")}
                  value={this.state.email}
                  errorText={this.state.emailChanged ? translate(getEmailErrorText(this.state.email)) : null}
                  onChange={e => this.setState({ email: e.target.value, emailChanged: true })} />
                <br />
                <TextField
                  type="password"
                  fullWidth={true}
                  hintText={translate("LOGIN.PASSWORD_LABEL")}
                  floatingLabelText={translate("LOGIN.PASSWORD_LABEL")}
                  value={this.state.password}
                  errorText={this.state.passwordChanged ? translate(getPasswordErrorText(this.state.password)) : null}
                  onChange={e => this.setState({ password: e.target.value, passwordChanged: true })} />
                <br />
              </CardText>
              <CardActions>
                <Checkbox defaultChecked={true} label={translate("LOGIN.REMEMBER_ME")} className="remember-me" />
                <RaisedButton
                  type="submit"
                  fullWidth={true}
                  label={translate("LOGIN.LOGIN_BUTTON")}
                  primary={true}
                  disabled={this.props.auth.isFetching || !!getEmailErrorText(this.state.email) || !!translate(getPasswordErrorText(this.state.password))}
                  onClick={this.handleSubmit}
                  style={{ margin: '4px' }} />
              </CardActions>
            </form>
          </Card>
        </div>
        <Snackbar
          open={!auth.isFetching && !auth.isAuthenticated && !!auth.errorMessage}
          action="OK"
          message={auth.errorMessage || ''}
          autoHideDuration={4000}
          />
      </div>
    );
  }

}

LoginPage.contextTypes = Link.contextTypes;
addTranslationContext(LoginPage);

export default connect(state => ({ auth: state.auth }))(LoginPage);

