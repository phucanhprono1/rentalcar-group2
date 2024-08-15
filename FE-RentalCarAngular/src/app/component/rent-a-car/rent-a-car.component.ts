import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {CarDetail} from "../../common/car-detail";
import {CarService} from "../../services/car.service";
import {resetParseTemplateAsSourceFileForTest} from "@angular/compiler-cli/src/ngtsc/typecheck/diagnostics";
import {DatePipe} from "@angular/common";


@Component({
  selector: 'app-rent-a-car',
  templateUrl: './rent-a-car.component.html',
  styleUrls: ['./rent-a-car.component.css'],
  providers: [DatePipe]
})
export class RentACarComponent implements OnInit {
  steps: string[] = ['Step 1: Basic', 'Step 2: Detail', 'Step 3: Pricing'];
  currentStep: number = 0;
  fromDate: string | null='';
  fromDateStorage: string | null='';
  toDate: string | null='';
  toDateStorage: string | null='';
  carId=0;
  address = "";
  private dateData: any;
  constructor(private router: Router, private carService: CarService, private datePipe: DatePipe) {

  }

  ngOnInit(): void {
    this.updateCurrentStep();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateCurrentStep();
      }
    });
    this.getStoredAddress();
    this.getStoredDate();
  }

  private getStoredAddress() {
    const storedCarAddress = sessionStorage.getItem('address');
    if (storedCarAddress) {  // Check if carId is available
      const parts = storedCarAddress.split(", "); // Split into an array of parts
     this.address = parts.slice(2).join(", "); // Take parts from index 2 onwards and join them
    } else {
      console.error('carId not received in Rent a car');
      // Handle the case where carId is not available (e.g., show an error message)
    }
  }

  private getStoredDate() {
    const storedFormData = sessionStorage.getItem('searchFormData');
    if (storedFormData !== null) {  // Explicit null check
      try {
        const searchFormData = JSON.parse(storedFormData);
        this.fromDate = this.datePipe.transform(new Date(searchFormData.pickUpDate + "T" + searchFormData.pickUpTime), 'dd/MM/yyyy - hh:mm a');
        this.toDate = this.datePipe.transform(new Date(searchFormData.dropOffDate + "T" + searchFormData.dropOffTime), 'dd/MM/yyyy - hh:mm a');
        const pickupDateTime = new Date(`${searchFormData.pickUpDate}T${searchFormData.pickUpTime}`);
        const dropOffDateTime = new Date(`${searchFormData.dropOffDate}T${searchFormData.dropOffTime}`);
        this.fromDateStorage = this.datePipe.transform(pickupDateTime, 'yyyy-MM-ddTHH:mm:ss');
        this.toDateStorage = this.datePipe.transform(dropOffDateTime, 'yyyy-MM-ddTHH:mm:ss');
        if (typeof this.fromDateStorage === "string" && typeof this.toDateStorage === "string" ) {
          sessionStorage.setItem("fromDate", this.fromDateStorage);
          sessionStorage.setItem("toDate", this.toDateStorage);
        }

      } catch (error) {
        console.error('Error parsing searchFormData from sessionStorage:', error);
      }
    } else {
      console.log('No searchFormData found in sessionStorage');
      // (Optional) Set default values for fromDate and toDate here
    }
  }

  updateCurrentStep() {
    const url = this.router.url;
    if (url.includes('booking-info')) {
      this.currentStep = 0;
    }
    else if (url.includes('payment')) {
      this.currentStep = 1;
    }else if (url.includes('finish')) {
      this.currentStep = 2;
    }




  }

   carInfo =
    {
      house: "Trung Kinh, Cau Giay, Ha Noi",
      pickUpDate: "13/02/2022 - 12:00 PM",
      returnDate: "23/02/2022 - 14:00 PM"
    }



}
