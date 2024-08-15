import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CarDetail} from "../../../common/car-detail";
import {CarService} from "../../../services/car.service";
import {Observable, Subscription} from "rxjs";
import {DocumentUploadService} from "../../../services/document-upload.service";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-car-booking-info',
  templateUrl: './car-booking-info.component.html',
  styleUrls: ['./car-booking-info.component.css']
})
export class CarBookingInfoComponent implements OnInit {
  isLoading: boolean = true;
  carDetail!: CarDetail;
  firstPic: string = '';
  carImages: string[] = [];
  dateData: any;
  deposit: number = 0;
  days: number = 0;
  basePrice = 1;
  address = "";
  status = "";
  private subscription: Subscription | undefined;

  constructor(private documentUploadService: DocumentUploadService,
              private router: Router, private carService: CarService, private route: ActivatedRoute) {
  }


  @Input() carId!: number;

  ngOnInit(): void {
    if (this.carId) {  // Check if carId is available
      this.carService.getCarData(this.carId).subscribe(
        (data) => {
          if (data) {
            this.carDetail = data.carDetail;
            this.carImages = data.carImages
            sessionStorage.setItem("carName", this.carDetail.name);
            console.log("CAR RATING" + this.carDetail.rating);

            // this.viewFile(this.carImages[0]).subscribe(
            //   (file: Blob) => {
            //     if (this.carDetail)
            //     this.carImages[this.carDetail?.id][this.carImages[this.carDetail?.id].indexOf(this.carImages[0])] = URL.createObjectURL(file);
            //   },
            //   error => {
            //     console.error('Error viewing file:', error);
            //   }
            // );
            console.log("Car image: " + this.carImages);
            this.basePrice = +this.carDetail!.basePrice;
            this.deposit = +this.carDetail!.deposit;
            sessionStorage.setItem('deposit', JSON.stringify(this.deposit));
            this.isLoading = false;
            const part = this.carDetail.address.split(", "); // Split into an array of parts
            this.address = part.slice(2).join(", "); // Take parts from index 2 onwards and join them
            switch (this.carDetail.carStatus) {
              case "AVAILABLE"  : {
                this.status = "Available";
                break;
              }
              case "BOOKING"  : {
                this.status = "Booking";
                break;
              }
              case "STOPPED"  : {
                this.status = "Stopped";
                break;
              }
            }
            // this.carImages.forEach((img, index) => {
            //   this.documentUploadService.viewFile(img).subscribe(
            //     (file: Blob) => {
            //       this.carImages[this.carImages.indexOf(img)] = URL.createObjectURL(file);
            //     },
            //     (error) => {
            //       console.error('Error viewing file:', error);
            //     }
            //   );
            // })


            this.firstPic = `${environment.fileViewUrl}${this.carImages[0]}`;
            console.log("First pic: " + this.firstPic);
          }
        },
        (error) => {
          this.isLoading = false;
          console.error('Error fetching car details:', error);
        }
      );
    } else {
      console.error('carId not received in CarBookingInfoComponent');
    }
    this.timeFormat();


  }

  timeFormat() {
    const searchFormData = sessionStorage.getItem('searchFormData');
    if (searchFormData) {
      this.dateData = JSON.parse(searchFormData);
      this.dateData.pickUpDate = new Date(this.dateData.pickUpDate);
      this.dateData.dropOffDate = new Date(this.dateData.dropOffDate);
    }
    const timeDifference = this.dateData.dropOffDate.getTime() - this.dateData.pickUpDate.getTime();
    this.days = 1 + Math.ceil((timeDifference / (1000 * 3600 * 24)));
  }

  // viewFile(fileName: string): Observable<Blob> {
  //   return this.documentUploadService.viewFile(fileName);
  // }

}
