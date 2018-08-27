import { combineReducers } from 'redux';
import { combine, combineShallow } from '~/utils/objectUtils';
import { createReducer } from '~/utils/reactUtils';
import * as convert from '~/utils/convert';
import guid from '~/utils/guid';
let Babel = null;
if (typeof window !== 'undefined') {
  Babel = require('babel-standalone');
}

const A = {
  PATCH_RESOURCE: 'PATCH_RESOURCE',
  DELETE_RESOURCE: 'DELETE_RESOURCE',
  EDIT_RESOURCE: 'EDIT_RESOURCE',
  LOAD_RESOURCES: 'LOAD_RESOURCES',
  RESET_ALL_RESOURCES: 'RESET_ALL_RESOURCES',
};

export const GLOBAL_GROUP = '-GLOBAL-';

export const RESOURCE_TYPES = {
  TEXT: 'TEXT',
  JSON: 'JSON',
  JS: 'JS',
  CSS: 'CSS',
  LINK: 'LINK'
};

function parseJSResource(code) {
  return function () {
    let es5 = Babel.transform(code, { presets: ['react', 'latest'] }).code;
    return `(function(exports) {
      ${es5};
      return exports;
    })({})`;
  };
}

function parseCSSResource(code) {
  return code;
}

let parseCache = {};

class ResourcesInterface {

  constructor(key, state, dispatch = null) {
    this.key = key || GLOBAL_GROUP;
    this.state = state;
    this.dispatch = dispatch;
  }

  get records() {
    return this.state.records[this.key] || {};
  }

  mapRecordsToObject() {
    let obj = {};
    let records = this.state.records[this.key] || {};
    let cache = parseCache;
    if (!cache) {
      cache = parseCache = {};
    }

    for (let id in records) {
      let rec = records[id];
      let cached = cache[id];
      if (cached && cached.changeTime === rec.changeTime) {
        obj[rec.name] = cached.value;
      }
      let value;
      if (rec.type === RESOURCE_TYPES.JSON) {
        value = JSON.parse(rec.value);
      } else if (rec.type === RESOURCE_TYPES.JS) {
        value = parseJSResource(rec.value);
      } else if (rec.type === RESOURCE_TYPES.TEXT) {
        value = rec.value;
      }
      cache[id] = { value, changeTime: rec.changeTime };
      obj[rec.name] = value;
    }

    return obj;
  }

  getRecordsByType(type) {
    let records = this.state.records[this.key] || {};
    let result = {};
    for (let id in records) {
      let rec = records[id];
      if (rec.type === type) {
        result[id] = rec;
      }
    }
    return result;
  }

  getRecordByName(name) {
    let records = this.state.records[this.key] || {};
    for (let id in records) {
      let rec = records[id];
      if (rec.name === name) {
        return rec;
      }
    }
    return null;
  }

  loadRecords(data) {
    this.dispatch({ type: A.LOAD_RESOURCES, data, key: this.key });
  }

  patchResource(id, data) {
    this.dispatch({ type: A.PATCH_RESOURCE, resId: id, data, key: this.key });
  }

  deleteResource(id) {
    this.dispatch({ type: A.DELETE_RESOURCE, resId: id, key: this.key });
  }

  addResource(data) {
    const resId = guid();
    this.dispatch({ type: A.PATCH_RESOURCE, resId, data, key: this.key });
    return resId;
  }

  resetAll() {
    this.dispatch({ type: A.RESET_ALL_RESOURCES });
  }

}


export function resourcesInterface(localKey = null, state, dispatch = null) {
  return new ResourcesInterface(localKey, state, dispatch);
}

// This is the initial state of the auth reducer.
const initialState = ({
  records: null
});

export default createReducer(initialState, {
  [A.PATCH_RESOURCE]: (state, { resId, data, key }) => combine(state, {
    records: {
      [key]: {
        [resId]: Object.assign({}, state.records[key][resId], data, { changeTime: Date.now() })
      }
    }
  }),
  [A.DELETE_RESOURCE]: (state, { resId, key }) => {
    let newRecords = _.clone(state.records[key] || {});
    newRecords[resId] = null;
    delete newRecords[resId];
    return combineShallow(state, {
      records: combineShallow(state.records, {
        [key]: newRecords
      }),
    });
  },
  [A.LOAD_RESOURCES]: (state, { data, key }) => combine(state, {
    records: { [key]: data }
  }),
  [A.RESET_ALL_RESOURCES]: () => initialState,
});