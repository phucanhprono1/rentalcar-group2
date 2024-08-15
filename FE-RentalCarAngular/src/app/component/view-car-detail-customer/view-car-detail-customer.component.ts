import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { CarService } from "../../services/car.service";
import { CarDetail } from "../../common/car-detail";
import { DocumentUploadService } from "../../services/document-upload.service";
import {ShareDataService} from "../../services/share-data.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-view-car-detail-customer',
  templateUrl: './view-car-detail-customer.component.html',
  styleUrls: ['./view-car-detail-customer.component.css']
})
export class ViewCarDetailCustomerComponent implements OnInit {

  car!: CarDetail;
  id!: number;
  address!: string;
  carImages: string[] = [];
  carImageUrls: string[] = [];

  additionalFunctions = [
    { name: 'Bluetooth', icon: 'bi bi-bluetooth', value: 'bluetooth' },
    { name: 'GPS', icon: 'bi bi-map-fill', value: 'GPS' },
    { name: 'Camera', icon: 'bi bi-camera-fill', value: 'camera' },
    { name: 'Sun roof', icon: 'bi bi-brightness-high-fill', value: 'sunroof' },
    { name: 'Child lock', icon: 'bi bi-lock-fill', value: 'childlock' },
    { name: 'Child seat', icon: 'bi bi-person-arms-up', value: 'childseat' },
    { name: 'DVD', icon: 'bi bi-disc-fill', value: 'DVD' },
    { name: 'USB', icon: 'bi bi-usb-plug-fill', value: 'USB' }
  ];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private sharedDataService: ShareDataService,
              private carService: CarService,
              private documentUploadService: DocumentUploadService) {
    this.id = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.getCar();
  }

  getCar(): void {
    this.carService.getCarDetail(this.id).subscribe({
      next: (data) => {
        this.car = data;
        this.address = this.extractDistrictAndCity(this.car.address);
        this.getCarImages(this.car.id);
      },
      error: (err) => console.error(err)
    });
  }

  getCarImages(carId: number): void {
    this.carService.getCarImages(carId).subscribe({
      next: (images) => {
        this.carImages = images;
        this.carImages.forEach((image, index) => {
          this.viewFile(image, index);
        });
      },
      error: (err) => console.error(err)
    });
  }

  viewFile(fileName: string, index: number): void {
    this.carImageUrls[index] = `${environment.fileViewUrl}${fileName}`;
  }

  extractDistrictAndCity(address: string): string {
    const parts = address.split(', ');
    const district = parts[2];
    const city = parts[3];
    return `${district}, ${city}`;
  }
  getId(carId: number) {
    this.carService.getCarData(carId).subscribe(
      () => {
        sessionStorage.setItem('selectedCarId', carId.toString());
        this.sharedDataService.setCarId(carId); // Set carId in service
        this.router.navigate(['/customer/rent-a-car/booking-info']);
      })
  };
}
