import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactWrapperComponent } from './react-wrapper.component';

describe('ReactWrapperComponent', () => {
  let component: ReactWrapperComponent;
  let fixture: ComponentFixture<ReactWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReactWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
