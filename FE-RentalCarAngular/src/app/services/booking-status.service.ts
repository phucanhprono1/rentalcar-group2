import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BookingStatusService {
  private bookingStatusSubject = new BehaviorSubject<string>('');
  public bookingStatus$ = this.bookingStatusSubject.asObservable();

  constructor() { }

  updateBookingStatus(status: string) {
    this.bookingStatusSubject.next(status);
  }

  get currentStatus(): string {
    return this.bookingStatusSubject.getValue();
  }
}
