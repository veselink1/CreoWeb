﻿/// <autosync enabled="true" />
/// <reference path="../clientapp/api/auth.js" />
/// <reference path="../clientapp/api/pacman.js" />
/// <reference path="../clientapp/api/sites.js" />
/// <reference path="../clientapp/boot-client.js" />
/// <reference path="../clientapp/boot-server.js" />
/// <reference path="../clientapp/boot-server-bundle.js" />
/// <reference path="../clientapp/components/App.js" />
/// <reference path="../clientapp/components/Chart.js" />
/// <reference path="../clientapp/components/editor/index.js" />
/// <reference path="../clientapp/components/editor/utils/index.js" />
/// <reference path="../clientapp/components/ExpandableMenu.js" />
/// <reference path="../clientapp/components/GoldenLayout.js" />
/// <reference path="../clientapp/components/Greeter.js" />
/// <reference path="../clientapp/components/helplink.js" />
/// <reference path="../clientapp/components/index.js" />
/// <reference path="../clientapp/components/LanguageMenu.js" />
/// <reference path="../clientapp/components/LazyList.js" />
/// <reference path="../clientapp/components/MonacoEditor.js" />
/// <reference path="../clientapp/components/networkeffectcanvas.js" />
/// <reference path="../clientapp/components/pagefooter.js" />
/// <reference path="../clientapp/components/PageLoader.js" />
/// <reference path="../clientapp/components/pages/DashboardPage.js" />
/// <reference path="../clientapp/components/pages/EditorPage/dialogs/index.js" />
/// <reference path="../clientapp/components/pages/editorpage/dialogs/logsnackbar.js" />
/// <reference path="../clientapp/components/pages/editorpage/dialogs/newexternalcompdialog.js" />
/// <reference path="../clientapp/components/pages/editorpage/dialogs/savedialog.js" />
/// <reference path="../clientapp/components/pages/EditorPage/dialogs/SettingsDialog.js" />
/// <reference path="../clientapp/components/pages/editorpage/editorpanel.js" />
/// <reference path="../clientapp/components/pages/EditorPage/greeterScreens.js" />
/// <reference path="../clientapp/components/pages/EditorPage/index.js" />
/// <reference path="../clientapp/components/pages/editorpage/layoutmenu.js" />
/// <reference path="../clientapp/components/pages/EditorPage/panels/ComponentList.js" />
/// <reference path="../clientapp/components/pages/EditorPage/panels/EditorPreview.js" />
/// <reference path="../clientapp/components/pages/EditorPage/panels/ErrorViewer.js" />
/// <reference path="../clientapp/components/pages/EditorPage/panels/index.js" />
/// <reference path="../clientapp/components/pages/EditorPage/panels/NodeChildren.js" />
/// <reference path="../clientapp/components/pages/EditorPage/panels/NodeProperties.js" />
/// <reference path="../clientapp/components/pages/EditorPage/panels/PropValueEditor.js" />
/// <reference path="../clientapp/components/pages/EditorPage/panels/ResEditor.js" />
/// <reference path="../clientapp/components/pages/EditorPage/panels/ResViewer.js" />
/// <reference path="../clientapp/components/pages/editorpage/toolbar.js" />
/// <reference path="../clientapp/components/pages/HomePage.js" />
/// <reference path="../clientapp/components/pages/index.js" />
/// <reference path="../clientapp/components/pages/LoginPage.js" />
/// <reference path="../clientapp/components/pages/NotFoundPage.js" />
/// <reference path="../clientapp/components/pages/PageBase.js" />
/// <reference path="../clientapp/components/pages/SignupPage.js" />
/// <reference path="../ClientApp/components/pages/TermsOfUsePage.js" />
/// <reference path="../clientapp/components/pages/TestPage.js" />
/// <reference path="../clientapp/components/PureBoundComponent.js" />
/// <reference path="../clientapp/components/styleeditor.js" />
/// <reference path="../clientapp/components/tabulareditor.js" />
/// <reference path="../clientapp/components/ThemeProvider.js" />
/// <reference path="../clientapp/components/Translate.js" />
/// <reference path="../clientapp/components/TypePicker.js" />
/// <reference path="../clientapp/components/TypePickerV2.js" />
/// <reference path="../clientapp/components/ValEditor.js" />
/// <reference path="../clientapp/components/ValEditorV2.js" />
/// <reference path="../clientapp/data/ants-data-uri.js" />
/// <reference path="../ClientApp/data/element-properties/style-config.js" />
/// <reference path="../clientapp/data/element-properties/style-default.js" />
/// <reference path="../clientapp/data/normalize-css.js" />
/// <reference path="../clientapp/intl/bg.js" />
/// <reference path="../ClientApp/intl/blocks/terms-bg.js" />
/// <reference path="../ClientApp/intl/blocks/terms-en.js" />
/// <reference path="../clientapp/intl/en.js" />
/// <reference path="../clientapp/intl/index.js" />
/// <reference path="../clientapp/reducers/auth.js" />
/// <reference path="../clientapp/reducers/editor.flat.js" />
/// <reference path="../clientapp/reducers/editor.js" />
/// <reference path="../clientapp/reducers/index.js" />
/// <reference path="../clientapp/reducers/project.js" />
/// <reference path="../clientapp/reducers/resources.js" />
/// <reference path="../clientapp/routes/IndexRoute.js" />
/// <reference path="../ClientApp/self-polyfill.js" />
/// <reference path="../clientapp/utils/convert.js" />
/// <reference path="../clientapp/utils/domUtils.js" />
/// <reference path="../clientapp/utils/guid.js" />
/// <reference path="../clientapp/utils/htmlTagsDefaults.js" />
/// <reference path="../clientapp/utils/htmlTagsDescription.js" />
/// <reference path="../clientapp/utils/irdom.flat.js" />
/// <reference path="../clientapp/utils/irdom.js" />
/// <reference path="../clientapp/utils/objectUtils.js" />
/// <reference path="../clientapp/utils/projectgenerator.js" />
/// <reference path="../clientapp/utils/reactKnownHtmlAttr.js" />
/// <reference path="../clientapp/utils/reactUtils.js" />
/// <reference path="../clientapp/utils/ReplicateDB.js" />
/// <reference path="../clientapp/utils/requests.js" />
/// <reference path="../clientapp/utils/setupReplicateDB.js" />
/// <reference path="../clientapp/utils/types.js" />
/// <reference path="../clientapp/utils/validate.js" />
/// <reference path="../clientapp/webpack.config.server.js" />
/// <reference path="../gulpfile.js" />
/// <reference path="../priv/users/vesko.karaganev-at-gmail.com/0/packages/bundle.js" />
/// <reference path="../priv/users/vesko.karaganev-at-gmail.com/36/packages/bundle.js" />
/// <reference path="../Priv/users/vesko.karaganev-at-gmail.com/36/packages/index.js" />
/// <reference path="../priv/users/vesko.karaganev-at-gmail.com/38/packages/bundle.js" />
/// <reference path="../priv/users/vesko.karaganev-at-gmail.com/48/packages/bundle.js" />
/// <reference path="../webpack.config.js" />
/// <reference path="dist/boot-server-bundle.js" />
/// <reference path="dist/main.js" />
/// <reference path="dist/vendor.js" />
/// <reference path="js/site.js" />
/// <reference path="lib/bootstrap/dist/js/bootstrap.js" />
/// <reference path="lib/jquery/dist/jquery.js" />
/// <reference path="lib/jquery-validation/dist/jquery.validate.js" />
/// <reference path="lib/jquery-validation-unobtrusive/jquery.validate.unobtrusive.js" />
/// <reference path="userpackages/user-vesko.karaganev-at-gmail.com/blar/bundle.js" />
/// <reference path="userpackages/user-vesko.karaganev-at-gmail.com/blar/index.js" />
/// <reference path="userpackages/user-wesko.karaganew-at-gmail.com/blar/bundle.js" />
