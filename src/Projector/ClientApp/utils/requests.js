import * as _ from 'lodash';

export function getRequestParams() {
  const obj = {};
  location.search.slice(1)
    .split('&')
    .filter(x => !!x)
    .map(x => x.split('='))
    .forEach(([k, v]) => obj[k] = decodeURIComponent(v));
  return obj;
}

const SPECIAL_MASK_NUMBER = 8462856391759472;

export function maskDatabaseId(id) {
  return (SPECIAL_MASK_NUMBER - id).toString(36);
}

export function unmaskDatabaseId(id) {
  return Number.parseInt(id, 36) - SPECIAL_MASK_NUMBER;
}