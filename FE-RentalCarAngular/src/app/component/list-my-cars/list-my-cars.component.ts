import {Component, OnInit} from '@angular/core';
import {MyCar} from "../../common/my-car";
import {CarService} from "../../services/car.service";
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-list-my-cars',
  templateUrl: './list-my-cars.component.html',
  styleUrls: ['./list-my-cars.component.css']
})
export class ListMyCarsComponent implements OnInit {
  cars: MyCar[] = [];
  carImages: { [key: number]: string[] } = {};
  token: string = '';
  carId!: number;

  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  sortBy: string = '';

  constructor(private carService: CarService,
              private router: Router,) {
  }

  ngOnInit(): void {
    this.getListCars();
  }

  getListCars() {
    this.token = this.carService.getUserToken()!;
    this.carService.getCarsByOwner(this.token, this.pageNumber, this.pageSize, this.sortBy).subscribe(
      data => {
        console.log(data);
        this.cars = data.content;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;


        this.cars.forEach(car => {
          this.carService.getCarImages(car.id).subscribe(
            images => {
              this.carImages[car.id] = images;
              this.carImages[car.id].forEach(img => {
                this.carImages[car.id][this.carImages[car.id].indexOf(img)] = `${environment.fileViewUrl}${img}`;
              });
            }
          );
        });
      },
      error => {
        console.error("Error: " + error);
      }
    );
  }

  extractDistrictAndCity(address: string): string {
    const parts = address.split(', ');
    const district = parts[2];
    const city = parts[3];
    return `${district}, ${city}`;
  }

  updatePageSize(pageSize: string) {
    this.pageSize = +pageSize;
    this.pageNumber = 1;
    this.getListCars();
  }

  sortContent(sortBy: string) {
    this.sortBy = sortBy;
    this.pageNumber = 1;
    this.getListCars();
  }

  viewCarDetails(carId: number) {
    this.router.navigate(['/car-owner/car-detail', carId]);
  }

  viewCarFeedbacks(carId: number) {
    this.router.navigate(['/car-owner/view-feedbacks', carId]);
  }

  updateCarStatusById($event: any) {
    const {carId, status} = $event;
    this.cars.find(car => car.id == carId)!.carStatus = status;
    if (status === "AVAILABLE") {
      this.cars.find(car => car.id == carId)!.isPendingPayment = false;
    }
    if (status === "BOOKED") {
      this.cars.find(car => car.id == carId)!.isPendingDeposit = false;
    }
  }
}
