import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {CarService} from "../../services/car.service";
import {Car} from "../../common/car";
import {CityProvince} from "../../common/city-province";
import {District} from "../../common/district";
import {Ward} from "../../common/ward";
import {forkJoin} from "rxjs";
import {DocumentUploadService} from "../../services/document-upload.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-step-four',
  templateUrl: './step-four.component.html',
  styleUrls: ['./step-four.component.css']
})
export class StepFourComponent implements OnInit {

  displayName: string = '';
  licensePlate: string = '';
  color: string = '';
  brandName: string = '';
  model: string = '';
  productionYear: number = 0;
  noOfSeat: number = 0;
  transmission: string = '';
  fuel: string = '';
  registrationPaper: string = '';
  certificateOfInspection: string = '';
  insurance: string = '';

  mileage: number = 0;
  fuelConsumption: number = 0;
  city!: CityProvince;
  district!: District;
  ward!: Ward;
  houseNumber: string = '';
  address: string = '';
  additionalFunctions: string = '';
  descriptions: string = '';
  images: string[] = [];
  frontImgPath: string = '';
  backImgPath: string = '';
  leftImgPath: string = '';
  rightImgPath: string = '';
  frontUrl: string='';
  leftUrl: string='';
  backUrl: string='';
  rightUrl: string='';

  cityId: number = 0;
  districtId: number = 0;
  wardId: number = 0;

  price: number = 0;
  deposit: number = 0;
  termOfUse: string = '';
  carStatus: CarStatus = CarStatus.AVAILABLE;

  car!: Car;

  constructor(
    private router: Router,
    private carService: CarService,
    private documentUploadService: DocumentUploadService
  ) { }

  ngOnInit(): void {
    const stepOneData = localStorage.getItem("stepOneFormData");
    const stepTwoData = localStorage.getItem("stepTwoFormData");
    const stepThreeData = localStorage.getItem("stepThreeFormData");

    if (stepOneData) {
      const stepOneStoredData = JSON.parse(stepOneData);
      this.displayName = `${stepOneStoredData.brand} ${stepOneStoredData.model} ${stepOneStoredData.productionYears}`;
      this.licensePlate = stepOneStoredData.licensePlate;
      this.color = stepOneStoredData.color;
      this.brandName = stepOneStoredData.brand;
      this.model = stepOneStoredData.model;
      this.productionYear = stepOneStoredData.productionYears;
      this.noOfSeat = stepOneStoredData.numberOfSeats;
      this.transmission = stepOneStoredData.transmissionType;
      this.fuel = stepOneStoredData.fuelType;
      this.registrationPaper = this.getFileName(stepOneStoredData.registrationPaper[stepOneStoredData.registrationPaper.length - 1]);
      this.certificateOfInspection = this.getFileName(stepOneStoredData.certificateOfInspection[stepOneStoredData.certificateOfInspection.length - 1]);
      this.insurance = this.getFileName(stepOneStoredData.insurance[stepOneStoredData.insurance.length - 1]);
    }

    if (stepThreeData) {
      const stepThreeStoredData = JSON.parse(stepThreeData);
      this.price = stepThreeStoredData.basePrice;
      this.deposit = stepThreeStoredData.deposit;
      this.termOfUse = this.convertTermOfUseToString(stepThreeStoredData.termOfUse);
    }

    if (stepTwoData) {
      const stepTwoStoredData = JSON.parse(stepTwoData);
      this.cityId = stepTwoStoredData.city;
      this.districtId = stepTwoStoredData.district;
      this.wardId = stepTwoStoredData.ward;

      this.houseNumber = stepTwoStoredData.houseNumber;
      this.mileage = stepTwoStoredData.mileage;
      this.fuelConsumption = stepTwoStoredData.fuelConsumption;
      this.descriptions = stepTwoStoredData.description;
      this.additionalFunctions = this.convertToAdditionalString(stepTwoStoredData.additionalFunctions);

      const frontImgs = stepTwoStoredData.front;
      this.frontImgPath= frontImgs[frontImgs.length - 1];
      this.frontUrl = environment.fileViewUrl +this.frontImgPath;

      const leftImgs = stepTwoStoredData.left;
      this.leftImgPath  = leftImgs[leftImgs.length - 1];
      this.leftUrl = environment.fileViewUrl + this.leftImgPath;


      const backImgs = stepTwoStoredData.back;
      this.backImgPath = backImgs[backImgs.length - 1];
      this.backUrl =  environment.fileViewUrl + this.backImgPath

      const rightImgs = stepTwoStoredData.right;
      this.rightImgPath = rightImgs[rightImgs.length - 1];
      this.rightUrl = environment.fileViewUrl + this.rightImgPath;

      this.images = [this.frontImgPath, this.leftImgPath, this.backImgPath, this.rightImgPath];

      forkJoin({
        city: this.carService.getCityProvinceById(this.cityId),
        district: this.carService.getDistrictById(this.districtId),
        ward: this.carService.getWardById(this.wardId)
      }).subscribe(
        ({ city, district, ward }) => {
          this.city = city;
          this.district = district;
          this.ward = ward;
          this.address = `${this.houseNumber}, ${this.ward.ward}, ${this.district.district}, ${this.city.cityProvince}`;
          this.updateAddress();
        },
        error => {
          console.error('Error fetching data', error);
        }
      );
    }
  }

  getFileName(filePath: string): string {
    const parts = filePath.split('\\');
    return parts[parts.length - 1];
  }

  onSubmit(): void {
    this.car = new Car(
      this.displayName,
      this.licensePlate,
      this.brandName,
      this.model,
      this.color,
      this.noOfSeat,
      this.productionYear,
      this.transmission,
      this.fuel,
      this.mileage,
      this.fuelConsumption,
      this.price,
      this.deposit,
      this.address,
      this.descriptions,
      this.additionalFunctions,
      this.termOfUse,
      this.registrationPaper,
      this.certificateOfInspection,
      this.insurance,
      this.carStatus,
      this.images,
      this.cityId,
      this.districtId,
      this.wardId
    );

    const token = this.getToken();
    if (token) {
      this.carService.addCar(this.car, token).subscribe(
        response => {
          console.log('Car added successfully', response);
          this.router.navigate(['/car-owner/car-detail', response.id]);
          localStorage.removeItem("stepOneFormData");
          localStorage.removeItem("stepTwoFormData");
          localStorage.removeItem("stepThreeFormData");
        },
        error => {
          console.error('Error adding car', error);
        }
      );
    } else {
      console.error('No token found');
    }
  }

  updateAddress(): void {
    if (this.city && this.district && this.ward) {
      this.address = `${this.houseNumber}, ${this.ward.ward}, ${this.district.district}, ${this.city.cityProvince}`;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
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

  convertToAdditionalString(additionalFunctions: AdditionalFunctions): string {
    return Object.keys(additionalFunctions)
      .filter(key => additionalFunctions[key])
      .join(', ');
  }

  convertTermOfUseToString(termOfUse: TermOfUse): string {
    const terms = Object.keys(termOfUse)
      .filter(key => key !== 'specifyOther' && termOfUse[key as keyof TermOfUse] === true)
      .map(key => key.replace(/([a-z])([A-Z])/g, '$1 $2'))
      .join(', ');

    if (termOfUse.other && termOfUse.specifyOther) {
      return `${terms}, Other: ${termOfUse.specifyOther}`;
    }

    return terms;
  }
}
export interface AdditionalFunctions {
  bluetooth: boolean;
  GPS: boolean;
  camera: boolean;
  sunroof: boolean;
  childlock: boolean;
  childseat: boolean;
  DVD: boolean;
  USB: boolean;
  [key: string]: boolean;
}

export interface TermOfUse {
  noSmoking: boolean;
  noPet: boolean;
  noFood: boolean;
  other: boolean;
  specifyOther: string;
}

export enum CarStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  STOPPED = 'STOPPED',
}
