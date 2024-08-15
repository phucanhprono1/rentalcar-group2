import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCarDetailComponent } from './edit-car-detail.component';

describe('EditCarDetailComponent', () => {
  let component: EditCarDetailComponent;
  let fixture: ComponentFixture<EditCarDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditCarDetailComponent]
    });
    fixture = TestBed.createComponent(EditCarDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
