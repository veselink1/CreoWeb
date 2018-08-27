import { PureComponent, PropTypes } from 'react';
import { omit } from 'lodash';
import deepForceUpdate from 'react-deep-force-update';

/**
 * ChartJS exported as a React component.
 */
export default class Chart extends PureComponent {
  componentDidMount() {
    this.ChartJS = require('chart.js/src/chart.js');
    this.updateChart(this.props.options);
  }
  componentWillReceiveProps(nextProps) {
    this.updateChart(nextProps.options);
  }
  updateChart(options) {
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new this.ChartJS(this.renderTarget, options);
  }
  render() {
    return (
      <canvas {...omit(this.props, 'options') } ref={x => this.renderTarget = x} />
    );
  }

}

Chart.propTypes = {
  options: PropTypes.object.isRequired,
};