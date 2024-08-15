import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDepositComponent } from './confirm-deposit.component';

describe('ConfirmDepositComponent', () => {
  let component: ConfirmDepositComponent;
  let fixture: ComponentFixture<ConfirmDepositComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmDepositComponent]
    });
    fixture = TestBed.createComponent(ConfirmDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
