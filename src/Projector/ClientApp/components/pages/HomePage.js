import PageBase from './PageBase';
import { Paper, RaisedButton, FlatButton, AppBar, Chip, Avatar } from 'material-ui';
import { Card, CardActions, CardHeader, CardText, CardMedia, CardTitle } from 'material-ui/Card';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Translate from '~/components/Translate';
import { logoutUser } from '~/reducers/auth';
import NetworkEffectCanvas from '~/components/NetworkEffectCanvas';
import ActionPermIdentity from 'material-ui/svg-icons/action/perm-identity';
import LanguageMenu from '~/components/LanguageMenu';
import PageFooter from '~/components/PageFooter';

typeof window !== 'undefined'
  && require('~/styles/home-page.scss');
// This is the index page of the application.
export class HomePage extends PageBase {

  constructor(props) {
    super(props, { title: "Home", isImmersive: true });
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout() {
    this.props.dispatch(logoutUser());
  }

  renderPageContent() {
    return (
      <div className="home-page">
        <LanguageMenu className="language-menu" />
        <div className="showcase">
          <NetworkEffectCanvas className="canvas" />
          <div className="showcase-content">

            <div className="showcase-content-headings">
              <h1 className="home-title">CreoWeb</h1>
              <h3 className="home-subtitle"><Translate message="HOME.SHOWCASE_SUBTITLE" /></h3>
              <h4 className="home-description"><Translate message="HOME.SHOWCASE_DESCRIPTION" /></h4>
            </div>

            <div className="showcase-content-userinfo">
              {!this.props.auth.isAuthenticated ? (
                <div className="btn-div">
                  <Link className="home-btn" to="/Login"><RaisedButton fullWidth={true} label={<Translate message="HOME.LOGIN_BUTTON" />} /></Link>
                  <Link className="home-btn" to="/Signup"><RaisedButton fullWidth={true} secondary={true} label={<Translate message="HOME.SIGNUP_BUTTON" />} /></Link>
                </div>
              ) : (
                  <Card className="user-card">
                    <CardHeader
                      avatar={<Avatar><ActionPermIdentity /></Avatar>}
                      title={this.props.auth.user.username}
                      subtitle={this.props.auth.user.email}
                    />
                    <CardActions>
                      <FlatButton label={<Translate message="HOME.LOGOUT_BUTTON" />} onTouchTap={this.handleLogout} />
                      <Link to="/Dashboard"><FlatButton label={<Translate message="HOME.GO_TO_DASHBOARD_BUTTON" />} secondary={true} onTouchTap={this.handleGoToDashboard} /></Link>
                    </CardActions>
                  </Card>
                )}
            </div>
          </div>
        </div>

        <div className="info-row pure-g">
          <div className="pure-u-1-3 l-box">
            <div className="info-paper info-black-text" style={{ backgroundImage: 'url("/img/home/info-first-bg.jpg")', backgroundPosition: 'center top' }}>
              <h2 className="info-title"><Translate message="HOME.INFO_ROW.FIRST.TITLE" /></h2>
              <div className="info-text">
                <Translate message="HOME.INFO_ROW.FIRST.CONTENT" />
              </div>
            </div>
          </div>
          <div className="pure-u-1-3 l-box">
            <div className="info-paper info-white-text" style={{ backgroundImage: 'url("/img/home/info-second-bg.jpg")' }}>
              <h2 className="info-title"><Translate message="HOME.INFO_ROW.SECOND.TITLE" /></h2>
              <div className="info-text">
                <Translate message="HOME.INFO_ROW.SECOND.CONTENT" />
              </div>
            </div>
          </div>
          <div className="pure-u-1-3 l-box">
            <div className="info-paper info-white-text" style={{ backgroundImage: 'url("/img/home/info-third-bg.jpg")', backgroundPosition: 'center' }}>
              <h2 className="info-title"><Translate message="HOME.INFO_ROW.THIRD.TITLE" /></h2>
              <div className="info-text">
                <Translate message="HOME.INFO_ROW.THIRD.CONTENT" />
              </div>
            </div>
          </div>
        </div>

        <div className="showcase-next">
          <div className="showcase-next-contnet" style={{
            backgroundColor: '#212121',
            backgroundImage: 'url(/img/home/showcase-second-bg.png)',
            height: '100%',
            backgroundSize: '490px 480px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '90% center',
          }}>
            <div className="showcase-content-text">
              <div>
                <div className="content-title"><Translate message="HOME.SHOWCASE_NEXT_TITLE" /></div>
                <div className="content-subtitle"><Translate message="HOME.SHOWCASE_NEXT_SUBTITLE" /></div>
                <div className="content-description"><Translate message="HOME.SHOWCASE_NEXT_DESCRIPTION" /></div>
              </div>
            </div>
          </div>
        </div>

        <PageFooter />
      </div>
    );
  }

}
// Connect the component with the redux store.
export default connect(state => ({ auth: state.auth }))(HomePage);