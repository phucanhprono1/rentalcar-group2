import {Component, Input, inject, Type, OnInit, Output, EventEmitter} from '@angular/core';
import {CarService} from "../../../services/car.service";
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngbd-modal-confirm-autofocus',
  standalone: true,
  template: `
    <div class="modal-header">
      <h4 class="modal-title" id="modal-title">Confirm deposit</h4>
      <button
        type="button"
        class="btn-close"
        aria-label="Close button"
        aria-describedby="modal-title"
        (click)="modal.dismiss('Cross click')"
      ></button>
    </div>
    <div class="modal-body">
      <p>
        <strong>Please confirm that you have receive the deposit this booking.
          This will allow customer to pick-up the car at the agreed date and time.</strong>
      </p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="modal.dismiss('cancel click')">No</button>
      <button type="button" ngbAutofocus class="btn btn-danger" (click)="confirmDeposit()">Yes</button>
    </div>
  `,
})
export class NgbdModalConfirmAutofocus implements OnInit {
  @Input() carId!: number;
  @Input() currentStatus!: string;
  @Input() targetStatus!: string;
  @Output() messageEvent = new EventEmitter<string>();

  modal = inject(NgbActiveModal);

  constructor(private carService: CarService) {
  }

  ngOnInit(): void {
    console.log({carId: this.carId, current: this.currentStatus, target: this.targetStatus});
  }

  confirmDeposit() {
    this.carService.updateBookingStatus(this.carId, this.currentStatus, this.targetStatus, this.carService.getUserToken()!).subscribe(data => {
        this.modal.close({carId: this.carId, status: 'BOOKED'});
      },
      error => {
        console.error("Confirm deposit failed: " + error);
      });
  }
}

const MODALS: { [name: string]: Type<any> } = {
  autofocus: NgbdModalConfirmAutofocus,
};

@Component({
  selector: 'app-confirm-deposit',
  templateUrl: './confirm-deposit.component.html',
  styleUrls: ['./confirm-deposit.component.css']
})
export class ConfirmDepositComponent {
  @Input() carId!: number;
  @Input() currentStatus!: string;
  @Input() targetStatus!: string;
  @Output() updateEvent = new EventEmitter<number>();

  private modalService = inject(NgbModal);

  open(name: string) {
    const modalRef = this.modalService.open(MODALS[name]);
    modalRef.componentInstance.carId = this.carId;
    modalRef.componentInstance.currentStatus = this.currentStatus;
    modalRef.componentInstance.targetStatus = this.targetStatus;
    modalRef.result.then(value => this.updateEvent.emit(value))
  }

}

