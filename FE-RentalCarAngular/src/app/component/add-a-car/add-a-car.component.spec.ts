import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddACarComponent } from './add-a-car.component';

describe('AddACarComponent', () => {
  let component: AddACarComponent;
  let fixture: ComponentFixture<AddACarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddACarComponent]
    });
    fixture = TestBed.createComponent(AddACarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
