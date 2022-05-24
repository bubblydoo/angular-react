import { Injectable } from '@angular/core';
import { Wrapper } from './util/nest-wrappers';

@Injectable({
  providedIn: 'root'
})
export class AngularReactService {

  constructor() { }

  wrappers: Wrapper[] = [];
}
