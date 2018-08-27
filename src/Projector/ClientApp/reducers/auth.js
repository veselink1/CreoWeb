import { combineShallow } from '~/utils/objectUtils';
import { createReducer } from '~/utils/reactUtils';
import { loginRequest, logoutRequest } from '~/api/auth';

const A = {
  // Sending a login request.
  LOGIN_STARTED: 'LOGIN_REQUEST',
  // The login succeeded.
  LOGIN_SUCCEEDED: 'LOGIN_SUCCESS',
  // The login failed.
  LOGIN_FAILED: 'LOGIN_FAILURE',

  // Sending a logout request.
  LOGOUT_STARTED: 'LOGOUT_REQUEST',
  // The logout succeeded.
  LOGOUT_COMPLETED: 'LOGOUT_SUCCESS',
  // The logout failed.
  LOGOUT_FAILURE: 'LOGOUT_FAILURE'
};

// These functions return an object,
// whose type property predicates determines how
// the state is going to change.
// These actions are only going to be used with dispatch().

/**
 * Notifies that a request is being executed,
 * by setting isFetching to true.
 */
const loginStarted = (email, password) => ({
  type: A.LOGIN_STARTED,
  email,
  password
});

/** 
 * The login has succeeded. 
 */
export const loginSucceeded = user => ({
  type: A.LOGIN_SUCCEEDED,
  user,
});

/**
 * The login has failed.
 */
export const loginFailed = message => ({
  type: A.LOGIN_FAILED,
  message
});

/**
 * Try to log the user in using an email and a password.
 */
export function loginUser(email, password) {
  return dispatch => {
    // The login process has started.
    dispatch(loginStarted(email, password));

    // Send the login request.
    loginRequest(email, password)
      .then(({ json, response }) => {
        if (!json) {
          // If the response was not JSON.
          console.error('Login request failed!', response);
          dispatch(loginFailed('Server error!'));
        } else if (!json.ok) {
          // If the response was not OK, dispatch the failed action.
          dispatch(loginFailed(json.message));
        } else {
          // If the login was successfull, dispatch the success action.
          dispatch(loginSucceeded(json.user));
        }
      }).catch(err => {
        // Catch all exceptions and log them.
        console.error("Login request failed!", err);
        dispatch(loginFailed('Network error!'));
      });
  }
}

/**
 * The logout process has started.
 */
const logoutStarted = () => ({
  type: A.LOGOUT_STARTED,
})

/**
 * The logout process has finished.
 */
const logoutCompleted = () => ({
  type: A.LOGOUT_COMPLETED
});

/**
 * Log the user out.
 */
export function logoutUser() {
  return dispatch => {
    dispatch(logoutStarted());
    logoutRequest().then(success => {
      dispatch(logoutCompleted());
    })
    .catch(e => {
      dispatch(logoutCompleted());
    });
  };
}

// This is the initial state of the auth reducer.
const initialState = {
  isFetching: false,
  isAuthenticated: false,
  user: null,
  errorMessage: null,
};

export default createReducer(initialState, {
  [A.LOGIN_STARTED]: (state) => combineShallow(state, {
    isFetching: true,
    isAuthenticated: false,
    user: null,
    errorMessage: null,
  }),
  [A.LOGIN_SUCCEEDED]: (state, { user }) => combineShallow(state, {
    isFetching: false,
    isAuthenticated: true,
    user: user
  }),
  [A.LOGIN_FAILED]: (state, { message }) => combineShallow(state, {
    isFetching: false,
    isAuthenticated: false,
    errorMessage: message
  }),
  [A.LOGOUT_STARTED]: (state) => combineShallow(state, {
    isFetching: true,
    isAuthenticated: false,
    errorMessage: null
  }),
  [A.LOGOUT_COMPLETED]: (state) => combineShallow(state, {
    isFetching: false,
    isAuthenticated: false,
    user: null
  })
});