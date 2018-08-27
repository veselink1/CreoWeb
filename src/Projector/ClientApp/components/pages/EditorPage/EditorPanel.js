import { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { getActiveEditor } from '~/reducers/project';
import ThemeProvider from '~/components/ThemeProvider';
import Translate, { TranslationProvider, translateMessage } from '~/components/Translate';
import intl from '~/intl';

export default connect(state => ({ editorIsTesting: getActiveEditor(state.project).isTesting }))(class EditorPanel extends PureComponent {
  render() {
    return template({ 
      translations: intl,
      isActive: !(this.props.editorIsTesting && !this.props.enableTesting), 
      panelContent: this.props.children, 
    });
  }
});

const template = ({ isActive, panelContent, translations }) => (
  <TranslationProvider translations={translations}>
    <div className={classNames({ "panel": true, "inactive": !isActive })}>
      <div className="overlay">
        <div className="notification">
          <Translate message="EDITOR.PANEL_DISABLED_NOTIFICATION" />
        </div>
      </div>
      <ThemeProvider>
        <div className="panel-content"> {panelContent} </div>
      </ThemeProvider>
    </div >
  </TranslationProvider>
);