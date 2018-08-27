//@ts-check
import { PureComponent, PropTypes } from 'react';
import { IconMenu, FlatButton, MenuItem } from 'material-ui';
import ActionViewQuilt from 'material-ui/svg-icons/action/view-quilt';
import Translate from '~/components/Translate';
import * as _ from 'lodash';

export default class LayoutMenu extends PureComponent {
  render() {
    return (
      <IconMenu
        style={{ marginTop: '4px' }}
        iconButtonElement={
          <FlatButton
            label={<Translate message="EDITOR.LAYOUTS_MENU.LABEL" defaultMessage="Layout" />}
            labelPosition="before"
            labelStyle={{ color: 'white' }}
            icon={<ActionViewQuilt color="white" />}
          />
        }
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {this.props.layouts.map((layout, i) => (
          <MenuItem
            key={i}
            primaryText={<Translate message={`EDITOR.LAYOUTS_MENU.LAYOUTS.${layout.toUpperCase()}`} defaultMessage={_.upperFirst(layout)} />}
            checked={layout === this.props.activeLayout}
            insetChildren={layout !== this.props.activeLayout}
            onClick={() => this.props.onLayoutChange(layout)}
          />
        ))}
      </IconMenu>
    );
  }
}