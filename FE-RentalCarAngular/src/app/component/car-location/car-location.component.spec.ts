import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarLocationComponent } from './car-location.component';

describe('CarLocationComponent', () => {
  let component: CarLocationComponent;
  let fixture: ComponentFixture<CarLocationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CarLocationComponent]
    });
    fixture = TestBed.createComponent(CarLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
