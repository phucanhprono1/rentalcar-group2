import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarBookingInfoComponent } from './car-booking-info.component';

describe('CarBookingInfoComponent', () => {
  let component: CarBookingInfoComponent;
  let fixture: ComponentFixture<CarBookingInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CarBookingInfoComponent]
    });
    fixture = TestBed.createComponent(CarBookingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
