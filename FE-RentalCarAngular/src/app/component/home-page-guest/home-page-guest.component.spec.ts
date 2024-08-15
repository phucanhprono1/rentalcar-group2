import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePageGuestComponent } from './home-page-guest.component';

describe('HomePageGuestComponent', () => {
  let component: HomePageGuestComponent;
  let fixture: ComponentFixture<HomePageGuestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomePageGuestComponent]
    });
    fixture = TestBed.createComponent(HomePageGuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
