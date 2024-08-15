import { TestBed } from '@angular/core/testing';

import { FormValidateConstantService } from './form-validate-constant.service';

describe('FormValidateConstantService', () => {
  let service: FormValidateConstantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormValidateConstantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
