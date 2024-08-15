import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarRatingStarComponent } from './car-rating-star.component';

describe('CarRatingStarComponent', () => {
  let component: CarRatingStarComponent;
  let fixture: ComponentFixture<CarRatingStarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CarRatingStarComponent]
    });
    fixture = TestBed.createComponent(CarRatingStarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
