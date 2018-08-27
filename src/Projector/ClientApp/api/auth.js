
/**
 * Send a login request.
 * @param  {String} email - The email of the user.
 */
export function loginRequest(email, password) {
  let config = {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `email=${email}&password=${password}`
  }

  return fetch('/api/auth', config)
    .then(response => {
      return response.json()
        .then(json => ({ json, response }))
        .catch(e => Promise.resolve({ json: null, response }));
    });
}

/**
 * Send a logout request.
 */
export function logoutRequest() {
  let config = {
    method: 'GET',
    credentials: 'include',
  }

  return fetch('/api/User/Logout', config)
    .then(response =>
      response.ok
        ? response.json().then()
        : Promise.reject(response)
    );
}