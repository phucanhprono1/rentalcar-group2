import {Component, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {Router} from "@angular/router";
import {BookingCarService} from "../../../services/booking-car.service";
import {DatePipe} from "@angular/common";
import {sequenceEqual} from "rxjs";

@Component({
  selector: 'app-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.css']
})
export class FinishComponent implements OnInit {

  booking: any;
  fromDate:string | null='';
  toDate:string | null='';
  carName: string='';
  bookingNumber: number=0;
  constructor(private authService: AuthService,
              private router: Router, private bookingCarService: BookingCarService
    , private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.bookingCarService.booking$.subscribe(
      booking => {
        if (booking) {
          this.booking = booking;
          this.bookingNumber=this.booking.bookingNo;
          console.log("Booking" + JSON.stringify(booking));
          const storedFormData = sessionStorage.getItem('searchFormData');
          if (storedFormData !== null) {  // Explicit null check
            try {
              const searchFormData = JSON.parse(storedFormData);
              this.fromDate = this.datePipe.transform(new Date(searchFormData.pickUpDate + "T" + searchFormData.pickUpTime), 'dd/MM/yyyy - hh:mm a');
              this.toDate = this.datePipe.transform(new Date(searchFormData.dropOffDate + "T" + searchFormData.dropOffTime), 'dd/MM/yyyy - hh:mm a');

            }
            catch (error) {
              console.error('Error parsing searchFormData from sessionStorage:', error);
            }
          }
          const nameStorage = sessionStorage.getItem("carName");
          if (nameStorage) {
            this.carName = nameStorage;
          }
        }
      }
    )
    const idStorage = sessionStorage.getItem("carId");
    {

    }
  }


  carInfo =
    {
      car: "Nissan Navara El 2017",
      bookingNumber: "1234567",
      pickUpDate: "13/02/2022 - 12:00 PM",
      returnDate: "23/02/2022 - 14:00 PM"
    }

  navigate(url: string): void {
    this.router.navigate([url]).then(success => {
      if (success) {
        console.log('Navigation was successful!');
      } else {
        console.log('Navigation failed!');
      }
    }).catch(error => {
      console.error('Error during navigation:', error);
    });
  }
}
