import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Wrapper } from './nest-wrappers/nest-wrappers';

@Injectable({
  providedIn: 'root'
})
export class AngularReactService {

  constructor() { }

  /** Wrappers used to encapsulate all components passed to react-wrapper */
  wrappers: Wrapper[] = [];
}
