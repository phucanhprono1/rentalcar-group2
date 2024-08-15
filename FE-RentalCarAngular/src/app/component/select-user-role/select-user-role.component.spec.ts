import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectUserRoleComponent } from './select-user-role.component';

describe('SelectUserRoleComponent', () => {
  let component: SelectUserRoleComponent;
  let fixture: ComponentFixture<SelectUserRoleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectUserRoleComponent]
    });
    fixture = TestBed.createComponent(SelectUserRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
