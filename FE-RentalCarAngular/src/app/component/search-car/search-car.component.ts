import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {FormValidateConstantService} from "../../services/form-validate-constant.service";
import {CarService, Page} from "../../services/car.service";
import {SearchCarDTO} from "../../common/search-car-dto";
import {ShareDataService} from "../../services/share-data.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-search-car',
  templateUrl: './search-car.component.html',
  styleUrls: ['./search-car.component.css']
})
export class SearchCarComponent implements OnInit {
  searchForm!: FormGroup;
  carsPage!: Page<SearchCarDTO>;
  startDateTime!: string;
  endDateTime!: string;
  searchAddress!: string;
  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: string = '';
  totalCars: number = 0;

  constructor(private router: Router,
              private fb: FormBuilder,
              private carService: CarService,
              private sharedDataService: ShareDataService) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      pickUpLocation: new FormControl('', [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
      pickUpDate: new FormControl('', Validators.required),
      pickUpTime: new FormControl('', Validators.required),
      dropOffDate: new FormControl('', Validators.required),
      dropOffTime: new FormControl('', Validators.required)
    }, {
      validator: [FormValidateConstantService.pickUpDateTimeValidator(), FormValidateConstantService.dropOffDateTimeValidator()]
    });
    this.loadAvailableCars();
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    } else {
      sessionStorage.setItem('searchFormData', JSON.stringify(this.searchForm.value));
      this.loadAvailableCars();
    }
  }

  loadAvailableCars() {
    const searchData = sessionStorage.getItem("searchFormData");
    if (searchData) {
      const dataParse = JSON.parse(searchData);
      this.startDateTime = dataParse.pickUpDate + 'T' + dataParse.pickUpTime + ':00';
      this.endDateTime = dataParse.dropOffDate + 'T' + dataParse.dropOffTime + ':00';
      this.searchAddress = dataParse.pickUpLocation;

      this.searchForm.get('pickUpLocation')?.setValue(this.searchAddress);
      this.searchForm.get('pickUpDate')?.setValue(dataParse.pickUpDate);
      this.searchForm.get('pickUpTime')?.setValue(dataParse.pickUpTime);
      this.searchForm.get('dropOffDate')?.setValue(dataParse.dropOffDate);
      this.searchForm.get('dropOffTime')?.setValue(dataParse.dropOffTime);
    }

    this.carService.findAvailableCars(
      this.startDateTime,
      this.endDateTime,
      this.searchAddress,
      this.sortBy,
      this.currentPage,
      this.pageSize
    ).subscribe(
      (data: Page<SearchCarDTO>) => {
        console.log('Available cars:', data);
        this.carsPage = data;
        this.totalCars = data.totalElements;
        const carsWithFormattedAddress = this.carsPage.content.map(car => ({
          ...car,
          address: this.extractDistrictAndCity(car.address)
        }));

        this.loadCarImages(carsWithFormattedAddress);
      },
      error => {
        console.error('Error fetching cars:', error);
      }
    );
  }

  extractDistrictAndCity(address: string): string {
    console.log('Extracting district and city from address:', address);
    const parts = address.split(', ');
    const district = parts[2];
    const city = parts[3];
    return `${district}, ${city}`;
  }

  loadCarImages(cars: SearchCarDTO[]): void {
    console.log('Loading car images:', cars);
    cars.forEach(car => {
      if (car.images) {
        car.images = car.images.map(image => `${environment.fileViewUrl}${image}`);
      }
    });
    this.sharedDataService.setCars(cars);
  }

  get pickUpLocation() {
    return this.searchForm.get('pickUpLocation');
  }

  get pickUpDate() {
    return this.searchForm.get('pickUpDate');
  }

  get pickUpTime() {
    return this.searchForm.get('pickUpTime');
  }

  get dropOffDate() {
    return this.searchForm.get('dropOffDate');
  }

  get dropOffTime() {
    return this.searchForm.get('dropOffTime');
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.loadAvailableCars();
  }

  onPageSizeChange(event: any) {
    this.pageSize = event.target.value;
    this.loadAvailableCars();
  }

  onSortByChange(event: any) {
    this.sortBy = event.target.value;
    this.loadAvailableCars();
  }
}
