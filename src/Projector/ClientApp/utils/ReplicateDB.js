import { throttle } from '~/utils/objectUtils';
import { pick, isEqual } from 'lodash';

const _reduxStore = Symbol("reduxStore");
const _handleStateChange = Symbol("handleStateChange");
const _state = Symbol("state");
const _throttleInterval = Symbol("throttleInterval");
const _maxSkips = Symbol("maxSkips");
const _lastUpdateTime = Symbol("lastUpdateTime");
const _fetch = Symbol("fetch");
const _throttledCallback = Symbol("throttledCallback");
const _isEnabled = Symbol("isEnabled");
const _project = Symbol("project");

export default class ReplicateDB {

  constructor(fetch, options = { throttleInterval: 5000, maxSkips: 5, project: null }) {
    this[_state] = null;
    this[_throttleInterval] = options.throttleInterval;
    this[_maxSkips] = options.maxSkips;
    this[_fetch] = fetch;
    this[_isEnabled] = false;
    this[_project] = options.project;

    this[_lastUpdateTime] = 0;
    let throttled = throttle(f => {
      f.call(this);
      this[_lastUpdateTime] = Date.now();
    }, options.throttleInterval);

    this[_throttledCallback] = function (f) {
      if (this[_isEnabled]) {
        if (Date.now() - this[_lastUpdateTime] > this[_throttleInterval] * this[_maxSkips]) {
          f();
          this[_lastUpdateTime] = Date.now();
        } else {
          throttled(f);
        }
      }
    };
  }

  get state() {
    return this[_state];
  }

  get throttleInterval() {
    return this[_throttleInterval];
  }

  get maxSkips() {
    return this[_maxSkips];
  }

  get isEnabled() {
    return this[_isEnabled];
  }

  get reduxStore() {
    return this[_reduxStore];
  }

  connectToRedux(store) {
    this[_reduxStore] = store;
    store.subscribe(() => {
      const state = store.getState();
      const stateToEmit = this[_project] ? this[_project](state) : state;
      this[_handleStateChange](stateToEmit)
    });
    return this;
  }

  forceReplicate() {
    this[_lastUpdateTime] = Date.now();
    this[_fetch](this[_state]);
  }

  enable() {
    this[_isEnabled] = true;
  }

  disable() {
    this[_isEnabled] = false;
  }

  [_handleStateChange](nextState) {
    const projectState = state => this[_project] ? this[_project](state) : state;
    if (!isEqual(projectState(this[_state]), projectState(nextState))) {
      this[_state] = nextState;
      if (this[_isEnabled]) {
        this[_throttledCallback](() => this.forceReplicate());
      }
    }
  }

}