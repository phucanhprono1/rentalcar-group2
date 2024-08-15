import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {BookingInfo, BookingStatus, PaymentMethod} from "../../common/booking-info";
import {BookingCarService} from "../../services/booking-car.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {CityProvince} from "../../common/city-province";
import {District} from "../../common/district";
import {Ward} from "../../common/ward";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {CarService} from "../../services/car.service";
import {CarDetail} from "../../common/car-detail";
import {FormValidateConstantService} from "../../services/form-validate-constant.service";
import {BookingStatusService} from "../../services/booking-status.service";
import * as bootstrap from "bootstrap";
import {environment} from "../../../environments/environment";
import {FeedbackDto, FeedBackService} from "../../services/feed-back.service";
import {EditBookingDto} from "../../common/edit-booking-dto";
import {forkJoin, Subject, Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.css']
})
export class BookingDetailsComponent implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy{

  booking!: BookingInfo;
  id!: number;
  carImageUrls: string[] = [];
  carId!:number;
  car!: CarDetail;
  currentBalance!: number;
  driverId!: number;
  bookingStatusSubscription!: Subscription;
  bookingSubscription!: Subscription;
  private destroy$ = new Subject<void>();

  registrationPaperUrl: string = '';
  certificateOfInspectionUrl: string = '';
  insuranceUrl: string = '';

  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  filePreviewUrl: string | null = null;

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

  cities: CityProvince[] = [];
  districts: District[] = [];
  wards: Ward[] = [];
  bookingStatus:string='';
  isEditable!: boolean;

  citiesDriver: CityProvince[] = [];
  districtsDriver: District[] = [];
  wardsDriver: Ward[] = [];

  profileForm!: FormGroup;
  successMess:string='';
  errorMess: string='';
  paymentMethod!: PaymentMethod;
  feedBackSuccess: string='';
  feedBackError: string='';

  feedBackForm!: FormGroup;
  rating: number=0;
  feedBackDto!: FeedbackDto;
  hasDriver!: boolean;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingCarService,
    private router: Router, private carService: CarService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private bookingStatusService: BookingStatusService,
    private feedBackService: FeedBackService
  ) {
    this.id = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });

    this.getBookingDetail(this.id);
    this.getCurrentBalance();
    this.bookingStatusSubscription = this.bookingStatusService.bookingStatus$.subscribe((status) => {
      this.isEditable = this.isBookingEditable(status);
      this.initializeForm(this.isEditable, this.booking);
      this.bookingStatusSubscription.unsubscribe();
    });
    this.initializeFormFeedBack();
  }

  getBookingDetail(id: number): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    this.bookingSubscription = this.bookingService.getBookingByBookingNo(id, token).subscribe({
      next: (data) => {
        this.booking = data;
        this.carId = data.carId;
        this.driverId = data.driverId;
        this.bookingStatus = data.bookingStatus;
        this.paymentMethod = data.paymentMethod;
        this.isEditable = this.isBookingEditable(this.bookingStatus);
        this.hasDriver = !!data.driverId;

        this.bookingStatusService.updateBookingStatus(this.bookingStatus);

        if (this.booking.images) {
          this.booking.images.forEach((img, index) => this.viewFile(img, index));
        }

        this.filePreviewUrl = data.customerDrivingLicense;
        this.filePreviewDriverUrl = data.driverId !== null ? data.customerDriverDrivingLicense : data.customerDrivingLicense;

        this.getCarDetail(this.carId);
        this.initializeForm(this.isEditable, this.booking);

        this.bookingSubscription.unsubscribe();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.router.navigate(['/not-found']);
        }
        this.bookingSubscription.unsubscribe();
      }
    });
  }


  getCarDetail(id: number) {
    this.carService.getCarDetail(id).pipe(
      takeUntil(this.destroy$)).subscribe(
      (car) => {
        this.car = car;
        this.viewDocument(car.registrationPaper,'registrationPaperUrl');

        this.viewDocument(car.certificateOfInspection,'certificateOfInspectionUrl');

        this.viewDocument(car.insurance,'insuranceUrl');
      },
      (error) => {
        console.error('Error fetching car details:', error);
      }
    );
  }

  viewFile(fileName: string, index: number): void {

    this.carImageUrls[index] = `${environment.fileViewUrl}${fileName}`;

  }
  viewDocument(fileName: string, targetProperty: 'registrationPaperUrl' | 'certificateOfInspectionUrl' | 'insuranceUrl'): void {

    this[targetProperty] = `${environment.fileViewUrl}${fileName}`;

  }
  getCurrentBalance(){
    const token = localStorage.getItem('token');
    if(token){
      this.bookingService.getCurrentBalance(token).subscribe(data=>{
        this.currentBalance = data;
      })
    }

  }

  transformStatus(bookingStatus: BookingStatus): string {
    switch (bookingStatus) {
      case BookingStatus.CONFIRMED:
        return 'Confirmed';
      case BookingStatus.PENDING_DEPOSIT:
        return 'Pending deposit';
      case BookingStatus.IN_PROGRESS:
        return 'In progress';
      case BookingStatus.CANCELLED:
        return 'Cancelled';
      case BookingStatus.PENDING_PAYMENT:
        return 'Pending payment';
      case BookingStatus.COMPLETED:
        return 'Completed';
      default:
        return 'Unknown status';
    }
  }
  getStatusClass(bookingStatus: BookingStatus): string {
    switch (bookingStatus) {
      case BookingStatus.CONFIRMED:
      case BookingStatus.IN_PROGRESS:
      case BookingStatus.COMPLETED:
        return 'text-success';
      case BookingStatus.PENDING_DEPOSIT:
      case BookingStatus.PENDING_PAYMENT:
        return 'text-warning';
      default:
        return 'text-danger';
    }
  }
  private initializeForm(isEditable: boolean, booking: BookingInfo, forceNoDriver: boolean = false) {
    if (booking.driverId !== null && !forceNoDriver) {
      this.initializeFormWithDriver(isEditable, booking);
      this.fetchCitiesProvince();
    } else {
      this.initializeFormWithoutDriver(isEditable, booking);
      this.fetchCitiesProvinceWithoutDriver();
      this.filePreviewDriverUrl = booking.customerDrivingLicense;
    }

    this.setupFormValueChangeListeners();

    if (!isEditable) {
      this.profileForm.disable();
    } else {
      this.profileForm.enable();
    }
  }

  private initializeFormWithDriver(isEditable: boolean, booking: BookingInfo) {
    this.profileForm = this.formBuilder.group({
      profile: this.formBuilder.group({
        nameProfile: new FormControl({value: booking.customerName, disabled: isEditable}, [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        phone: new FormControl({value: booking.customerPhone, disabled: isEditable}, [Validators.required, Validators.pattern('^\\+\\d{11}$')]),
        nationalNo: new FormControl({value: booking.customerNationalIdNo, disabled: isEditable}, [Validators.required, Validators.pattern('^\\d{12}$')]),
        city: new FormControl({value: '' , disabled: isEditable}, [Validators.required]),
        district: new FormControl({value: '', disabled: isEditable}, [Validators.required]),
        ward: new FormControl({value: '', disabled: isEditable}, [Validators.required]),
        house: new FormControl({value: this.extractHouse(this.booking.customerAddress), disabled: isEditable}, [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        dateOfBirth: new FormControl({value: booking.customerDateOfBirth, disabled: isEditable}, [Validators.required, this.DOB18Validator('dateOfBirth')]),
        email: new FormControl({value: booking.customerEmail, disabled: isEditable}, [Validators.required, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+[.][A-Za-z.]{2,}$')]),
        drivingLicense: new FormControl({value: null, disabled: isEditable})
      }),
      profileDriver: this.formBuilder.group({
        nameProfileDriver: new FormControl({value: booking.customerDriverName, disabled: isEditable}, [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        phoneDriver: new FormControl({value: booking.customerDriverPhone, disabled: isEditable}, [Validators.required, Validators.pattern('^\\+\\d{11}$')]),
        nationalNoDriver: new FormControl({value: booking.customerDriverNationalIdNo, disabled: isEditable}, [Validators.required, Validators.pattern('^\\d{12}$')]),
        cityDriver: new FormControl({value: '', disabled: isEditable}, [Validators.required]),
        districtDriver: new FormControl({value: '', disabled: isEditable}, [Validators.required]),
        wardDriver: new FormControl({value: '', disabled: isEditable}, [Validators.required]),
        houseDriver: new FormControl({value: this.extractHouse(booking.customerDriverAddress), disabled: isEditable}, [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        dateOfBirthDriver: new FormControl({value: booking.customerDriverDateOfBirth, disabled: isEditable}, [Validators.required, this.DOB18Validator('dateOfBirthDriver')]),
        emailDriver: new FormControl({value: booking.customerDriverEmail, disabled: isEditable}, [Validators.required, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+[.][A-Za-z.]{2,}$')]),
        drivingLicenseDriver: new FormControl({value: null, disabled: isEditable})
      })
    });
  }

  private initializeFormWithoutDriver(isEditable: boolean, booking: BookingInfo) {
    this.profileForm = this.formBuilder.group({
      profile: this.formBuilder.group({
        nameProfile: new FormControl({value: booking.customerName, disabled: isEditable}, [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        phone: new FormControl({value: booking.customerPhone, disabled: isEditable}, [Validators.required, Validators.pattern('^\\+\\d{11}$')]),
        nationalNo: new FormControl({value: booking.customerNationalIdNo, disabled: isEditable}, [Validators.required, Validators.pattern('^\\d{12}$')]),
        city: new FormControl({value: '' , disabled: isEditable}, [Validators.required]),
        district: new FormControl({value: '', disabled: isEditable}, [Validators.required]),
        ward: new FormControl({value: '', disabled: isEditable}, [Validators.required]),
        house: new FormControl({value: this.extractHouse(this.booking.customerAddress), disabled: isEditable}, [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        dateOfBirth: new FormControl({value: booking.customerDateOfBirth, disabled: isEditable}, [Validators.required,this.DOB18Validator('dateOfBirth')]),
        email: new FormControl({value: booking.customerEmail, disabled: isEditable}, [Validators.required, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+[.][A-Za-z.]{2,}$')]),
        drivingLicense: new FormControl({value: null,disabled: isEditable})
      }),
      profileDriver: this.formBuilder.group({
        nameProfileDriver: new FormControl({value: booking.customerName, disabled: isEditable}, [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        phoneDriver: new FormControl({value: booking.customerPhone, disabled: isEditable}, [Validators.required, Validators.pattern('^\\+\\d{11}$')]),
        nationalNoDriver: new FormControl({value: booking.customerNationalIdNo, disabled: isEditable}, [Validators.required, Validators.pattern('^\\d{12}$')]),
        cityDriver: new FormControl({value: '', disabled: isEditable}, [Validators.required]),
        districtDriver: new FormControl({value: '', disabled: isEditable}, [Validators.required]),
        wardDriver: new FormControl({value: '', disabled: isEditable}, [Validators.required]),
        houseDriver: new FormControl({value: this.extractHouse(booking.customerAddress), disabled: isEditable}, [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        dateOfBirthDriver: new FormControl({value: booking.customerDateOfBirth, disabled: isEditable}, [Validators.required,this.DOB18Validator('dateOfBirthDriver')]),
        emailDriver: new FormControl({value: booking.customerEmail, disabled: isEditable}, [Validators.required, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+[.][A-Za-z.]{2,}$')]),
        drivingLicenseDriver: new FormControl({value: null, disabled: isEditable})
      })
    });
  }

  private setupFormValueChangeListeners() {
    this.profileForm.get('profile.city')?.valueChanges.subscribe(cityProvinceCode => {
      this.onCityProvinceChange(cityProvinceCode);
    });

    this.profileForm.get('profile.district')?.valueChanges.subscribe(districtCode => {
      this.onDistrictChange(districtCode);
    });

    this.profileForm.get('profileDriver.cityDriver')?.valueChanges.subscribe(cityProvinceCode => {
      this.onCityProvinceDriverChange(cityProvinceCode);
    });

    this.profileForm.get('profileDriver.districtDriver')?.valueChanges.subscribe(districtCode => {
      this.onDistrictDriverChange(districtCode);
    });
  }

  private isBookingEditable(bookingStatus: string): boolean {
    const editableStatuses = ['CONFIRMED', 'PENDING_DEPOSIT'];
    return editableStatuses.includes(bookingStatus);
  }

  extractHouse(address: string): string {
    if (address === null || address === undefined) {
      return '';
    }
    return address.split(', ').slice(0, -3).join(', ');
  }

  fetchCitiesProvince(): void {
    this.carService.getCities().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: data => {
        this.cities = data;
        this.citiesDriver = data;
        if (this.cities.length > 0) {
          this.profileForm.get('profile.city')?.setValue(this.booking.customerCityCode);
          this.onCityProvinceChange(this.booking.customerCityCode);
        }
        if (this.citiesDriver.length > 0) {
          if (this.booking.driverId !== null) {
            this.profileForm.get('profileDriver.cityDriver')?.setValue(this.booking.customerDriverCityCode);
            this.onCityProvinceDriverChange(this.booking.customerDriverCityCode);
          } else {
            this.profileForm.get('profileDriver.cityDriver')?.setValue(this.booking.customerCityCode);
            this.onCityProvinceDriverChange(this.booking.customerCityCode);
          }
        }
      },
      error: error => console.error('Error fetching cities:', error)
    });
  }

  fetchCitiesProvinceWithoutDriver(): void {
    this.carService.getCities().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: data => {
        this.cities = data;
        this.citiesDriver = data;
        if (this.cities.length > 0) {
          this.profileForm.get('profile.city')?.setValue(this.booking.customerCityCode);
          this.onCityProvinceChange(this.booking.customerCityCode);
        }
        if (this.citiesDriver.length > 0) {
          this.profileForm.get('profileDriver.cityDriver')?.setValue(this.booking.customerCityCode);
          this.onCityProvinceDriverChangeWithoutDriver(this.booking.customerCityCode);
        }
      },
      error: error => console.error('Error fetching cities:', error)
    });
  }

  onCityProvinceChange(cityProvinceCode: number): void {
    this.carService.getDistrictsByCityProvince(cityProvinceCode).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.districts = data;
        if (this.districts.length > 0) {
          this.profileForm
            .get('profile.district')
            ?.setValue(this.booking.customerDistrictCode);
          this.onDistrictChange(this.booking.customerDistrictCode);
        }
      },
      error: (error) => {
        console.error('Error fetching districts:', error);
      }
    });
  }

  onCityProvinceDriverChange(cityProvinceCode: number): void {
    this.carService.getDistrictsByCityProvince(cityProvinceCode).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.districtsDriver = data;
        if (this.districtsDriver.length > 0) {
          if (this.booking.driverId !== null) {
            this.profileForm
              .get('profileDriver.districtDriver')
              ?.setValue(this.booking.customerDriverDistrictCode);
            this.onDistrictDriverChange(this.booking.customerDriverDistrictCode);
          } else {
            this.profileForm
              .get('profileDriver.districtDriver')
              ?.setValue(this.booking.customerDistrictCode);
            this.onDistrictDriverChange(this.booking.customerDistrictCode);
          }
        }
      },
      error: (error) => {
        console.error('Error fetching districts:', error);
      }
    });
  }

  onCityProvinceDriverChangeWithoutDriver(cityProvinceCode: number): void {
    this.carService.getDistrictsByCityProvince(cityProvinceCode).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.districtsDriver = data;
        if (this.districtsDriver.length > 0) {
          this.profileForm
            .get('profileDriver.districtDriver')
            ?.setValue(this.booking.customerDistrictCode);
          this.onDistrictDriverChangeWithoutDriver(this.booking.customerDistrictCode);
        }
      },
      error: (error) => {
        console.error('Error fetching districts:', error);
      }
    });
  }

  onDistrictChange(districtCode: number): void {
    this.carService.getWardByDistrict(districtCode).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.wards = data;
        if (this.wards.length > 0) {
          this.profileForm.get('profile.ward')?.setValue(this.booking.customerWardCode);
        }
      },
      error: (error) => {
        console.error('Error fetching wards:', error);
      }
    });
  }

  onDistrictDriverChange(districtCode: number): void {
    this.carService.getWardByDistrict(districtCode).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.wardsDriver = data;
        if (this.wardsDriver.length > 0) {
          if (this.booking.driverId !== null) {
            this.profileForm.get('profileDriver.wardDriver')?.setValue(this.booking.customerDriverWardCode);
          } else {
            this.profileForm.get('profileDriver.wardDriver')?.setValue(this.booking.customerWardCode);
          }
        }
      },
      error: (error) => {
        console.error('Error fetching wards:', error);
      }
    });
  }

  onDistrictDriverChangeWithoutDriver(districtCode: number): void {
    this.carService.getWardByDistrict(districtCode).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.wardsDriver = data;
        if (this.wardsDriver.length > 0) {
          this.profileForm.get('profileDriver.wardDriver')?.setValue(this.booking.customerWardCode);
        }
      },
      error: (error) => {
        console.error('Error fetching wards:', error);
      }
    });
  }
  private DOB18Validator(dob: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedDate = new Date (control?.parent?.get(dob)?.value);
      const currentDate = new Date();
      const eighteenYearsAgo = new Date(currentDate);
      eighteenYearsAgo.setFullYear(currentDate.getFullYear() - 18);
      if (selectedDate > eighteenYearsAgo) {
        return { invalidDate: true };
      }
      return null;
    };
  }
  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    console.log(this.hasDriver)
    const bookingNo = this.id;
    const customerDriverLicense = this.selectedFile;
    const customerDriverDriverLicense = this.selectedFileDriver;

    const cityRequest = this.carService.getCityProvinceById(this.city?.value);
    const districtRequest = this.carService.getDistrictById(this.district?.value);
    const wardRequest = this.carService.getWardById(this.ward?.value);

    const cityDriverRequest = this.carService.getCityProvinceById(this.cityDriver?.value);
    const districtDriverRequest = this.carService.getDistrictById(this.districtDriver?.value);
    const wardDriverRequest = this.carService.getWardById(this.wardDriver?.value);

    forkJoin([cityRequest, districtRequest, wardRequest,cityDriverRequest,districtDriverRequest,wardDriverRequest]).subscribe(
      ([city, district, ward,cityDriver, districtDriver, wardDriver])=>{
        const editBookingDto: EditBookingDto = new EditBookingDto(
          this.nameProfile?.value,
          this.email?.value,
          this.nationalNo?.value,
          this.dateOfBirth?.value,
          this.phone?.value,
          `${this.house?.value}, ${ward.ward}, ${district.district}, ${city.cityProvince}`,
          this.ward?.value,
          this.district?.value,
          this.city?.value,
          this.hasDriver,
          this.nameProfileDriver?.value,
          this.emailDriver?.value,
          this.nationalNoDriver?.value,
          this.phoneDriver?.value,
          this.dateOfBirthDriver?.value,
          `${this.houseDriver?.value}, ${wardDriver.ward}, ${districtDriver.district}, ${cityDriver.cityProvince}`,
          this.selectedFileNameDriver,
          this.wardDriver?.value,
          this.districtDriver?.value,
          this.cityDriver?.value
        );
        const token = localStorage.getItem('token');
        console.log(this.id)
        if(token){
          this.bookingService.editBooking(bookingNo, editBookingDto, token, customerDriverLicense!, customerDriverDriverLicense!)
            .subscribe(
              response=>{
                alert('Booking updated successfully');
                this.router.navigate(['customer/view-booking-list']);
              },
              error => {
                console.error('Error updating booking', error);
              }
            )
        }
      }
    )


  }
  onFileSelected(event: any) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    this.selectedFile = file;

    if (this.selectedFile) {
      this.selectedFileName = this.selectedFile.name;
      this.profileForm.get('drivingLicense')?.setValue(this.selectedFileName); // Update the form control with the file
      this.profileForm.get('drivingLicense')?.markAsTouched(); // Mark the control as touched to trigger validation
      // Create preview (for image files)
      if (this.selectedFile.size > 50 * 1024 * 1024) {
        // Reset form control and show error
        this.profileForm.get('profile.drivingLicense')?.setValue(null);
        this.profileForm.get('profile.drivingLicense')?.setErrors({invalidFileSize: true});
        return;
      }
      if (this.selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64String = e.target.result;
          sessionStorage.setItem('drivingLicense', base64String);
          this.filePreviewUrl = base64String;
          // this.filePreviewUrl = e.target.result;
        };
        reader.readAsDataURL(this.selectedFile);
      }
    }
  }


  ///////////////////////// Driver
  selectedFileDriver: File | null = null; // Declare and initialize selectedFile
  selectedFileNameDriver: string | null = null; // Declare and initialize selectedFileName
  filePreviewDriverUrl: string | null = null; // Declare and initialize filePreviewUrl
  onFileSelectedDriver(event: any) {
    const target = event.target as HTMLInputElement;
    this.selectedFileDriver = target.files?.[0] || null;

    if (this.selectedFileDriver) {
      this.selectedFileNameDriver = this.selectedFileDriver.name;
      this.profileForm.get('drivingLicenseDriver')?.setValue(this.selectedFileNameDriver); // Update the form control with the file
      this.profileForm.get('drivingLicenseDriver')?.markAsTouched(); // Mark the control as touched to trigger validation
      // Create preview (for image files)
      if (this.selectedFileDriver.size > 50 * 1024 * 1024) {
        // Reset form control and show error
        this.profileForm.get('profileDriver.drivingLicenseDriver')?.setValue(null);
        this.profileForm.get('profileDriver.drivingLicenseDriver')?.setErrors({invalidFileSize: true});
        return;
      }
      if (this.selectedFileDriver.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64String = e.target.result;
          sessionStorage.setItem('driverDrivingLicense', base64String);
          this.filePreviewDriverUrl = base64String;
        };
        reader.readAsDataURL(this.selectedFileDriver);
      } else {
        this.filePreviewDriverUrl = null; // Reset preview for non-image files
      }
    } else {
      // User cancelled or didn't select a file
      this.selectedFileDriver = null;
      this.selectedFileNameDriver = null;
      this.filePreviewDriverUrl = null; // Clear the preview
      this.profileForm.get('profileDriver.drivingLicenseDriver')?.setValue(null);
    }
  }
  onCheckboxChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (this.booking.driverId) {
        this.initializeForm(this.isEditable, this.booking);
        this.hasDriver = true;
      } else {
        this.resetDriverForm();
        this.hasDriver = true;
      }
    } else {
      this.initializeForm(this.isEditable, this.booking, true);
      this.hasDriver = false;
    }
    this.cdr.detectChanges();

  }

  resetDriverForm(): void {
    const emptyDriverForm = {
      nameProfileDriver: '',
      phoneDriver: '',
      nationalNoDriver: '',
      cityDriver: '',
      districtDriver: '',
      wardDriver: '',
      houseDriver: '',
      dateOfBirthDriver: '',
      emailDriver: '',
      drivingLicenseDriver: ''
    };

    this.profileForm.get('profileDriver')?.patchValue(emptyDriverForm);
    this.filePreviewDriverUrl = null;
  }
  cancelBooking(id: number){
    const token = localStorage.getItem('token');
    if(token){
      this.bookingService.cancelBooking(id, token).subscribe(
        res=>{
          alert('Booking cancelled successfully')
          window.location.reload();
        },
        error=>{
          alert('Booking cancelled failed')
        }
      )
    }


  }
  confirmPickUp(id: number){
    const token = localStorage.getItem('token');
    if(token){
      this.bookingService.confirmPickUp(id, token).subscribe(
        res=>{
          this.bookingStatusService.updateBookingStatus('IN_PROGRESS');
          alert('Booking has confirmed pickup')
          this.getBookingDetail(id);
        },
        error => {
          console.log('error',error)
          alert('Confirmed pickup failed!')
        }
      )
    }

  }
  confirmReturn(bookingNo: number): void {
    const token = localStorage.getItem('token');
    const modalElement = document.getElementById('notice');
    if (token) {
      this.bookingService.confirmReturn(bookingNo, token).subscribe(
        response => {
          this.successMess = response.message;
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
              modalInstance.show();
            }
          }
          this.openRatingModal(bookingNo);
        },
        error => {
          this.errorMess = error.error.message;
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
              modalInstance.show();
            }
          }
          this.getBookingDetail(bookingNo);
        }
      );
    }
  }

  initializeFormFeedBack() {
    this.feedBackForm = this.formBuilder.group({
      ratings: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      content: ['']
    });
  }

  setRating(value: number) {
    this.feedBackForm.get('ratings')?.setValue(value);
    this.feedBackForm.get('ratings')?.markAsTouched();
  }

  submitFeedBack(bookingNo: number) {

    if (this.feedBackForm.invalid) {
      this.feedBackForm.markAllAsTouched();
      return;
    }

    const date = new Date();
    const formattedDate = date.toISOString().split('.')[0];

    this.feedBackDto = new FeedbackDto(
      this.feedBackForm.get('ratings')?.value,
      this.feedBackForm.get('content')?.value,
      bookingNo,
      formattedDate
    );

    const token = localStorage.getItem('token');
    if (token) {
      this.feedBackService.sendFeedback(this.feedBackDto, token).subscribe(
        response => {
          this.feedBackSuccess = response.message;
          this.closeModal('giveRating');
        },
        error => {
          this.feedBackError = error.error.message;
        }
      );
    }
  }
  openRatingModal(bookingNo: number) {
    const modalEl = document.getElementById('giveRating');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
    this.getBookingDetail(bookingNo);
  }

  closeModal(modalId: string) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  closeNoticeModal() {
    this.closeModal('notice');
  }


  //Renter
  get nameProfile() {
    return this.profileForm.get('profile.nameProfile');
  }

  get phone() {
    return this.profileForm.get('profile.phone');
  }

  get nationalNo() {
    return this.profileForm.get('profile.nationalNo');
  }

  get city() {
    return this.profileForm.get('profile.city');
  }

  get district() {
    return this.profileForm.get('profile.district');
  }

  get ward() {
    return this.profileForm.get('profile.ward');
  }

  get house() {
    return this.profileForm.get('profile.house');
  }

  get dateOfBirth() {
    return this.profileForm.get('profile.dateOfBirth');
  }

  get email() {
    return this.profileForm.get('profile.email');
  }

  get drivingLicense() {
    return this.profileForm.get('profile.drivingLicense');
  }

  // Driver
  get nameProfileDriver() {
    return this.profileForm.get('profileDriver.nameProfileDriver');
  }

  get phoneDriver() {
    return this.profileForm.get('profileDriver.phoneDriver');
  }

  get nationalNoDriver() {
    return this.profileForm.get('profileDriver.nationalNoDriver');
  }

  get cityDriver() {
    return this.profileForm.get('profileDriver.cityDriver');
  }

  get districtDriver() {
    return this.profileForm.get('profileDriver.districtDriver');
  }

  get wardDriver() {
    return this.profileForm.get('profileDriver.wardDriver');
  }

  get houseDriver() {
    return this.profileForm.get('profileDriver.houseDriver');
  }

  get dateOfBirthDriver() {
    return this.profileForm.get('profileDriver.dateOfBirthDriver');
  }

  get emailDriver() {
    return this.profileForm.get('profileDriver.emailDriver');
  }

  get drivingLicenseDriver() {
    return this.profileForm.get('profileDriver.drivingLicenseDriver');
  }
  get ratings(){
    return this.feedBackForm.get('ratings');
  }
  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  protected readonly PaymentMethod = PaymentMethod;

  ngAfterViewInit(): void {
    const modalElement = document.getElementById('notice');
    if (modalElement) {
      new bootstrap.Modal(modalElement);
    }
  }

  ngOnDestroy(): void {
    if (this.bookingStatusSubscription) {
      this.bookingStatusSubscription.unsubscribe();
    }
    if (this.bookingSubscription) {
      this.bookingSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}

