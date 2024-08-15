import { TestBed } from '@angular/core/testing';

import { BookingCarService } from './booking-car.service';

describe('BookingCarService', () => {
  let service: BookingCarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingCarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
