import { TestBed } from '@angular/core/testing';

import { AngularReactService } from './angular-react.service';

describe('AngularReactService', () => {
  let service: AngularReactService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularReactService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
