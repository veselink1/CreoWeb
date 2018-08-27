import ReplicateDB from '~/utils/ReplicateDB';
import { pick } from 'lodash';
import * as siteman from '~/api/sites';
import { GLOBAL_GROUP } from '~/reducers/resources';
import * as IR from '~/utils/irdom';

let instance = null;

export function getInstance() {
  return instance;
}

export default function setupReplicateDB(reduxStore) {
  let prevState = reduxStore.getState();
  let fetchCb = state => {
    let project = state.project;
    let oldProject = prevState.project;
    let resources = state.resources;
    let oldResources = prevState.resources;
    for (let component of project.components) {
      if (oldProject.components.indexOf(component) === -1) {
        const trimmedComponent = Object.assign({}, component, { timeline: { prev: [], next: [] }, nodes: IR.serialize(component.nodes)});
        siteman.editComponent({ id: component.id, componentText: JSON.stringify(trimmedComponent) });
      }
    }
    for (let key in resources.records) {
      if (Object.prototype.hasOwnProperty.call(resources.records, key)) {
        if (oldResources[key] !== resources.records[key]) {
          if (key === GLOBAL_GROUP) {
            siteman.editSite({ id: project.id, resources: JSON.stringify(resources.records[key]) });
          } else {
            let componentId = project.components.filter(x => x.name === key)[0].id;
            siteman.editComponent({ id: componentId, resources: JSON.stringify(resources.records[key]) });
          }
        }
      }
    }
    prevState = state;
    console.log("Replicating state!", state);
  };

  let db = new ReplicateDB(fetchCb, {
    throttleInterval: 5000,
    maxSkips: 5,
    project: state => pick(state, [
      'resources',
      'project',
    ])
  });

  db.connectToRedux(reduxStore);
  instance = db;

  return db;
}