/// <reference path="types.d.ts" />

export function ofType(type, value) {
  if (!isOfType(type, value)) {
    throw new TypeError(`Type assertion failed!`);
  }
  return value;
}

export default function is(signature, value) {
  if (!signature) {
    throw new Error(signatureTypeError);
  }
  const signaturePrototype = Object.getPrototypeOf(value);
  if (signaturePrototype === Function.prototype) {
    return isOfType(signature, value);
  }
  if (signaturePrototype === Array.prototype) {
    return isAnyOf(signature, value);
  }
  throw new Error(signatureTypeError);
}

export function isOfType(type, value) {
  if (typeof type === 'object' && type instanceof Array) {
    return isAnyOf(type, value);
  }
  const objectType = typeof value;
  switch (objectType) {
    case 'number': return type === Number;
    case 'string': return type === String;
    case 'boolean': return type === Boolean;
    case 'symbol': return type === Symbol;
    case 'undefined': return type === void 0;
    default:
      if (value === null || type === null) {
        return type === value;
      } else if (type instanceof Function) {
        return value instanceof type;
      } else {
        return doesImplement(type, value);
      }
  }
}

function isAnyOf(types, object) {
  for (let type of types) {
    if (isOfType(type, object)) {
      return true;
    }
  }
  return false;
}

function doesImplement(signature, object) {
  for (let key in signature) {
    const sigProp = signature[key];
    const objProp = object[key];
    if (sigProp instanceof Array) {
      return isAnyOf(sigProp, objProp);
    } else if (!isOfType(sigProp, objProp)) {
      return false;
    }
  }
  return true;
}
