import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbNailViewComponent } from './thumb-nail-view.component';

describe('ThumbNailViewComponent', () => {
  let component: ThumbNailViewComponent;
  let fixture: ComponentFixture<ThumbNailViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThumbNailViewComponent]
    });
    fixture = TestBed.createComponent(ThumbNailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
