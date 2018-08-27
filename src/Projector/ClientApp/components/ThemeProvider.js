import { PureComponent } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  teal500, teal700,
  pinkA200
} from 'material-ui/styles/colors';

/**
 * Creates the material theme provider.
 */
export default class ThemeProvider extends PureComponent {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme({
        userAgent: (typeof window !== 'undefined' ? window : global).navigator.userAgent,
        palette: {
          primary1Color: teal500,
          primary2Color: teal700,
          accent1Color: pinkA200,
        },
      })}>
        {this.props.children}
      </MuiThemeProvider>
    );
  }
}