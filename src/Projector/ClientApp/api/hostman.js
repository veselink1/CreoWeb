export async function updateWebsiteAsync(projectId, websiteUrl, archiveBlob) {
  var data = new FormData();
  data.append('projectId', projectId);
  data.append('archive', archiveBlob);

  let config = {
    method: 'POST',
    credentials: 'same-origin',
    body: data,
  }

  let response = null;
  try {
    response = await fetch(`/www/${websiteUrl}/`, config);
  } catch (e) {
    throw Object.assign(new Error('The website update request failed.'), { response });
  }

  if (response.ok) {
    return await response.json();
  } else {
    throw Object.assign(new Error('The webiste update request failed.'), { response });
  }
}