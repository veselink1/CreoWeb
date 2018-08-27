import { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import PageBase from '~/components/pages/PageBase';
import GoldenLayout from '~/components/GoldenLayout';
import ThemeProvider from '~/components/ThemeProvider';
import { combineDeep } from '~/utils/objectUtils';
import { AppBar, IconButton, IconMenu, MenuItem, FlatButton } from 'material-ui';
import { editorInterface } from '~/reducers/editor';
import { getActiveEditor, projectInterface } from '~/reducers/project';
import deepForceUpdate from 'react-deep-force-update';
import Translate, { TranslationProvider, translateMessage } from '~/components/Translate';
import LanguageMenu from '~/components/LanguageMenu';
import * as panels from './panels';
import * as dialogs from './dialogs';
import * as _ from 'lodash';
import Toolbar from './Toolbar';
import LayoutMenu from './LayoutMenu';
import EditorPanel from './EditorPanel';

import AVPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import AVStop from 'material-ui/svg-icons/av/stop';
import ActionSettings from 'material-ui/svg-icons/action/settings';
import ActionViewQuilt from 'material-ui/svg-icons/action/view-quilt';

import Greeter from '~/components/Greeter';
import greeterScreens from './greeterScreens';

import classNames from 'classnames';

import intl from '~/intl';
import { maskDatabaseId, unmaskDatabaseId, getRequestParams } from '~/utils/requests.js';

typeof window !== 'undefined'
  && require('~/styles/editor-page.scss');

class EditorPage extends PageBase {
  constructor(props) {
    super(props, { title: "Editor", isImmersive: true, authenticate: true });

    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);

    this.layouts = {
      compact: this.getCompactLayout,
      wide: this.getWideLayout,
    };

    this.state = {
      activeLayout: 'wide',
      snackbarOpen: false,
      snackbarMessage: '',
    };
  }

  componentWillUnmount() {
    try {
      window.dbHandle.forceReplicate();
    } catch (e) {
      // ignore
    }
    window.dbHandle.disable();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.editor.name !== nextProps.editor.name) {
      deepForceUpdate(this);
    }
  }

  getLayoutComponents() {
    return {
      Preview: () => (
        <EditorPanel enableTesting={true}>
          <panels.EditorPreview />
        </EditorPanel>
      ),
      CompList: () => (
        <EditorPanel>
          <panels.ComponentList />
        </EditorPanel>
      ),
      Properties: () => (
        <EditorPanel>
          <panels.NodeProperties />
        </EditorPanel>
      ),
      Children: () => (
        <EditorPanel>
          <panels.NodeChildren />
        </EditorPanel>
      ),
      ResViewer: () => (
        <EditorPanel>
          <panels.ResViewer />
        </EditorPanel>
      ),
      Errors: () => (
        <EditorPanel enableTesting={true}>
          <panels.ErrorViewer />
        </EditorPanel>
      )
    };
  }

  getLayoutContent() {
    return this.layouts[this.state.activeLayout].call(this, this.getLayoutComponents());
  }

  getCompactLayout({ Preview, CompList, Properties, Children, ResViewer, Errors }) {
    return [{
      type: 'row',
      content: [
        {
          width: 40,
          type: 'column',
          content: [
            {
              height: 40,
              type: 'stack',
              content: [
                {
                  title: translateMessage(this.context.translationContext, 'EDITOR.CONTENT_TAB', 'Content'),
                  render: Children
                },
                {
                  title: translateMessage(this.context.translationContext, 'EDITOR.RESOURCES_TAB', 'Resources'),
                  render: ResViewer
                },
              ],
            },
            {
              height: 60,
              type: 'stack',
              content: [
                {
                  title: translateMessage(this.context.translationContext, 'EDITOR.DETAILS_TAB', 'Properties'),
                  render: Properties
                },
                {
                  title: translateMessage(this.context.translationContext, 'EDITOR.COMPONENTS_TAB', 'Components'),
                  render: CompList
                },
              ],
            },
          ]
        },
        {
          width: 60,
          type: 'column',
          content: [
            {
              height: 70,
              title: translateMessage(this.context.translationContext, 'EDITOR.PREVIEW_TAB', 'Preview'),
              render: Preview
            },
            {
              height: 30,
              title: translateMessage(this.context.translationContext, 'EDITOR.CONSOLE_TAB', 'Console'),
              render: Errors
            }
          ]
        }
      ]
    }];
  }

  getWideLayout({ Preview, CompList, Properties, Children, ResViewer, Errors }) {
    return [{
      type: 'row',
      content: [
        {
          width: 30,
          type: 'column',
          content: [
            {
              height: 50,
              title: translateMessage(this.context.translationContext, 'EDITOR.DETAILS_TAB', 'Properties'),
              render: Properties
            },
            {
              height: 50,
              title: translateMessage(this.context.translationContext, 'EDITOR.CONTENT_TAB', 'Content'),
              render: Children
            },
          ],
        },
        {
          width: 40,
          type: 'column',
          content: [
            {
              height: 70,
              title: translateMessage(this.context.translationContext, 'EDITOR.PREVIEW_TAB', 'Preview'),
              render: Preview
            },
            {
              height: 30,
              title: translateMessage(this.context.translationContext, 'EDITOR.CONSOLE_TAB', 'Console'),
              render: Errors
            }
          ]
        },
        {
          width: 30,
          type: 'column',
          content: [{
            type: 'stack',
            content: [
              {
                title: translateMessage(this.context.translationContext, 'EDITOR.COMPONENTS_TAB', 'Components'),
                render: CompList
              },
              {
                title: translateMessage(this.context.translationContext, 'EDITOR.RESOURCES_TAB', 'Resources'),
                render: ResViewer
              },
            ]
          }],
        },
      ]
    }];
  }

  handlePlay() {
    const editor = editorInterface(this.props.editor, this.props.dispatch);
    editor.setIsTesting(true);
    const previewTabHeader = translateMessage(this.context.translationContext, 'EDITOR.PREVIEW_TAB', 'Preview');
    const previewConfig = findNestedObject(this.nativeGl.config, o => o.title === previewTabHeader);
  }

  handlePause() {
    const editor = editorInterface(this.props.editor, this.props.dispatch);
    editor.setIsTesting(false);
    const previewTabHeader = translateMessage(this.context.translationContext, 'EDITOR.PREVIEW_TAB', 'Preview');
    const previewConfig = findNestedObject(this.nativeGl.config, o => o.title === previewTabHeader);
  }

  renderPageContent() {
    if (this.props.projectId == null) {
      this.context.router.replace('/Dashboard');
      return null;
    }
    const editor = editorInterface(this.props.editor, this.props.dispatch);
    return (
      <div
        className="editor-page"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        <Greeter
          scope="editor"
          title={translateMessage(this.context.translationContext, "EDITOR.GREETER.HEADER")}
          screens={greeterScreens}
        />
        <AppBar
          showMenuIconButton={false}
          title={`<${this.props.editor.name} />`}
          iconElementRight={
            <Toolbar
              isPlaying={editor.isTesting}
              onPlay={this.handlePlay}
              onPause={this.handlePause}
              activeLayout={this.state.activeLayout}
              layouts={Object.keys(this.layouts)}
              onLayoutChange={layout => {
                this.setState({ activeLayout: layout });
                deepForceUpdate(this);
              }}
            />
          }
        />

        <dialogs.LogSnackbar />

        <div style={{ width: '100%', height: 'calc(100% - 4em)' }}>
          <GoldenLayout
            onInit={gl => {
              gl._isFullPage = true;
              this.nativeGl = gl;
            }}
            theme="light"
            content={this.getLayoutContent()}
            settings={{
              hasHeaders: true,
              constrainDragToContainer: true,
              reorderEnabled: true,
              selectionEnabled: false,
              showPopoutIcon: false,
              showMaximiseIcon: true,
              showCloseIcon: false
            }}
            dimensions={{
              borderWidth: 3,
              minItemHeight: 200,
              minItemWidth: 380,
              headerHeight: 32,
              dragProxyWidth: 300,
              dragProxyHeight: 200
            }}
            labels={{
              close: 'close',
              maximise: 'maximise',
              minimise: 'minimise',
            }}
          />
        </div>
      </div >
    );
  }
}

EditorPage.contextTypes = Link.contextTypes;
EditorPage.contextTypes.translationContext = PropTypes.object.isRequired;

export default connect(state => ({ editor: getActiveEditor(state.project), projectId: state.project.id }))(EditorPage);

function findNestedObject(o, f) {
  if (f(o)) {
    return o;
  }
  var result, p;
  for (p in o) {
    if (o.hasOwnProperty(p) && typeof o[p] === 'object') {
      result = findNestedObject(o[p], f);
      if (result) {
        return result;
      }
    }
  }
  return result;
}
