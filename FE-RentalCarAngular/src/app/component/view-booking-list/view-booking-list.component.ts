import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingCarService } from '../../services/booking-car.service';
import { Page } from "../../services/car.service";
import { BookingInfo, BookingStatus } from "../../common/booking-info";
import { DocumentUploadService } from "../../services/document-upload.service";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FeedbackDto, FeedBackService } from "../../services/feed-back.service";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as bootstrap from "bootstrap";
import {environment} from "../../../environments/environment";

export interface ModalInterface {
  show: () => void;
  hide: () => void;
}
@Component({
  selector: 'app-view-booking-list',
  templateUrl: './view-booking-list.component.html',
  styleUrls: ['./view-booking-list.component.css']
})
export class ViewBookingListComponent implements OnInit, OnDestroy {
  bookings!: Page<BookingInfo>;
  page: number = 0;
  size: number = 10;
  sortBy: string = 'lastModifiedDate';
  order: string = 'desc';
  bookingNoForCancel: number | null = null;
  bookingNoForConfirmPickUp: number | null = null;
  bookingNoForReturn: number | null = null;

  successMess: string = '';
  errorMess: string = '';
  currentBooking: BookingInfo | null = null;
  rating: number = 0;
  feedBackSuccess: string = '';
  feedBackError: string = '';
  feedBackForm!: FormGroup;
  feedBackDto!: FeedbackDto;

  private unsubscribe$ = new Subject<void>();
  private messageModal: ModalInterface | null = null;

  constructor(
    private bookingService: BookingCarService,
    private documentUploadService: DocumentUploadService,
    private router: Router,
    private feedBackService: FeedBackService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.getBooking();
    this.initializeFormFeedBack();
    this.initializeMessageModal();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    ['cancelBookingModal', 'confirmPickUpModal', 'returnCarModal', 'giveRating'].forEach(modalId => {
      this.closeModal(modalId);
    });
  }
  initializeMessageModal() {
    const modalElement = document.getElementById('messageModal');
    if (modalElement) {
      this.messageModal = new (window as any).bootstrap.Modal(modalElement) as ModalInterface;
    }
  }

  showMessage(message: string) {
    const messageElement = document.getElementById('modalMessage');
    if (messageElement) {
      messageElement.textContent = message;
    }
    this.messageModal?.show();
  }

  getBooking() {
    const token = localStorage.getItem('token');
    if (token) {
      this.bookingService
        .getBookingByCustomer(token, this.page, this.size, this.sortBy, this.order)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          (data) => {
            this.bookings = data;
            this.loadImages();
          },
          (error) => {
            console.error('Error fetching bookings:', error);
          }
        );
    }
  }

  loadImages() {
    this.bookings.content.forEach(booking => {
      if (booking.images) {
        booking.images.forEach((img, index) => {
          this.viewFile(img, booking, index);
        });
      }
    });
  }

  viewFile(fileName: string, booking: BookingInfo, index: number): void {
    // this.documentUploadService.viewFile(fileName).subscribe(
    //   (file: Blob) => {
    //     const url = URL.createObjectURL(file);
    //     if (!booking.images) {
    //       booking.images = [];
    //     }
    //     booking.images[index] = url;
    //   },
    //   (error) => {
    //     console.error('Error viewing file:', error);
    //   }
    // );
    booking.images[index] = `${environment.fileViewUrl}${fileName}`;
  }

  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.size = +target.value;
    this.getBooking();
  }

  onPageChange(event: { page: number }) {
    this.page = event.page;
    this.getBooking();
  }

  onSortingChange(event: Event) {
    const selectedOption = (event.target as HTMLSelectElement).value;
    const [sortBy, order] = selectedOption.split(' ');
    this.sortBy = sortBy;
    this.order = order;
    this.getBooking();
  }

  transformStatus(bookingStatus: BookingStatus): string {
    const statusMap: { [key in BookingStatus]: string } = {
      [BookingStatus.CONFIRMED]: 'Confirmed',
      [BookingStatus.PENDING_DEPOSIT]: 'Pending deposit',
      [BookingStatus.IN_PROGRESS]: 'In progress',
      [BookingStatus.CANCELLED]: 'Cancelled',
      [BookingStatus.PENDING_PAYMENT]: 'Pending payment',
      [BookingStatus.COMPLETED]: 'Completed'
    };
    return statusMap[bookingStatus] || 'Unknown status';
  }

  openModal(modalId: string, bookingNo?: number) {
    if (bookingNo !== undefined) {
      if (modalId === 'cancelBookingModal') this.bookingNoForCancel = bookingNo;
      if (modalId === 'confirmPickUpModal') this.bookingNoForConfirmPickUp = bookingNo;
      if (modalId === 'returnCarModal') {
        this.bookingNoForReturn = bookingNo;
        this.currentBooking = this.bookings.content.find(b => b.bookingNo === bookingNo) || null;
      }
      if (modalId === 'giveRating') {
        this.currentBooking = this.bookings.content.find(b => b.bookingNo === bookingNo) || null;
      }
    }
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });
      modal.show();
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.closeModal(modalId);
      });
    }
  }

  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
        document.body.classList.remove('modal-open');
      }
    }
  }

  cancelBooking() {
    if (this.bookingNoForCancel !== null) {
      const token = localStorage.getItem('token');
      if (token) {
        this.bookingService.cancelBooking(this.bookingNoForCancel, token)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(
            res => {
              this.showMessage('Cancelled booking successfully!');
              this.refreshBookings();
            },
            err => {
              this.showMessage('Cancelled booking failed!');
              console.error('Cancellation error:', err);
            }
          );
        this.bookingNoForCancel = null;
      }

    }
  }

  confirmPickUp() {
    const token = localStorage.getItem('token');
    if (token && this.bookingNoForConfirmPickUp !== null) {
      this.bookingService.confirmPickUp(this.bookingNoForConfirmPickUp, token)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          res => {
            this.showMessage('Confirmed pickup successfully!');
            this.refreshBookings();
          },
          err => {
            this.showMessage('Confirmed pick up failed!');
            console.error('Confirmation error:', err);
          }
        );
      this.bookingNoForConfirmPickUp = null;
    }
  }

  confirmReturn(): void {
    const token = localStorage.getItem('token');
    if (token && this.bookingNoForReturn !== null) {
      this.bookingService.confirmReturn(this.bookingNoForReturn, token)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          response => {
            this.showMessage(response.message);
            this.refreshBookings();
            this.openModal('giveRating');
            this.prepareForFeedback();
          },
          error => {
            console.log("Funni error" + JSON.stringify(error));
            this.showMessage(error.error.message);
          }
        );
    }
  }
  prepareForFeedback(): void {
    this.initializeFormFeedBack();
    this.currentBooking = this.bookings.content.find(b => b.bookingNo === this.bookingNoForReturn) || null;
  }

  initializeFormFeedBack() {
    this.feedBackForm = this.formBuilder.group({
      ratings: [0, Validators.required],
      content: ['', Validators.required]
    });
  }

  setRating(value: number) {
    this.rating = value;
    this.feedBackForm.get('ratings')?.setValue(this.rating);
  }

  submitFeedBack(): void {
    if (this.feedBackForm.invalid) {
      this.feedBackForm.markAllAsTouched();
      return;
    }
    if (this.currentBooking) {
      const date = new Date().toISOString().split('.')[0];
      this.feedBackDto = new FeedbackDto(
        this.feedBackForm.get('ratings')?.value,
        this.feedBackForm.get('content')?.value,
        this.currentBooking.bookingNo,
        date
      );
      const token = localStorage.getItem('token');
      if(token){
        this.feedBackService.sendFeedback(this.feedBackDto, token)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(
            response => {
              this.showMessage(response.message);
              this.closeModal('giveRating');
              this.refreshBookings();
            },
            error => {
              this.showMessage(error.error.message);
            }
          );
      }
    }
  }

  refreshBookings(): void {
    this.getBooking();
  }

  showAlert(message: string, type: 'success' | 'error'): void {
    // Implement your preferred alert mechanism here
    alert(`${type.toUpperCase()}: ${message}`);
  }

  getStatusClass(status: BookingStatus): string {
    const classMap: { [key in BookingStatus]: string } = {
      [BookingStatus.CONFIRMED]: 'text-success fw-bold',
      [BookingStatus.IN_PROGRESS]: 'text-success fw-bold',
      [BookingStatus.COMPLETED]: 'text-success fw-bold',
      [BookingStatus.PENDING_DEPOSIT]: 'text-warning fw-bold',
      [BookingStatus.PENDING_PAYMENT]: 'text-warning fw-bold',
      [BookingStatus.CANCELLED]: 'text-danger fw-bold'
    };
    return classMap[status] || '';
  }
}
