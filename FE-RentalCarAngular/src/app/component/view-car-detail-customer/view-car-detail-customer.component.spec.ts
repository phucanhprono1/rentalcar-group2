import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCarDetailCustomerComponent } from './view-car-detail-customer.component';

describe('ViewCarDetailCustomerComponent', () => {
  let component: ViewCarDetailCustomerComponent;
  let fixture: ComponentFixture<ViewCarDetailCustomerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCarDetailCustomerComponent]
    });
    fixture = TestBed.createComponent(ViewCarDetailCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
