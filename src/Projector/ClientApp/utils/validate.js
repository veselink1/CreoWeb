import { upperFirst } from 'lodash';
export const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
export const usernameRegex = /^[a-zA-Z0-9]+([-_\.][a-zA-Z0-9]+)*[a-zA-Z0-9]$/;

/**
 * Validates an email address. 
 * Returns an error message or null (in case of corrent data).
 */
export function getEmailErrorText(email) {
  if (email.length === 0) {
    return "VALIDATE.EMAIL_EMPTY";
  }
  if (!emailRegex.test(email)) {
    return "VALIDATE.EMAIL_INVALID";
  }
  return null;
}

/**
 * Validates a password. (length between 8 and 16, alphanumeric, 1 uppercase, 1 lowercase, number, "-", "_", ".")
 * Returns an error message or null (in case of corrent data).
 */
export function getPasswordErrorText(password) {
  if (password.length === 0) {
    return "VALIDATE.PASSWORD_EMPTY";
  }
  if (password.length < 8) {
    return "VALIDATE.PASSWORD_TOO_SHORT";
  }
  if (password.length > 16) {
    return "VALIDATE.PASSWORD_TOO_LONG";
  }
  if (!passwordRegex.test(password)) {
    return "VALIDATE.PASSWORD_INVALID";
  }
  return null;
}

/**
 * Validates a name. (length between 1 and 50)
 * Returns an error message or null (in case of corrent data).
 */
export function getNameErrorText(name, nameVariant = "first") {
  nameVariant = nameVariant.toUpperCase();
  if (name.length === 0) {
    return `VALIDATE.${nameVariant}_NAME_EMPTY`;
  }
  if (name.indexOf(' ') === 0) {
    return `VALIDATE.${nameVariant}_NAME_BEGIN_SPACE`;
  }
  if (name.indexOf(' ') === name.length - 1) {
    return `VALIDATE.${nameVariant}_NAME_END_SPACE`;
  }
  if (name.indexOf('  ') !== -1) {
    return `VALIDATE.${nameVariant}_NAME_MULTIPLE_SPACES`;
  }
  if (name.length >= 50) {
    return `VALIDATE.${nameVariant}_NAME_TOO_LONG`;
  }
  return null;
}

/**
 * Validates a username. (length between 8 and 25, alphanumeric or '_', "-", ".")
 * Returns an error message or null (in case of corrent data).
 */
export function getUsernameErrorText(username) {
  if (username.length === 0) {
    return 'VALIDATE.USERNAME_EMPTY';
  }
  if (username.length < 8) {
    return 'VALIDATE.USERNAME_TOO_SHORT';
  }
  if (username.length > 25) {
    return 'VALIDATE.USERNAME_TOO_LONG';
  }
  if (!usernameRegex.test(username)) {
    return 'VALIDATE.USERNAME_INVALID';
  }
  return null;
}