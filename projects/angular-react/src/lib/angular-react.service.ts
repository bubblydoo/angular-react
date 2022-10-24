import { Injectable } from '@angular/core';
import { Wrapper } from './nest-wrappers/nest-wrappers';

@Injectable({
  providedIn: 'root'
})
export class AngularReactService {

  constructor() { }

  wrappers: Wrapper[] = [];

  addWrapper(wrapper: Wrapper) {
    this.wrappers = [...this.wrappers, wrapper];
  }

  getWrappers() {
    return this.wrappers;
  }
}
