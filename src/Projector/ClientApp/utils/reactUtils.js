import * as _ from 'lodash';
import { PureComponent, PropTypes } from 'react';

/**
 * Add a function to be called on componentDidMount.
 * @param {Component} self - The React Component on which to listen.
 * @param {function} f - The callback.
 */
export function onMount(self, f) {
  const oldOnMount = self.componentDidMount || function() {};
  self.componentDidMount = function() {
    oldOnMount.call(this);
    f.call(this);
  };
}

/**
 * Add a function to be called on componentWillUnmount.
 * @param {Component} self - The React Component on which to listen.
 * @param {function} f - The callback.
 */
export function onUnmount(self, f) {
  const oldOnUnmount = self.componentWillUnmount || function() {};
  self.componentWillUnmount = function() {
    oldOnUnmount.call(this);
    f.call(this);
  };
}

/**
 * Returns a function, which updates the specified 
 * state key according to a projected value.
 * 
 * Example:
 * 
 * onClick={updateStateKey(this, 'inputValue', event => event.target.value)}
 * @param {Component} self - The React Component whose state to update.
 * @param {string} path - The path of the value which to update.
 * @param {function} project - The function which computes the value. It is called with the same arguments as the returned function.
 * @returns {function} - The function which updates the state when called.
 */
export function updateStateKey(self, path, project) {
    return (function() {
        self.setState(_.set(self.state, path, project.apply(self, arguments)));
    }).bind(self);
}

/**
 * Tries to deduce a type specified by propTypes.
 * @param {*} decltype - The React PropType of the prop.
 * @returns {string} - The type of the prop if found or 'unknown'.
 */
export function deducePropType(decltype) {
  if (decltype) {
    for (let pt in PropTypes) {
      if (PropTypes.hasOwnProperty(pt)) {
        let testp = PropTypes[pt];
        if (decltype === testp) {
          return pt;
        } else if (decltype === testp.isRequired) {
          return pt;
        }
      }
    }
  }
  return 'unknown';
}

/**
 * Create a reducer with initial state and a map of actions.
 */
export function createReducer(initialState, actions) {
  return function(state = initialState, action) {
    const f = actions[action.type];
    if (f) return f(state, action);
    else return "_" in actions ? actions._(state, action) : state;
  }
}