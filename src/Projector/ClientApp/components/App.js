import * as React from 'react';
import { Router, Link, browserHistory } from 'react-router';
import IndexRoute from '~/routes/IndexRoute';

typeof window !== 'undefined'
  && require('~/styles/main.scss');

// Render app according to the router.
export default () => (
  <Router history={browserHistory} routes={IndexRoute()} />
);