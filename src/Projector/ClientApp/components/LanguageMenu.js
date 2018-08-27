import { PureComponent } from 'react';
import { IconButton, IconMenu, DropDownMenu, MenuItem, FlatButton } from 'material-ui';
import ActionLanguage from 'material-ui/svg-icons/action/language';
import Translate, { LanguageList } from '~/components/Translate';

/**
 * Creates a language picker using material-ui's IconMenu.
 * It is currently beign used in the site's app bar.
 */
export default class LanguageMenu extends PureComponent {
  render() {
    return (
      <LanguageList
        key="languages"
        contain={children => (
          <IconMenu
            {...this.props}
            style={{ marginTop: '4px' }}
            iconButtonElement={
              <FlatButton
                label={<Translate message="LANGUAGE_MENU.LABEL" />}
                labelPosition="before"
                labelStyle={{ color: 'white' }}
                icon={<ActionLanguage color="white" />}
              />
            }
            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          >
            {children}
          </IconMenu>
        )}
        project={(locale, setLocale, isCurrent) => (
          <MenuItem
            key={locale}
            primaryText={<Translate message={`LANGUAGE_MENU.LANGUAGES.${locale.toUpperCase()}`} defaultMessage={locale.toUpperCase()} />}
            checked={isCurrent}
            insetChildren={!isCurrent}
            onClick={() => setLocale(locale)}
          />
        )}
      />
    );
  }
}