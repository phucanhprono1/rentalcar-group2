import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePageCustomerComponent } from './home-page-customer.component';

describe('HomePageCustomerComponent', () => {
  let component: HomePageCustomerComponent;
  let fixture: ComponentFixture<HomePageCustomerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomePageCustomerComponent]
    });
    fixture = TestBed.createComponent(HomePageCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
