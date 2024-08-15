import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {BookingInfo} from "../common/booking-info";
import {Page} from "./car.service";
import {EditBookingDto} from "../common/edit-booking-dto";

interface BookingResponse {
  carId: number;
  startDateTime: string;
  endDateTime: string;
  bookingNo: number;
  message: string;
  driverId: number;
  // ... (Add other properties from the response if needed)
}


@Injectable({
  providedIn: 'root'
})

export class BookingCarService {
  private baseUrl = environment.baseUrl;

  token:string='';

  private bookingSubject = new BehaviorSubject<BookingResponse | null>(null);
  booking$ = this.bookingSubject.asObservable();

  setBooking(booking: BookingResponse) {
    this.bookingSubject.next(booking);
  }

  constructor(private http: HttpClient) {}

  createBooking(bookingRequest: any, token:string, customerDriverLicense: File|undefined, customerDriverDriverLicense: File|undefined): Observable<any> {
    const formData = new FormData();
    formData.append('bookingCarRequest',new Blob([JSON.stringify(bookingRequest)] , { type: 'application/json' }));
    // formData.append('request', new Blob([JSON.stringify(profileData)], { type: 'application/json' }));

    if (token)
    {
      this.token=token;
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
    });

    if (customerDriverLicense) {
      formData.append('customerDriverLicense', customerDriverLicense);
    }

    if (customerDriverDriverLicense) {
      formData.append('customerDriverDriverLicense', customerDriverDriverLicense);
    }

    return this.http.post<BookingResponse>(`${this.baseUrl}/bookings/book`, formData, {headers});
  }
  getBookingByCustomer(token: string, page: number = 0, size: number = 10, sortBy: string = 'lastModifiedDate', order: string = 'desc'): Observable<Page<BookingInfo>> {
    const headers = { 'Authorization': `Bearer ${token}` };
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('order', order);

    return this.http.get<Page<BookingInfo>>(`${this.baseUrl}/bookings/view-all-by-current-customer`, { headers, params });
  }
  getBookingByBookingNo(bookingNo: number, token: string):Observable<BookingInfo>{
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get<BookingInfo>(`${this.baseUrl}/bookings/${bookingNo}`,{headers})
  }
  getCurrentBalance(token: string): Observable<number>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.get<number>(this.baseUrl + '/payment/currentBalance',{headers})
  }
  cancelBooking(bookingNo: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    const url = `${this.baseUrl}/bookings/cancel/${bookingNo}`;
    return this.http.put(url, {},{headers});
  }
  confirmPickUp(bookingNo: number,token: string): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    const url = `${this.baseUrl}/bookings/confirm-pick-up/${bookingNo}`;
    return this.http.put(url,{},{headers});
  }
  confirmReturn(bookingNo: number, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.baseUrl}/bookings/return-car/${bookingNo}`, {}, { headers });
  }
  editBooking(bookingNo: number, editBookingDto: EditBookingDto,token: string, customerDriverLicense?: File, customerDriverDriverLicense?: File): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('bookingCarRequest', new Blob([JSON.stringify(editBookingDto)], { type: 'application/json' }));

    if (customerDriverLicense) {
      formData.append('customerDriverLicense', customerDriverLicense);
    }

    if (customerDriverDriverLicense) {
      formData.append('customerDriverDriverLicense', customerDriverDriverLicense);
    }

    return this.http.put(`${this.baseUrl}/bookings/edit/${bookingNo}`, formData, {headers});
  }
}
