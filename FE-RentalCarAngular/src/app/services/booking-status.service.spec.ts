import { TestBed } from '@angular/core/testing';

import { BookingStatusService } from './booking-status.service';

describe('BookingStatusService', () => {
  let service: BookingStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
