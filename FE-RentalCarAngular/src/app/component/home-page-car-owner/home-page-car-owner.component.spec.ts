import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePageCarOwnerComponent } from './home-page-car-owner.component';

describe('HomePageCarOwnerComponent', () => {
  let component: HomePageCarOwnerComponent;
  let fixture: ComponentFixture<HomePageCarOwnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomePageCarOwnerComponent]
    });
    fixture = TestBed.createComponent(HomePageCarOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
