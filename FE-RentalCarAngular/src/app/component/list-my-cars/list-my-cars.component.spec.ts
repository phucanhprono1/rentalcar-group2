import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMyCarsComponent } from './list-my-cars.component';

describe('ListMyCarsComponent', () => {
  let component: ListMyCarsComponent;
  let fixture: ComponentFixture<ListMyCarsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListMyCarsComponent]
    });
    fixture = TestBed.createComponent(ListMyCarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
