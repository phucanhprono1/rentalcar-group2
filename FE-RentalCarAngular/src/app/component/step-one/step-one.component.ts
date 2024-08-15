import { Component, OnInit ,ChangeDetectorRef} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, AsyncValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { DocumentUploadService } from '../../services/document-upload.service';
import { FormValidateConstantService } from "../../services/form-validate-constant.service";
import { environment } from "../../../environments/environment";
import { lastValueFrom } from 'rxjs';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-step-one',
  templateUrl: './step-one.component.html',
  styleUrls: ['./step-one.component.css']
})
export class StepOneComponent implements OnInit {

  fileTypes: string[] = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'image/jpeg',
    'image/png'
  ];

  stepOneForm!: FormGroup;
  brands: string[] = [];
  models: string[] = [];
  years: number[] = [];
  colors: string[] = ['White', 'Black', 'Gray', 'Silver', 'Red', 'Blue', 'Brown', 'Green', 'Beige', 'Gold', 'Yellow', 'Purple'];

  private filesToUpload: { [key: string]: File[] } = {
    registrationPaper: [],
    certificateOfInspection: [],
    insurance: []
  };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private carService: CarService,
    private documentUploadService: DocumentUploadService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.stepOneForm = this.fb.group({
      licensePlate: new FormControl("", [
        Validators.required,
        FormValidateConstantService.notOnlyWhitespace,
        Validators.pattern('^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$')
      ], [this.licensePlateValidator()]), // Note the async validator is included in an array
      color: new FormControl("", [Validators.required]),
      brand: new FormControl("", [Validators.required]),
      model: new FormControl("", [Validators.required]),
      productionYears: new FormControl("", [Validators.required]),
      numberOfSeats: new FormControl("", [Validators.required, Validators.pattern('^([1-9]|[1-9][0-9])$')]),
      transmissionType: new FormControl("", [Validators.required]),
      fuelType: new FormControl("", [Validators.required]),
      registrationPaper: this.fb.array([], Validators.required),
      certificateOfInspection: this.fb.array([], Validators.required),
      insurance: this.fb.array([], Validators.required)
    });
    // Populate brand list
    this.carService.getBrandList().subscribe(
      (data) => {
        this.brands = data;
      },
      (error) => {
        console.error('Error fetching brand list:', error);
      }
    );

    // Populate years
    for (let y = 1990; y <= 2030; y++) {
      this.years.push(y);
    }

    // Listen to brand changes
    this.stepOneForm.get('brand')?.valueChanges.subscribe((brand) => {
      this.getModels(brand);
    });
  }

  getModels(brandName: string): void {
    if (brandName) {
      this.carService.getModelList(brandName).subscribe(
        (data) => {
          this.models = data;
          this.stepOneForm.get('model')?.setValue(data.length ? data[0] : '');
        },
        (error) => {
          console.error('Error fetching model list:', error);
        }
      );
    }
  }

  licensePlateValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const licensePlate = control.value;
      console.log(licensePlate)

      // If control value is empty, return null (no errors)
      if (!licensePlate) {
        return of(null);
      }

      return this.carService.checkLicensePlate(licensePlate).pipe(
        debounceTime(300), // Optional: to limit the number of API calls
        switchMap(exists => exists ? of({ licensePlateExists: true }) : of(null)),
        catchError(() => of(null)) // Handle error gracefully
      );
    };
  }

  get licensePlate(){
    return this.stepOneForm.get('licensePlate');
  }

  get color() {
    return this.stepOneForm.get('color');
  }

  get brand() {
    return this.stepOneForm.get('brand');
  }

  get model() {
    return this.stepOneForm.get('model');
  }

  get productionYears() {
    return this.stepOneForm.get('productionYears');
  }

  get numberOfSeats() {
    return this.stepOneForm.get('numberOfSeats');
  }

  get transmissionType() {
    return this.stepOneForm.get('transmissionType');
  }

  get fuelType() {
    return this.stepOneForm.get('fuelType');
  }

  get registrationPaper() {
    return this.stepOneForm.get('registrationPaper') as FormArray;
  }

  get certificateOfInspection() {
    return this.stepOneForm.get('certificateOfInspection') as FormArray;
  }

  get insurance() {
    return this.stepOneForm.get('insurance') as FormArray;
  }
  handleDocumentUpload(files: FileList, documentType: 'registrationPaper' | 'certificateOfInspection' | 'insurance'): void {
    this.filesToUpload[documentType] = Array.from(files);

    const formArray = this.stepOneForm.get(documentType) as FormArray;
    formArray.clear();
    this.filesToUpload[documentType].forEach((file) => {
      formArray.push(this.fb.control(file.name));
    });
  }

  private uploadDocument(file: File, documentType: 'registrationPaper' | 'certificateOfInspection' | 'insurance'): Promise<any> {
    const token = this.getToken();
    if (!token) {
      console.error('No token found');
      return Promise.reject('No token found');
    }

    return lastValueFrom(this.documentUploadService.uploadFile(file, environment.backendAppName + '/car/' + this.stepOneForm.get('licensePlate')?.value + '/' + documentType));
  }

  private async uploadAllDocuments(): Promise<void> {
    const uploadPromises: Promise<any>[] = [];

    for (const documentType in this.filesToUpload) {
      if (this.filesToUpload.hasOwnProperty(documentType)) {
        const formArray = this.stepOneForm.get(documentType) as FormArray;
        formArray.clear();

        for (const file of this.filesToUpload[documentType]) {
          uploadPromises.push(
            this.uploadDocument(file, documentType as 'registrationPaper' | 'certificateOfInspection' | 'insurance')
          );
        }
      }
    }

    try {
      const responses = await Promise.all(uploadPromises);
      responses.forEach(response => {
        console.log('Response:', response);
        const documentUrl = response.url;
        const documentType = response.url.split('/')[3] as 'registrationPaper' | 'certificateOfInspection' | 'insurance';
        this.addDocument(documentUrl, documentType);
      });
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  }

  addDocument(documentUrl: string, documentType: 'registrationPaper' | 'certificateOfInspection' | 'insurance'): void {
    const documents = this.stepOneForm.get(documentType) as FormArray;

    if (documents) {
      documents.push(this.fb.control(documentUrl));
      this.cdr.detectChanges(); // Trigger change detection manually
    } else {
      console.error(`FormArray for ${documentType} is null`);
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

  async onSubmit(): Promise<void> {
    console.log('Form values before submission:', this.stepOneForm.value);

    if (this.stepOneForm.invalid) {
      this.stepOneForm.markAllAsTouched();
      return;
    }

    const requiredDocuments = ['registrationPaper', 'certificateOfInspection', 'insurance'];
    const missingDocuments = requiredDocuments.filter(doc => this.filesToUpload[doc].length === 0);

    if (missingDocuments.length > 0) {
      console.error('Missing required documents:', missingDocuments);
      return;
    }

    this.uploadAllDocuments().then(() => {
      const token = this.getToken();
      if (!token) {
        console.error('No token found');
        return;
      }
      localStorage.setItem('stepOneFormData', JSON.stringify(this.stepOneForm.value));
      this.navigate('/car-owner/add-car/step-2');
    })
  }

}


