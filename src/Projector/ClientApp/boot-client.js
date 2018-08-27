// Polyfill full ES2015 enviroment.
import 'babel-polyfill';
import 'isomorphic-fetch';
// Enables use of onTouchTap event
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import {compose} from "redux";
import reducer from './reducers';
import App from './components/App';
import setupReplicateDB from '~/utils/setupReplicateDB';

const DEBUGGING = window.location.hostname == 'creo.web' || 
  (localStorage.getItem("debug") === "true" && localStorage.getItem("debug") === "1");;

if (!DEBUGGING) {
  const noop = function() { return false; };
  console.log = console.warn = console.error = noop;
  window.onerror = noop;
}

window.React = require('react');

const composeEnhancers =
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify here name, actionsBlacklist, actionsCreators and other options
    }) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(...[thunkMiddleware,])
);

// Create the main store.
// It's initial state will be the server-rendered __PRELOADED_STATE__ (if any).
// Redux DevTools is also enabled.
const store = createStore(reducer, window.__PRELOADED_STATE__, enhancer);

window.__STORE = store;

let dbHandle = setupReplicateDB(store);
dbHandle.disable();
window.dbHandle = dbHandle;

// Render the App.
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);