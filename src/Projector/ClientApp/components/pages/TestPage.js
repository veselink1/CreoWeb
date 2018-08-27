import { PureComponent } from 'react';
import PageBase from './PageBase';
import StyleEditor from '~/components/StyleEditor';
import styleConfig from '~/data/element-properties/style-config';
import styleDefault from '~/data/element-properties/style-default';

export default class TestPage extends PageBase {

  constructor(props) {
    super(props);
    this.state = {
      values: {}
    };
  }

  renderPageContent() {
    return (
      <StyleEditor
        config={styleConfig}
        values={this.state.values}
        onChange={(event, css, value) => {
          this.setState(Object.assign({}, this.state, {
            values: Object.assign({}, this.state.values, { [css]: value })
          }));
        }}
      />
    );
  }

}