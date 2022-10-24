import { Injectable } from '@angular/core';
import { Wrapper } from './nest-wrappers/nest-wrappers';

@Injectable({
  providedIn: 'root'
})
export class AngularReactService {

  constructor() { }

  wrappers: Wrapper[] = [];
}
