import { TestBed } from '@angular/core/testing';

import { DataService } from './base-service.service';

describe('BaseServiceService', () => {
  let service: DataService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
