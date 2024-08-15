import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeopleCommentComponent } from './people-comment.component';

describe('PeopleCommentComponent', () => {
  let component: PeopleCommentComponent;
  let fixture: ComponentFixture<PeopleCommentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PeopleCommentComponent]
    });
    fixture = TestBed.createComponent(PeopleCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
