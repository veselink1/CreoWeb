import { combineReducers } from 'redux';
import auth from './auth';
import project from './project';
import resources from './resources';

// The state of the app will have 
// the following blueprint:
// { count: number }
export default combineReducers({
  auth,
  project,
  resources,
});