import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { CarService } from '../../services/car.service';
import { CityProvince } from '../../common/city-province';
import { District } from '../../common/district';
import { Ward } from '../../common/ward';
import { FormValidateConstantService } from '../../services/form-validate-constant.service';
import { DocumentUploadService } from '../../services/document-upload.service';
import {ShareDataService} from "../../services/share-data.service";
import {lastValueFrom} from "rxjs";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-step-two',
  templateUrl: './step-two.component.html',
  styleUrls: ['./step-two.component.css']
})
export class StepTwoComponent implements OnInit {
  fileTypes: string[] = ['image/jpeg', 'image/png', 'image/gif'];
  private filesToUpload: { [key: string]: FileList } = {};
  stepTwoForm!: FormGroup;
  cities: CityProvince[] = [];
  districts: District[] = [];
  wards: Ward[] = [];
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

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private carService: CarService,
    private documentUploadService: DocumentUploadService
  ) {}

  ngOnInit(): void {
    this.stepTwoForm = this.fb.group({
      mileage: ['', [Validators.required, Validators.pattern('^[0-9]+(?:\\.[0-9]+)?$')]],
      city: [''],
      district: [''],
      ward: [''],
      houseNumber: ['', [Validators.required]],
      fuelConsumption: ['', [Validators.required, Validators.pattern('^[0-9]+(?:\\.[0-9]+)?$')]],
      description: [''],
      additionalFunctions: this.fb.group({
        bluetooth: [false],
        GPS: [false],
        camera: [false],
        sunroof: [false],
        childlock: [false],
        childseat: [false],
        DVD: [false],
        USB: [false],
      }),
      front: this.fb.array([], Validators.required),
      left: this.fb.array([], Validators.required),
      back: this.fb.array([], Validators.required),
      right: this.fb.array([], Validators.required)
    });

    this.fetchCitiesProvince();

    this.stepTwoForm.get('city')?.valueChanges.subscribe(cityProvinceCode => {
      this.onCityProvinceChange(cityProvinceCode);
    });

    this.stepTwoForm.get('district')?.valueChanges.subscribe(districtCode => {
      this.onDistrictChange(districtCode);
    });

  }

  handleFileSelection(files: FileList, documentType: 'front' | 'left' | 'back' | 'right'): void {
    this.filesToUpload[documentType] = files;
    const formArray = this.stepTwoForm.get(documentType) as FormArray;
    formArray.clear(); // Clear previous entries
    for (let i = 0; i < files.length; i++) {
      formArray.push(this.fb.control(URL.createObjectURL(files[i])));
    }
  }

  private async uploadDocument(file: File, documentType: 'front' | 'left' | 'back' | 'right'): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const url = `${environment.backendAppName}/car/${this.stepOneFormData.licensePlate}/${documentType}/`;
    return lastValueFrom(this.documentUploadService.uploadFile(file, url));
  }

  addDocument(documentUrl: string, documentType: 'front' | 'left' | 'back' | 'right'): void {
    const documents = this.stepTwoForm.get(documentType) as FormArray;
    documents.push(this.fb.control(documentUrl));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  async onSubmit(): Promise<void> {
    if (this.stepTwoForm.invalid) {
      this.stepTwoForm.markAllAsTouched();
      return;
    }

    try {
      const documentTypes: ('front' | 'back' | 'left' | 'right')[] = ['front', 'back', 'left', 'right'];
      for (const documentType of documentTypes) {
        const files = this.filesToUpload[documentType];
        if (files && files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
              const response = await this.uploadDocument(file, documentType);
              console.log('Response:', response);
              this.addDocument(response.url, documentType);
            } catch (error) {
              console.error(`Error uploading ${documentType} document:`, error);
              throw error; // Rethrow to stop the process if any upload fails
            }
          }
        }
      }
      localStorage.setItem('stepTwoFormData', JSON.stringify(this.stepTwoForm.value));
      this.router.navigate(['/car-owner/add-car/step-3']);
    } catch (error) {
      console.error('Error during form submission:', error);
      // Handle error (e.g., show error message to user)
    }
  }

  private async uploadAllDocuments(): Promise<void> {
    const documentTypes: ('front' | 'left' | 'back' | 'right')[] = ['front', 'left', 'back', 'right'];
    for (const documentType of documentTypes) {
      const files = this.filesToUpload[documentType];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            const response = await this.uploadDocument(file, documentType);
            this.addDocument(response.url, documentType);
          } catch (error) {
            console.error(`Error uploading ${documentType} document:`, error);
            throw error; // Rethrow to stop the process if any upload fails
          }
        }
      }
    }
  }

  onCheckboxChange(event: any): void {
    const checkboxControl = this.stepTwoForm.get(`additionalFunctions.${event.target.value}`) as FormControl;
    checkboxControl.setValue(event.target.checked);
  }

  fetchCitiesProvince(): void {
    this.carService.getCities().subscribe(
      (data) => {
        this.cities = data;
        if (this.cities.length > 0) {
          this.stepTwoForm.get('city')?.setValue(this.cities[0].cityProvinceCode);
          this.onCityProvinceChange(this.cities[0].cityProvinceCode);
        }
      },
      (error) => {
        console.error('Error fetching cities:', error);
      }
    );
  }

  onCityProvinceChange(cityProvinceCode: number): void {
    this.carService.getDistrictsByCityProvince(cityProvinceCode).subscribe(
      (data) => {
        this.districts = data;
        if (this.districts.length > 0) {
          this.stepTwoForm.get('district')?.setValue(this.districts[0].districtCode); // Assuming districtCode is available
          this.onDistrictChange(this.districts[0].districtCode); // Trigger ward fetch
        }
      },
      (error) => {
        console.error('Error fetching districts:', error);
      }
    );
  }

  onDistrictChange(districtCode: number): void {
    this.carService.getWardByDistrict(districtCode).subscribe(
      (data) => {
        this.wards = data;
        if (this.wards.length > 0) {
          this.stepTwoForm.get('ward')?.setValue(this.wards[0].wardCode); // Assuming wardCode is available
        }
      },
      (error) => {
        console.error('Error fetching wards:', error);
      }
    );
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

  logValidationErrors() {
    Object.keys(this.stepTwoForm.controls).forEach(key => {
      const control = this.stepTwoForm.get(key);
      if (control instanceof FormGroup) {
        this.logValidationErrorsForGroup(control);
      } else {
        console.log(`Control: ${key}, Valid: ${control?.valid}, Errors: ${JSON.stringify(control?.errors)}`);
      }
    });
  }

  logValidationErrorsForGroup(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      console.log(`Control: ${key}, Valid: ${control?.valid}, Errors: ${JSON.stringify(control?.errors)}`);
    });
  }

  get mileage() { return this.stepTwoForm.get('mileage'); }
  get city() { return this.stepTwoForm.get('city'); }
  get district() { return this.stepTwoForm.get('district'); }
  get ward() { return this.stepTwoForm.get('ward'); }
  get houseNumber() { return this.stepTwoForm.get('houseNumber'); }
  get fuelConsumption() { return this.stepTwoForm.get('fuelConsumption'); }
  get description() { return this.stepTwoForm.get('description'); }

  get front() { return this.stepTwoForm.get('front'); }
  get left() { return this.stepTwoForm.get('left'); }
  get back() { return this.stepTwoForm.get('back'); }
  get right() { return this.stepTwoForm.get('right'); }

  get stepOneFormData() {
    return JSON.parse(localStorage.getItem('stepOneFormData') || '{}');
  }
}
