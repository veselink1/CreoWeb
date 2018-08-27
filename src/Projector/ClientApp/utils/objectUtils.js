import * as _ from 'lodash';

export function extract(object, key, newValue) {
  const val = object[key];
  object[key] = newValue;
  return val;
};

export function bindToSelf(self) {
  const props = Object.getOwnPropertyNames(Object.getPrototypeOf(self));
  for (const prop of props) {
    if (prop.substr(0, 6) == 'handle' && self[prop] instanceof Function) {
      self[prop] = self[prop].bind(self);
    }
  }
}

export function combineShallow(...objs) {
  return _.assign({}, ...objs);
}

export function combineDeep(...objs) {
  return _.merge({}, ...objs);
}

export function throttle(action, ms) {
  let timeoutHandle = null;
  return function (...args) {
    if (timeoutHandle !== null) {
      clearTimeout(timeoutHandle);
    }
    timeoutHandle = setTimeout(() => {
      timeoutHandle = null;
      action.call(this, ...args);
    }, ms);
  };
}

export function cancellable(f, shouldContinue) {
  let invoke = action => shouldContinue() && action();
  f(invoke, ...arguments);
}

export function keyMirror(obj) {
  for (let key in obj) {
    obj[key] = key;
  }
}

export function indexOf(array, cb) {
  for (let i = 0; i < array.length; i++) {
    if (cb(array[i])) {
      return i;
    }
  }
  return -1;
}

// DOES NOT WORK
export function throttleAsync(asyncFn, ms) {
  let exec = throttle(f => {
    f();
  }, ms);
  return function (...args) {
    return new Promise((resolve, reject) => {
      const result = void 0;
      exec(async () => {
        try {
          resolve(asyncFn(...args));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}

export function combine(...objs) {
  const result = {};
  for (let obj of objs) {
    for (let key in obj) {
      let value = result[key];
      let patch = obj[key];
      if (value && patch && typeof value === 'object' && typeof patch === 'object') {
        result[key] = combine(value, obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}

export function callTramp(f) {
  let value = f;
  while (true) {
    if (!value) {
      break;
    } else if (value instanceof Function) {
      value = value();
    }
    value = value();
  }
  return value;
}

export function flatten(array) {
  let xs = [];
  for (let sub of array) {
    for (let x of sub) {
      xs.push(x);
    }
  }
  return xs;
}