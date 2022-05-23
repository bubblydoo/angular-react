import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularReactComponent } from './angular-react.component';

describe('AngularReactComponent', () => {
  let component: AngularReactComponent;
  let fixture: ComponentFixture<AngularReactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AngularReactComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AngularReactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
