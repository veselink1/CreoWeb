export async function getFilesAsync(project) {
  let config = {
    method: 'GET',
    credentials: 'same-origin',
  }

  let response = null;
  try {
    response = await fetch(`/api/userfiles/${project}/list`, config);
  } catch (e) {
    throw Object.assign(new Error('The file list request failed.'), { response });
  }

  if (response.ok) {
    return await response.json();
  } else {
    throw Object.assign(new Error('The file list request failed.'), { response });
  }
}


export async function readFileAsync(project, path) {
  let config = {
    method: 'GET',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }
  }

  let response = null;
  try {
    response = await fetch(`/api/userfiles/${project}/read/${encodeURIComponent(path)}`, config);
  } catch (e) {
    throw Object.assign(new Error('The file read request failed.'), { response });
  }

  if (response.ok) {
    return await response.blob();
  } else {
    throw Object.assign(new Error('The file read request failed.'), { response });
  }
}

export async function writeFileAsync(project, path, blob, contentType) {
  var data = new FormData();
  data.append('path', path);
  data.append('file', blob);
  data.append('contentType', contentType);

  let config = {
    method: 'POST',
    credentials: 'same-origin',
    body: data,
  }

  let response = null;
  try {
    response = await fetch(`/api/userfiles/${project}/write`, config);
  } catch (e) {
    throw Object.assign(new Error('The file write request failed.'), { response });
  }

  if (response.ok) {
    return await response.json();
  } else {
    throw Object.assign(new Error('The file write request failed.'), { response });
  }
}

export async function deleteFileAsync(project, path) {
  let config = {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  }

  let response = null;
  try {
    response = await fetch(`/api/userfiles/${project}/delete`, config);
  } catch (e) {
    throw Object.assign(new Error('The file delete request failed.'), { response });
  }

  if (response.ok) {
    return await response.json();
  } else {
    throw Object.assign(new Error('The file delete request failed.'), { response });
  }
}

export async function renameFileAsync(project, oldPath, newPath) {
  let config = {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPath, newPath }),
  }

  let response = null;
  try {
    response = await fetch(`/api/userfiles/${project}/rename`, config);
  } catch (e) {
    throw Object.assign(new Error('The file rename request failed.'), { response });
  }

  if (response.ok) {
    return await response.json();
  } else {
    throw Object.assign(new Error('The file rename request failed.'), { response });
  }
}