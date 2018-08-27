
export async function getSites() {
  var res = await fetch("/api/Site/GetSites", {
    method: 'GET',
    credentials: 'same-origin',
  });
  var obj = await res.json();
  return obj;
}
export async function isCollaboratorExists(email) {
  var data = JSON.stringify({ "Email": email });
  var res = await fetch("/api/Site/CheckCollaborator", {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': "application/json" },
    body: data
  });
  var obj = await res.json();
  return obj;
}
export async function getComponentData(componentId) {
  var res = await fetch(`/api/Site/ComponentData?componentId=${componentId}`, {
    method: 'GET',
    credentials: 'same-origin',
  });
  var obj = await res.json();
  return obj.data;
}
export async function getResourceData({ siteId, componentId }) {
  const query = componentId
    ? `/api/Site/ResourceData?componentId=${componentId}`
    : `/api/Site/ResourceData?siteId=${siteId}`;
  var res = await fetch(query, {
    method: 'GET',
    credentials: 'same-origin',
  });
  var obj = await res.json();
  return obj.data;
}
export async function editComponent(componentPartial) {
  let config = {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(componentPartial),
  }
  var res = await fetch('/api/Site/EditComponent', config);
  var obj = await res.json();
  return obj;
}
export async function addSiteToDB(n) {
  var data = JSON.stringify({ "SiteName": n.siteName, "Description": n.description, "Favicon": n.favicon, "IsHosted": n.isHosted, "Storage": n.storage, "Url": n.url, "Collaborators": n.Collaborators });
  var res = await fetch("/api/Site/AddSite", {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': "application/json" },
    body: data
  });
  var obj = await res.json();
  return obj;
}
export async function addComponentToDB(n) {
  var data = JSON.stringify({ "SiteID": n.siteID, "ComponentText": n.componentText, "IsPage": n.isPage, "Name": n.name, "Screenshot": n.screenshot, "IsPrefab": n.isPrefab, "Description": n.description });
  var res = await fetch("/api/Site/AddComponent", {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': "application/json" },
    body: data
  });
  var obj = await res.json();
  return obj;
}
export async function deleteSite(id) {
  var data = JSON.stringify({ "ID": id });
  var res = await fetch("/api/Site/DeleteSite", {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': "application/json" },
    body: data
  });
  var obj = await res.json();
  return obj.success;
}
export async function deleteComponent(id) {
  var data = JSON.stringify({ "ID": id });
  var res = await fetch("/api/Site/DeleteComponent", {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': "application/json" },
    body: data
  });
  var obj = await res.json();
  return obj.success;
}
export async function editSite(n) {
  console.log("Edit site", n);
  var data = JSON.stringify(n);
  var res = await fetch("/api/Site/EditSite", {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': "application/json" },
    body: data
  });
  var obj = await res.json();
  return obj;
}