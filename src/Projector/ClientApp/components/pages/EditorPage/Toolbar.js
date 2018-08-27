import { PureComponent, PropTypes } from 'react';
import { IconButton } from 'material-ui';
import * as dialogs from './dialogs';
import Translate from '~/components/Translate';
import LanguageMenu from '~/components/LanguageMenu';
import { bindToSelf } from '~/utils/objectUtils';
import LayoutMenu from './LayoutMenu';

import AVPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import AVStop from 'material-ui/svg-icons/av/stop';
import ActionSettings from 'material-ui/svg-icons/action/settings';
import ContentSave from 'material-ui/svg-icons/content/save';

export default class Toolbar extends PureComponent {
  constructor(props) {
    super(props);
    bindToSelf(this);
    this.state = {
      settingsOpen: false,
      saveOpen: false,
    };
  }

  handlePlayPauseClick() {
    if (this.props.isPlaying) {
      this.props.onPause && this.props.onPause();
    } else {
      this.props.onPlay && this.props.onPlay();
    }
  }

  handleSettingsClick() {
    this.setState({ settingsOpen: true });
  }

  handleSettingsClose() {
    this.setState({ settingsOpen: false });
  }

  handleSaveClick() {
    this.setState({ saveOpen: true });
  }

  handleSaveClose() {
    this.setState({ saveOpen: false });
  }

  render() {
    return (
      <div>

        <div style={{ display: 'inline-block', position: 'relative', top: '-8px' }}>
          <LayoutMenu activeLayout={this.props.activeLayout} layouts={this.props.layouts} onLayoutChange={this.props.onLayoutChange} />
        </div>

        {!this.props.isPlaying ? (
          <IconButton tooltip={<Translate message="EDITOR.TOOLBAR.PLAY_TOOLTIP" />} onClick={this.handlePlayPauseClick}>
            <AVPlayArrow color="white" />
          </IconButton>
        ) : (
            <IconButton tooltip={<Translate message="EDITOR.TOOLBAR.PAUSE_TOOLTIP" />} onClick={this.handlePlayPauseClick}>
              <AVStop color="white" />
            </IconButton>
          )
        }
        
        <IconButton tooltip={<Translate message="EDITOR.TOOLBAR.DOWNLOAD_TOOLTIP" />} onClick={this.handleSaveClick}>
          <ContentSave color="white" />
        </IconButton>

        <IconButton tooltip={<Translate message="EDITOR.TOOLBAR.SETTINGS_TOOLTIP" />} onClick={this.handleSettingsClick}>
          <ActionSettings color="white" />
        </IconButton>

        <div style={{ display: 'inline-block', position: 'relative', top: '-8px' }}>
          <LanguageMenu />
        </div>

        <dialogs.SettingsDialog
          open={this.state.settingsOpen}
          onRequestClose={this.handleSettingsClose}
        />

        <dialogs.SaveDialog
          open={this.state.saveOpen}
          onRequestClose={this.handleSaveClose}
        />

      </div>
    );
  }
}