import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { AppBar, FlatButton, Icon, IconButton, IconMenu, MenuItem } from 'material-ui';
import { Link } from 'react-router';
import PageLoader from '~/components/PageLoader';
import ThemeProvider from '~/components/ThemeProvider';
import LanguageMenu from '~/components/LanguageMenu';
import { checkAuth } from '~/reducers/auth';
import * as _ from 'lodash';

import ActionLanguage from 'material-ui/svg-icons/action/language';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import SocialNotifications from 'material-ui/svg-icons/social/notifications';

typeof window !== 'undefined'
  && require('~/styles/page.scss');

class MyAppBar extends PureComponent {
  constructor(props) {
    super(props);
    this.handleTitleClick = this.handleTitleClick.bind(this);
  }
  handleTitleClick() {
    this.context.router.replace('/');
  }
  render() {
    return (
      <AppBar
        title={<span>CreoWeb</span>}
        zDepth={1}
        titleStyle={{ width: '4.6em', cursor: 'pointer', textShadow: '1px 1px 2px rgba(0,0,0,0.2)', flex: 'initial', userSelect: 'none', fontFamily: "Roboto Mono', monospace" }}
        onTitleTouchTap={this.handleTitleClick}
        iconElementLeft={<div />}
        iconElementRight={
          <div>
           
            <LanguageMenu />
            
          </div>}
      />
    );
  }
}

MyAppBar.contextTypes = Link.contextTypes;

MyAppBar = connect(state => ({ auth: state.auth }))(MyAppBar);

let AuthChecker = class extends PureComponent {
  componentDidMount() {
    if (this.props.authenticationRequired && !this.props.auth.isAuthenticated) {
      this.props.onAuthentication(false);
    } else {
      this.props.onAuthentication(true);
    }
  }

  render() {
    return null;
  }
};

AuthChecker.contextTypes = Link.contextTypes;
AuthChecker = connect(state => ({ auth: state.auth }))(AuthChecker);

// Default application page container.
export default class PageBase extends PureComponent {
  constructor(props, pageOptions = { title: 'Untitled', isImmersive: false, backgroundStyle: '' }) {
    super(props);

    this._pageState = {
      mounted: false,
      loaded: false,
      title: `CreoWeb • ${pageOptions.title}`,
      isImmersive: pageOptions.isImmersive || false,
      backgroundStyle: pageOptions.backgroundStyle || 'transparent',
      authenticate: pageOptions.authenticate,
      isAuthenticated: false,
    };

    this._handleAuthentication = success => {
      this._pageState.isAuthenticated = success;
      this.forceUpdate();
      if (!success) {
        window.location.href = '/Login?ReturnUrl=' + encodeURIComponent(window.location.pathname + window.location.search);
      }
    };
  }

  componentDidMount() {
    document.title = this._pageState.title;

    let checkLoad = () => {
      if (document.readyState === 'complete') {
        this._pageState.mounted = true;
        this._pageState.loaded = true;
        this.forceUpdate();
      } else {
        setTimeout(checkLoad, 4);
      }
    };

    checkLoad();
  }

  showLoader() {
    this._pageState.loaded = false;
    this.forceUpdate();
  }

  hideLoader() {
    this._pageState.loaded = true;
    this.forceUpdate();
  }

  renderPageContent() {
    if (this.constructor.name !== 'PageBase') {
      throw new Error(`${this.constructor.name} does not override PageBase's renderPageContent() method.`);
    } else {
      throw new Error('PageBase in an abstract class.');
    }
  }

  render() {
    if (typeof window === 'undefied' && _.get(this.state, '_page.mounted', false) === false) {
      console.error(`PageBase <- ${this.constructor.name}'s componentDidMount method should call super.componentDidMount()!`);
    }

    return pageBaseTemplate({
      pageLoaded: this._pageState.loaded,
      shouldAuthenticate: this._pageState.authenticate,
      isAuthenticated: this._pageState.isAuthenticated,
      isImmersive: this._pageState.isImmersive,
      handleAuthentication: this._handleAuthentication,
      backgroundStyle: this._pageState.backgroundStyle,
      pageContent: this.renderPageContent(),
    });
  }
}

const pageBaseTemplate = ({ pageLoaded, shouldAuthenticate, isAuthenticated, isImmersive, handleAuthentication, backgroundStyle, pageContent }) => (
  <ThemeProvider>
    <div
      className={['page', isImmersive ? 'immersive-page' : ''].join(' ')}
      style={{ background: backgroundStyle }}
    >

      {!isImmersive && <MyAppBar />}
      <PageLoader visible={!pageLoaded || !isAuthenticated} />

      <div className="page-content">
        {pageContent}
      </div>

      <AuthChecker authenticationRequired={shouldAuthenticate} onAuthentication={handleAuthentication} />

    </div>
  </ThemeProvider>
);


