import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlappyBirdComponent } from './flappy-bird.component';

describe('FlappyBirdComponent', () => {
  let component: FlappyBirdComponent;
  let fixture: ComponentFixture<FlappyBirdComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FlappyBirdComponent]
    });
    fixture = TestBed.createComponent(FlappyBirdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
