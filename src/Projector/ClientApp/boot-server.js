import './self-polyfill';
// Polyfill full ES2015 enviroment.
import 'babel-polyfill';
import * as React from 'react';
// Enables use of onTouchTap event
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
// `renderToString` renders HTML markup
import { renderToString } from 'react-dom/server'
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { match, RouterContext, createRoutes } from 'react-router'
import reducer from './reducers';
import App from './components/App';
import IndexRoute from './routes/IndexRoute';
import { loginSucceeded, loginFailed } from './reducers/auth';
import { omit } from 'lodash';
import * as prerendering from 'aspnet-prerendering';

global.React = require('react');

function flatten(array) {
  const newArray = [];
  for (let elem of array) {
    for (let sub of elem) {
      newArray.push(sub);
    }
  }
  return newArray;
}

const entry = function (params) {
  return new Promise((resolve, reject) => {
    // Parse the data from the view
    const prerenderData = JSON.parse(params.data);
    const req = prerenderData["Request"];
    // Polyfill a bare-bones `navigator` object 
    // when rendering server-side.
    // It is only used in <MuiThemeProvider /> in the App component.
    global.navigator = {
      userAgent: req.Headers['User-Agent'][0],
      languages: flatten(req.Headers['Accept-Language'][0].split(';').filter(lang => lang.indexOf('=') === -1).map(lang => lang.split(',')))
    };

    // Render the App.
    render(params.location.path, prerenderData)
      .then(resolve, reject);
  });
}

export default entry;

function render(path, prerenderData) {
  return new Promise((resolve, reject) => {
    // Match routes in the app.
    match({ routes: createRoutes(IndexRoute()), location: path }, (error, redirectLocation, renderProps) => {
      if (error) {
        resolve({ html: `<h2> Error </h2> <h4> ${error.message} </h4>` });
      } else if (redirectLocation) {
        // Rerender for redirectLocation.
        render(redirectLocation, prerenderData)
          .then(resolve, reject);
      } else if (renderProps) {
        // Create the main store.
        const store = createStore(reducer);
        if (prerenderData.User) {
          store.dispatch(loginSucceeded(prerenderData.User));
        } else {
          store.dispatch(loginFailed());
        }

        // Render the app to HTML
        const html = renderToString(
          <Provider store={store}>
            <RouterContext {...renderProps} />
          </Provider>
        );

        // Return the rendered HTML and create 
        // a global __PRELOADED_STATE__ key with the resulting state.
        // This state will be the initial value on the client.
        resolve({
          html, globals: {
            __PRELOADED_STATE__: omit(store.getState(), 'project')
          }
        });
      } else {
        reject(404);
      }
    });
  });
}