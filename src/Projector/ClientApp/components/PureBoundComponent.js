import { PureComponent } from 'react';

function bindMethods(self) {
  for (let key of self) {
    const value = self[key];
    try {
      if (value && value instanceof Function) {
        self[key] = value.bind(self);
      }
    } catch (e) {
      // Drop setter errors.
    }
  }
}

export default class PureBoundComponent extends PureComponent {

  constructor(props) {
    super(props);
    setImmediate(bindMethods, this);
  }

}