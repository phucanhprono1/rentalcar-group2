import {ChangeDetectorRef, Component, OnInit} from '@angular/core';

import {CarService} from "../../services/car.service";
import {CarDetail} from "../../common/car-detail";
import {ActivatedRoute, Router} from "@angular/router";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {DocumentUploadService} from "../../services/document-upload.service";
import {CityProvince} from "../../common/city-province";
import {District} from "../../common/district";
import {Ward} from "../../common/ward";
import {FormValidateConstantService} from "../../services/form-validate-constant.service";
import {UpdateCarDTO} from "../../common/update-car-dto";
import {forkJoin, lastValueFrom} from "rxjs";
import * as bootstrap from "bootstrap";
import {environment} from "../../../environments/environment";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-edit-car-detail',
  templateUrl: './edit-car-detail.component.html',
  styleUrls: ['./edit-car-detail.component.css']
})
export class EditCarDetailComponent implements OnInit {
  fileTypes: string[] = [
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  cities: CityProvince[] = [];
  districts: District[] = [];
  wards: Ward[] = [];

  editCarForm!: FormGroup;
  car!: CarDetail;
  id!: number;
  licensePlate: string;
  address!: string;
  carImages!: string[];
  houseNumberFetch!: string;
  errorMessage: string='';

  registrationPaperUrl: string = '';
  certificateOfInspectionUrl: string = '';
  insuranceUrl: string = '';
  carImageUrls: string[] = [];
  private filesToUpload: { [key: string]: FileList } = {};
  private filesToDelete: string[] = [];

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
              private carService: CarService,
              private fb: FormBuilder,
              private cdr: ChangeDetectorRef,
              private documentUploadService: DocumentUploadService) {
    this.id = this.route.snapshot.params['id'];
    this.licensePlate = this.route.snapshot.params['licensePlate']
  }

  ngOnInit(): void {
    this.getCar();

  }

  getCar(): void {
    this.carService.getCarDetail(this.id).subscribe({
      next: (data) => {
        this.car = data;
        this.licensePlate = this.car.licensePlate;
        this.getCarImages(this.car.id);

        this.viewDocument(data.registrationPaper,'registrationPaperUrl');

        this.viewDocument(data.certificateOfInspection,'certificateOfInspectionUrl');

        this.viewDocument(data.insurance,'insuranceUrl');

        const houseNumbers = data.address.split(', ');
        this.address = this.extractDistrictAndCity(this.car.address);
        this.houseNumberFetch = houseNumbers[0];

        // After fetching car details, initialize the form and fetch related data
        this.initializeForm();
        this.fetchCitiesProvince();
        this.setDefaultImageValues(this.car.id);
      },
      error: (err:HttpErrorResponse) => {
        if (err.status === 404) {
          this.router.navigate(["/not-found"])
        }
      }
    });
  }

  get basePrice() {
    return this.editCarForm.get('basePrice');
  }

  get deposit() {
    return this.editCarForm.get('deposit');
  }

  get specifyOther() {
    return this.editCarForm.get('termOfUse.specifyOther');
  }

  get listAdditionalFunctions() {
    return this.editCarForm.get('additionalFunctions');
  }

  extractDistrictAndCity(address: string): string {
    const parts = address.split(', ');
    const district = parts[2];
    const city = parts[3];
    return `${district}, ${city}`;
  }
  viewDocument(fileName: string, targetProperty: 'registrationPaperUrl' | 'certificateOfInspectionUrl' | 'insuranceUrl'): void {
    this[targetProperty] = `${environment.fileViewUrl}${fileName}`;
  }

  getCarImages(carId: number): void {
    this.carService.getCarImages(carId).subscribe({
      next: (images) => {
        this.carImages = images;
        this.carImageUrls = images.map(image => `${environment.fileViewUrl}${image}`);
      },
      error: (err) => console.error(err)
    });
  }

  setDefaultImageValues(carId: number): void {
    this.getCarImages(carId); // This will update carImageUrls
  }
  // viewFile(fileName: string): Observable<Blob> {
  //   return this.documentUploadService.viewFile(fileName);
  // }

  async handleFileSelection(files: FileList, documentType: 'front' | 'left' | 'back' | 'right'): Promise<void> {
    this.filesToUpload[documentType] = files;
    const formArray = this.editCarForm.get(documentType) as FormArray;
    for (let i = 0; i < files.length; i++) {
      formArray.push(this.fb.control(URL.createObjectURL(files[i])));
    }
  }

  // Method to upload document and return the URL
  private async uploadDocument(file: File, documentType: string): Promise<string> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const url = `${environment.backendAppName}/car/${this.licensePlate}/${documentType}/`;
    const response = await lastValueFrom(this.documentUploadService.uploadFile(file, url));
    return response.url;
  }

  addDocument(documentUrl: string, documentType: 'front' | 'left' | 'back' | 'right'): void {
    const documents = this.editCarForm.get(documentType) as FormArray;
    documents.push(this.fb.control(documentUrl));
  }

  get listTermOfUse() {
    return this.editCarForm.get('termOfUse');
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  onStatusChange(event: any) {
    console.log("car id: " + this.id);
    const selectedStatus = event.target.value;
    if (selectedStatus === 'STOPPED') {
      const stopModal = new bootstrap.Modal(document.getElementById('stopModal'));
      stopModal.show();
    } else if (selectedStatus === 'AVAILABLE') {
      this.carService.updateCarStatus(this.id, selectedStatus).subscribe(data => {
        console.log("Update car status to available successfully");
      });
    }
  }

  onCheckboxChange(event: any): void {
    const checkboxControl = this.editCarForm.get(`additionalFunctions.${event.target.value}`) as FormControl;
    checkboxControl.setValue(event.target.checked);
  }

  fetchCitiesProvince(): void {
    this.carService.getCities().subscribe(
      (data) => {
        this.cities = data;
        if (this.cities.length > 0) {
          this.editCarForm.get('city')?.setValue(this.car.cityCode);
          this.onCityProvinceChange(this.car.cityCode);
        }
      },
      (error) => console.error('Error fetching cities:', error)
    );
  }

  onCityProvinceChange(cityProvinceCode: number): void {
    this.carService.getDistrictsByCityProvince(cityProvinceCode).subscribe(
      (data) => {
        this.districts = data;
        if (this.districts.length > 0) {
          this.editCarForm.get('district')?.setValue(this.car.districtCode);
          this.onDistrictChange(this.car.districtCode);
        }
      },
      (error) => console.error('Error fetching districts:', error)
    );
  }

  onDistrictChange(districtCode: number): void {
    this.carService.getWardByDistrict(districtCode).subscribe(
      (data) => {
        this.wards = data;
        if (this.wards.length > 0) {
          this.editCarForm.get('ward')?.setValue(this.car.wardCode);
        }
      },
      (error) => console.error('Error fetching wards:', error)
    );
  }

  get carStatus() {
    return this.editCarForm.get('carStatus');
  }

  initializeForm(): void {
    this.editCarForm = this.fb.group({
      mileage: [this.car.mileage, [Validators.required, FormValidateConstantService.notOnlyWhitespace, Validators.pattern('^[0-9]+(?:\\.[0-9]+)?$')]],
      city: [this.car.cityCode],
      district: [this.car.districtCode],
      ward: [this.car.wardCode],
      carStatus: [this.car.carStatus, Validators.required],
      houseNumber: [this.houseNumberFetch, [Validators.required, FormValidateConstantService.notOnlyWhitespace]],
      fuelConsumption: [this.car.fuelConsumption, [Validators.required, FormValidateConstantService.notOnlyWhitespace, Validators.pattern('^[0-9]+(?:\\.[0-9]+)?$')]],
      description: [this.car.description],
      additionalFunctions: this.fb.group({
        bluetooth: [this.car.additionalFunctions.includes('bluetooth')],
        GPS: [this.car.additionalFunctions.includes('GPS')],
        camera: [this.car.additionalFunctions.includes('camera')],
        sunroof: [this.car.additionalFunctions.includes('sunroof')],
        childlock: [this.car.additionalFunctions.includes('childlock')],
        childseat: [this.car.additionalFunctions.includes('childseat')],
        DVD: [this.car.additionalFunctions.includes('DVD')],
        USB: [this.car.additionalFunctions.includes('USB')],
      }),
      front: this.fb.array([]),
      back: this.fb.array([]),
      left: this.fb.array([]),
      right: this.fb.array([]),
      basePrice: [this.car.basePrice, [Validators.required, FormValidateConstantService.notOnlyWhitespace, Validators.pattern('^[0-9]+(?:\\.[0-9]+)?$')]],
      deposit: [this.car.deposit, [Validators.required, FormValidateConstantService.notOnlyWhitespace, Validators.pattern('^[0-9]+(?:\\.[0-9]+)?$')]],
      termOfUse: this.fb.group({
        noSmoking: [this.car.termsOfUse.includes('no Smoking')],
        noPet: [this.car.termsOfUse.includes('no Pet')],
        noFood: [this.car.termsOfUse.includes('no Food')],
        other: [this.car.termsOfUse.includes('other')],
        specifyOther: (() => {
          const terms = this.car.termsOfUse.split(', ');
          if (this.car.termsOfUse.includes('Other')) {
            return terms[terms.length - 1].substring(7,);
          } else {
            return '';
          }
        })()
      })
    });
    this.onOtherChange();


    this.editCarForm.get('termOfUse.other')?.valueChanges.subscribe(() => {
      this.onOtherChange();
    });

    // Subscribe to changes in city and district
    this.editCarForm.get('city')?.valueChanges.subscribe(cityProvinceCode => {
      this.onCityProvinceChange(cityProvinceCode);
    });

    this.editCarForm.get('district')?.valueChanges.subscribe(districtCode => {
      this.onDistrictChange(districtCode);
    });
  }

  get mileage() { return this.editCarForm.get('mileage'); }
  get city() { return this.editCarForm.get('city'); }
  get district() { return this.editCarForm.get('district'); }
  get ward() { return this.editCarForm.get('ward'); }
  get houseNumber() { return this.editCarForm.get('houseNumber'); }
  get fuelConsumption() { return this.editCarForm.get('fuelConsumption'); }
  get description() { return this.editCarForm.get('description'); }

  get front() { return this.editCarForm.get('front'); }
  get left() { return this.editCarForm.get('left'); }
  get back() { return this.editCarForm.get('back'); }
  get right() { return this.editCarForm.get('right'); }

  confirmStopRenting() {
    if (this.car.carStatus == "BOOKED") {
      const errorModal = new bootstrap.Modal(document.getElementById('errorMessage'));
      errorModal.show();
    } else {
      this.carStatus?.setValue('STOPPED');
      this.carService.updateCarStatus(this.id, 'STOPPED').subscribe(data => {
        console.log("Update car status to stopped successfully");
      });
    }
  }

  removeImage(index: number): void {
    // Clear the image URL in carImages array
    const fileName = this.carImages[index];
    if (fileName) {
      this.filesToDelete.push(fileName);
    }
    this.carImages[index] = '';

    let formArrayName: string;

    switch (index) {
      case 0:
        formArrayName = 'front';
        break;
      case 1:
        formArrayName = 'left';
        break;
      case 2:
        formArrayName = 'back';
        break;
      case 3:
        formArrayName = 'right';
        break;
      default:
        return;
    }

    const formArray = this.editCarForm.get(formArrayName) as FormArray;
    formArray.clear();
    formArray.setValidators([Validators.required]);
    formArray.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    if (this.editCarForm.invalid) {
      this.editCarForm.markAllAsTouched();
      return;
    }

    const documentTypes: ('front' | 'left' | 'back' | 'right')[] = ['front', 'left', 'back', 'right'];
    const finalDocumentUrls: { [key: string]: string } = {};

    for (const documentType of documentTypes) {
      const files = this.filesToUpload[documentType];
      if (files && files.length > 0) {
        // New file uploaded
        try {
          const url = await this.uploadDocument(files[0], documentType);
          finalDocumentUrls[documentType] = url;
        } catch (error) {
          console.error(`Error uploading ${documentType} document:`, error);
        }
      } else {
        // No new file, use existing image if available
        const existingImage = this.carImages[documentTypes.indexOf(documentType)];
        if (existingImage && !this.filesToDelete.includes(existingImage)) {
          finalDocumentUrls[documentType] = existingImage;
        }
      }
    }

    // Combine new and old URLs
    console.log('Document URLs:', finalDocumentUrls);

    // Fetch city, district, and ward details
    const cityRequest = this.carService.getCityProvinceById(this.city?.value);
    const districtRequest = this.carService.getDistrictById(this.district?.value);
    const wardRequest = this.carService.getWardById(this.ward?.value);

    forkJoin([cityRequest, districtRequest, wardRequest]).subscribe(
      ([city, district, ward]) => {
        // Create the update DTO with the fetched and entered data
        const carUpdateDto = new UpdateCarDTO(
          this.mileage?.value,
          this.fuelConsumption?.value,
          this.basePrice?.value,
          this.deposit?.value,
          `${this.houseNumber?.value}, ${ward.ward}, ${district.district}, ${city.cityProvince}`,
          this.description?.value,
          this.convertToAdditionalString(this.listAdditionalFunctions?.value),
          this.convertTermOfUseToString(this.listTermOfUse?.value),
          this.carStatus?.value,
          this.city?.value,
          this.district?.value,
          this.ward?.value,
          [
            finalDocumentUrls['front'],
            finalDocumentUrls['left'],
            finalDocumentUrls['back'],
            finalDocumentUrls['right']
          ].filter(Boolean)
        );

        console.log('Car update DTO:', carUpdateDto);

        // Update the car details
        const token = this.getToken();
        if (token) {
          this.carService.updateCar(this.id, token, carUpdateDto).subscribe(
            response => {
              console.log('Car updated successfully', response);
              alert('Car updated successfully!');
              this.router.navigate(['/car-owner/my-cars']);
            },
            error => {
              console.error('Error updating car', error);
            }
          );
        }
      },
      error => {
        console.error('Error fetching address details', error);
      }
    );
  }

  onOtherChange(): void {
    const otherControl = this.editCarForm.get('termOfUse.other');
    const specifyOtherControl = this.editCarForm.get('termOfUse.specifyOther');

    if (otherControl?.value) {
      specifyOtherControl?.setValidators([Validators.required]);
    } else {
      specifyOtherControl?.clearValidators();
    }
    specifyOtherControl?.updateValueAndValidity();
  }
  convertToAdditionalString(additionalFunctions: AdditionalFunctions): string {
    return Object.keys(additionalFunctions)
      .filter(key => additionalFunctions[key])
      .join(', ');
  }

  convertTermOfUseToString(termOfUse: TermOfUse): string {
    const terms: string[] = [];

    // Iterate over each key in TermOfUse
    Object.keys(termOfUse).forEach(key => {
// Skip 'specifyOther' key and only include keys with true values
      if (key !== 'specifyOther' && termOfUse[key as keyof TermOfUse]) {
        let term = key.replace(/([a-z])([A-Z])/g, '$1 $2'); // Insert space between camelCase
        terms.push(term);
      }
    });

    // Check if 'Other' term is specified and append 'specifyOther' value if present
    if (termOfUse.other && termOfUse.specifyOther) {
      terms.push(`Other: ${termOfUse.specifyOther}`);
    }

    // Join terms into a single comma-separated string
    return terms.join(', ');
  }

  updateCarStatusById($event: any) {
    const {carId, status} = $event;
    this.car.carStatus = status;
    if (status === "BOOKED") {
      this.car.isPendingDeposit = false;
    }
    if (status === "AVAILABLE") {
      this.car.isPendingPayment = false;
    }
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

interface TermOfUse {
  noSmoking: boolean;
  noPet: boolean;
  noFood: boolean;
  other: boolean;
  specifyOther: string;
}
