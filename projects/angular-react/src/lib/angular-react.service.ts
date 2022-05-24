import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AngularReactService {

  constructor() { }

  wrappers: ((children: any) => any)[] = [];
}
