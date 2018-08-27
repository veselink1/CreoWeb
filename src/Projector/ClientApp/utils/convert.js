import { rawJs, isRawJs, extractJsFromRaw } from '~/utils/irdom';

export const TYPES = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  OBJECT: 'OBJECT',
  NULL: 'NULL',
  ARRAY: 'ARRAY',
  BOOLEAN: 'BOOLEAN',
  DYNAMIC: 'DYNAMIC',
  COLOR: 'COLOR',
  STYLE: 'STYLE',
};

export function typeOf(value) {
  switch (typeof value) {
    case 'string': return isRawJs(value) ? TYPES.DYNAMIC : TYPES.STRING;
    case 'number': return TYPES.NUMBER;
    case 'object': return value === null ? TYPES.NULL : value instanceof Array ? TYPES.ARRAY : TYPES.OBJECT;
    case 'boolean': return TYPES.BOOLEAN;
  }
}

export function defaultForType(type) {
  switch (type) {
    case TYPES.ARRAY: return [];
    case TYPES.DYNAMIC: return rawJs('10 + 2');
    case TYPES.BOOLEAN: return false;
    case TYPES.NULL: return null;
    case TYPES.NUMBER: return 0;
    case TYPES.OBJECT: return {};
    case TYPES.STRING: return "";
    case TYPES.COLOR: return "rgba(255,255,255,1)";
    case TYPES.STYLE: return {};
  }
}

export function friendlyTypeName(type) {
  switch (type) {
    case TYPES.ARRAY: return 'multiple';
    case TYPES.DYNAMIC: return 'dynamic';
    case TYPES.BOOLEAN: return 'boolean';
    case TYPES.NULL: return 'nothing';
    case TYPES.NUMBER: return 'number';
    case TYPES.OBJECT: return 'dictionary';
    case TYPES.STRING: return 'text';
    case TYPES.COLOR: return 'color';
    case TYPES.STYLE: return 'style';
  }
}
