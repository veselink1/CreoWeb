/**
 * Send a package installation request. 
 * The promise it returns resolves when the package installation process has completed.
 * The resolved value takes the form { ok: Boolean, message: String }.
 * The promise is only rejected if the server sends an error code.
 * The rejected value an error with an additional "response" property - the response object.
 * @returns {Promise}
 * @param  {String} project - The name of the project.
 * @param  {String} pkg - The name of the package.
 */
export async function installPackageAsync(project, pkg) {
  let config = {
    method: 'POST',
    credentials: 'same-origin',
  }

  _cache.isDirty = true;

  let response = null;
   try {
    response = await fetch(`/api/userpackages/${project}/install/${pkg}`, config);
  } catch (e) {
    throw Object.assign(new Error('The package installation request failed.'), { response });
  }

  if (response.ok) {
    let result = await response.json();
    try {
      await getBundleAsync(project);
    } catch (e) {
      throw Object.assign(new Error('The package installation request succeeded but the resulting bundle could not be obtained.'), { response });
    }
    return result;
  } else {
    throw Object.assign(new Error('The package installation request failed.'), { response });
  }
}

/**
 * Send a package uninstallation request. 
 * The promise it returns resolves when the package uninstallation process has completed.
 * The resolved value takes the form { ok: Boolean, message: String }.
 * The promise is only rejected if the server sends an error code.
 * The rejected value an error with an additional "response" property - the response object.
 * @returns {Promise}
 * @param  {String} project - The name of the project.
 * @param  {String} pkg - The name of the package.
 */
export async function uninstallPackageAsybc(project, pkg) {
  let config = {
    method: 'POST',
    credentials: 'same-origin',
  }

  _cache.isDirty = true;

  let response = null;
  try {
    response = await fetch(`/api/userpackages/${project}/uninstall/${pkg}`, config);
  } catch (e) {
    throw Object.assign(new Error('The package uninstallation request failed.'), { response });
  }

  if (response.ok) {
    let result = await response.json();
    try {
      await getBundleAsync(project);
    } catch (e) {
      throw Object.assign(new Error('The package installation request succeeded but the resulting bundle could not be obtained.'), { response });
    }
    return result;
  } else {
    throw Object.assign(new Error('The package uninstallation request failed.'), { response });
  }
}

/**
 * Checks if the user package directory has been already initialized.
 * The resolved value takes the form { initialized: Boolean, packageUrl: String, bundleUrl: String }.
 * The promise is only rejected if the server sends an error code.
 * The rejected value an error with an additional "response" property - the response object.
 * @returns {Promise}
 * @param  {String} project - The name of the project.
 */
export function isInitializedAsync(project) {
  let config = {
    method: 'GET',
    credentials: 'same-origin',
  }

  return fetch(`/api/userpackages/${project}/initialized`, config)
    .then(response =>
      response.ok
        ? response.json()
        : Promise.reject(Object.assign(new Error('Response was not OK.'), { response }))
    );
}

export function getPackageJSONAsync(packageJSONUrl) {
  let config = {
    method: 'GET',
    credentials: 'same-origin',
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
  };

  if (_cache.isConfigDirty) {
    return fetch(packageJSONUrl, config)
      .then(async response => {
        if (response.ok) {
          const json = await response.json();
          _cache.config = json;
          _cache.isConfigDirty = false;
          return json;
        } else {
          return Promise.reject(Object.assign(new Error('Response was not OK.'), { response }))
        }
      });
  } else {
    return Promise.resolve(_cache.config);
  }
}

let _cache = {
  isBundleDirty: true,
  bundle: 'console.log("Package bundle missing!");',
  config: null,
  isConfigDirty: true,
  get isDirty() {
    return this.isBundleDirty && this.isConfigDirty;
  },
  set isDirty(value) {
    this.isBundleDirty = value;
    this.isConfigDirty = value;
  }
};

/**
 * Get the user's webpack package bundle.
 * The resolved value is the JavaScript code of the bundle.
 * The promise is only rejected if the server sends an error code.
 * The rejected value an error with an additional "response" property - the response object.
 * @returns {Promise}
 * @param  {String} project - The name of the project.
 */
export function getBundleAsync(project) {
  let config = {
    method: 'GET',
    credentials: 'same-origin',
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
  };

  if (_cache.isBundleDirty) {
    return fetch(`/api/userpackages/${project}/bundle`, config)
      .then(async response => {
        if (response.ok) {
          const text = await response.text();
          _cache.bundle = text;
          _cache.isBundleDirty = false;
          return text;
        } else {
          return Promise.reject(Object.assign(new Error('Response was not OK.'), { response }))
        }
      })
      .catch(e => {
        return Promse.reject(e);
      });
  } else {
    return Promise.resolve(_cache.bundle);
  }
}