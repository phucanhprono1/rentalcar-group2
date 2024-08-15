import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {FormValidateConstantService} from "../../../services/form-validate-constant.service";
import {AuthService} from "../../../services/auth.service";
import {Router} from "@angular/router";
import {CarService} from "../../../services/car.service";
import {ShareDataService} from "../../../services/share-data.service";
import {ProfileService} from "../../../services/profile.service";
import {CityProvince} from "../../../common/city-province";
import {District} from "../../../common/district";
import {Ward} from "../../../common/ward";

@Component({
  selector: 'app-booking-information',
  templateUrl: './booking-information.component.html',
  styleUrls: ['./booking-information.component.css']
})
export class BookingInformationComponent implements OnInit, AfterViewChecked{

  emailSubscription!: Subscription;
  cities: CityProvince[] = [];
  citiesDriver: CityProvince[] = [];
  districts: District[] = [];
  districtsDriver: District[] = [];
  wards: Ward[] = [];
  wardsDriver: Ward[] = [];
  emailReal: string = '';
  profileForm!: FormGroup;
  selectedCarId: number = 0;
  getProfileResponse: any;
  chosenCity!: CityProvince;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  filePreviewUrl: string | null = null;
  showDriverForm = true;
  addressRent!: string;


  constructor(private formBuilder: FormBuilder, private carService: CarService,
              private router: Router, private sharedData: ShareDataService, private profileService: ProfileService, private authService
                : AuthService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    const storedCarId = sessionStorage.getItem('selectedCarId');
    if (storedCarId) {
      this.sharedData.setCarId(+storedCarId);
      this.sharedData.currentCarId$.subscribe(carId => {
        if (carId) {
          this.selectedCarId = carId;
        }
      });
      sessionStorage.setItem("hasDriver", JSON.stringify(true));
      this.initializeForm();

      this.fetchCitiesProvince();
      this.fetchCitiesProvinceDriver();

      this.emailSubscription = this.authService.email$.subscribe(email => {
        this.emailReal = email;
        this.profileForm.get('profile.email')?.setValue(email);
      });

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

      this.loadProfile();
    }


  }


  private initializeForm() {
    this.profileForm = this.formBuilder.group({
      profile: this.formBuilder.group({
        nameProfile: new FormControl("", [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        phone: new FormControl("", [Validators.required, Validators.pattern('^\\+\\d{11}$')]),
        nationalNo: new FormControl("", [Validators.required, Validators.pattern('^\\d{12}$')]),
        city: new FormControl('', [Validators.required]),
        district: new FormControl('', [Validators.required]),
        ward: new FormControl('', [Validators.required]),
        house: new FormControl("", [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        dateOfBirth: new FormControl(null, [Validators.required, DOB18Validator('dateOfBirth')]),
        email: new FormControl("", [Validators.required, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+[.][A-Za-z.]{2,}$')]),
        drivingLicense: new FormControl(null)
      }),
      profileDriver: this.formBuilder.group({
        nameProfileDriver: new FormControl("", [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        phoneDriver: new FormControl("", [Validators.required, Validators.pattern('^\\+\\d{11}$')]),
        nationalNoDriver: new FormControl("", [Validators.required, Validators.pattern('^\\d{12}$')]),
        cityDriver: new FormControl('', [Validators.required]),
        districtDriver: new FormControl('', [Validators.required]),
        wardDriver: new FormControl('', [Validators.required]),
        houseDriver: new FormControl("", [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        dateOfBirthDriver: new FormControl(null, [Validators.required, DOB18Validator('dateOfBirthDriver')]),
        emailDriver: new FormControl("", [Validators.required, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+[.][A-Za-z.]{2,}$')]),
        drivingLicenseDriver: new FormControl(null)
      })
    })

    function DOB18Validator(dob: string): ValidatorFn {
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

  loadProfile(): void {
    // Replace with actual token retrieval logic
    const token = this.getToken();

    this.profileService.getProfile(token).subscribe({
      next: (profileData) => {
        console.log("Profile Data: ", profileData);
        this.getProfileResponse = profileData;
        this.populateLocation(this.getProfileResponse);
        this.updateFormValues(this.getProfileResponse);
      },
      error: (error) => {
        console.error('Error fetching profile:', error); // Log errors
      }
    });
  }


  updateFormValues(profileData: any): void {
    console.log('Profile data:', profileData);
    this.profileForm.patchValue({
      profile: {
        nameProfile: profileData.fullName || '',
        phone: profileData.phoneNo || '',
        nationalNo: profileData.nationalIdNo || '',
        city: '',
        district: '',
        ward: '',
        house: this.extractHouse(profileData.address) || '',
        dateOfBirth: profileData.dateOfBirth || '',
        email: profileData.email || '',
        drivingLicense: profileData.drivingLicenseFile || ''
      }
    });


  }

  private populateLocation(profileData: any) {
    console.log("Is this running ?")
    const city = this.extractCity(profileData.address);
    const district = this.extractDistrict(profileData.address);
    const ward = this.extractWard(profileData.address);
    this.carService.getCities().subscribe(cities => {
      this.cities = cities;
      const cityObj = this.cities.find(c => c.cityProvince === city);
      if (cityObj) {
        this.profileForm.get('profile.city')?.setValue(cityObj.cityProvinceCode);
        this.carService.getDistrictsByCityProvince(cityObj.cityProvinceCode).subscribe(districts => {
          this.districts = districts;
          const districtObj = this.districts.find(d => d.district === district);
          if (districtObj) {
            this.profileForm.get('profile.district')?.setValue(districtObj.districtCode);
            this.carService.getWardByDistrict(districtObj.districtCode).subscribe(wards => {
              this.wards = wards;
              const wardObj = this.wards.find(w => w.ward === ward);
              if (wardObj) {
                this.profileForm.get('profile.ward')?.setValue(wardObj.wardCode);
              }
            });
          }
        });
      }
    });

    this.filePreviewUrl = profileData.drivingLicenseUrl || null;
  }

  extractCity(address: string): string {
    if (address === null || address === undefined) {
      return '';
    }
    return address.split(', ').slice(-1)[0];
  }

  extractDistrict(address: string): string {
    if (address === null || address === undefined) {
      return '';
    }
    return address.split(', ').slice(-2)[0];
  }

  extractWard(address: string): string {
    if (address === null || address === undefined) {
      return '';
    }
    return address.split(', ').slice(-3)[0];
  }

  extractHouse(address: string): string {
    if (address === null || address === undefined) {
      return '';
    }
    return address.split(', ').slice(0, -3).join(', ');
  }

  fetchCitiesProvince(): void {
    this.carService.getCities().subscribe({
      next: data => this.handleCitiesData(data),
      error: error => console.error('Error fetching cities:', error)
    });
  }

  private handleCitiesData(data: any[]): void { // Replace 'any' with the actual type
    this.cities = data;
    if (this.cities.length > 0) {
      this.profileForm.get('profile.city')?.setValue(this.cities[0].cityProvinceCode);
      this.onCityProvinceChange(this.cities[0].cityProvinceCode);
    }
  }

  onCityProvinceChange(cityProvinceCode: number): void {
    this.carService.getDistrictsByCityProvince(cityProvinceCode).subscribe({
      next: (data) => {
        console.log("data inside OnCiTyProvinceChange" + cityProvinceCode);
        this.districts = data;
        if (this.districts.length > 0) {
          this.profileForm
            .get('profile.district')
            ?.setValue(this.districts[this.chosenCity.cityProvinceCode].districtCode);
          this.onDistrictChange(this.districts[0].districtCode);
        }
      },
      error: (error) => {
        console.error('Error fetching districts:', error);
      }
    });
  }

  onDistrictChange(districtCode: number): void {
    this.carService.getWardByDistrict(districtCode).subscribe(
      (data) => {
        this.wards = data;
        console.log('Wards:', this.wards);
        if (this.wards.length > 0) {
          this.profileForm.get('profile.ward')?.setValue(this.wards[0].wardCode); // Assuming wardCode is available
        }
      },
      (error) => {
        console.error('Error fetching wards:', error);
      }
    );
  }

  getToken(): string | null {
    // Replace with actual token retrieval logic
    return localStorage.getItem('token');
  }

  getEmail(): string {
    return this.emailReal;
  }

// Declare and initialize filePreviewUrl

  submitFormData: any

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    console.log("Form information" + JSON.stringify(this.profileForm.value));
    console.log("Form information" + this.profileForm.get("profile.drivingLicense")?.value);
    const profileData = this.profileForm.value.profile;
    console.log("Im inside on submit" + JSON.stringify(this.profileForm.value.profile));
    const city = this.cities.find(city => city.cityProvinceCode == profileData['city'])?.cityProvince;
    const district = this.districts.find(district => district.districtCode == profileData['district'])?.district;
    const ward = this.wards.find(ward => ward.wardCode == profileData['ward'])?.ward;
    const profileDataDriver = this.profileForm.value.profileDriver;
    console.log("Profile Driver: " + JSON.stringify(this.profileForm.value.profile));
    const cityDriver = this.citiesDriver.find(city => city.cityProvinceCode == profileDataDriver['cityDriver'])?.cityProvince;
    const districtDriver = this.districtsDriver.find(district => district.districtCode == profileDataDriver['districtDriver'])?.district;
    const wardDriver = this.wardsDriver.find(ward => ward.wardCode == profileDataDriver['wardDriver'])?.ward;
    sessionStorage.setItem('addressDriver', `${profileDataDriver['houseDriver']}, ${wardDriver}, ${districtDriver}, ${cityDriver}`);
    console.log("Im the address" + `${profileDataDriver['houseDriver']}, ${wardDriver}, ${districtDriver}, ${cityDriver}`);
    this.submitFormData =this.profileForm.value;
    this.submitFormData['address'] = `${profileData['house']}, ${ward}, ${district}, ${city}`;
    sessionStorage.setItem('booking-info', JSON.stringify(this.submitFormData));
    this.navigate('customer/rent-a-car/payment');
  }
  onFileSelected(event: any) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    this.selectedFile = file;

    if (this.selectedFile) {
      this.sharedData.addFile(this.selectedFile); // Add the file to the service
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
      this.sharedData.addFile(this.selectedFileDriver); // Add the file to the service
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

  get nameProfile() {
    return this.profileForm.get('profile')?.get('nameProfile');
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


  //////////////////// Driver
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

  onCheckboxChange(event: Event) {
    this.showDriverForm = (event.target as HTMLInputElement).checked;
    if (this.showDriverForm) {
      console.log("Im inside checked")
      this.resetDriverForm();
      this.getProfileResponse = null;
      this.filePreviewDriverUrl = null;
      sessionStorage.setItem("hasDriver", JSON.stringify(true));
    } else if (!this.showDriverForm) { // If not different driver (same as renter)
      this.loadDriverProfile();
      sessionStorage.setItem("hasDriver", JSON.stringify(false));
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

  loadDriverProfile(): void {
    // Replace with actual token retrieval logic
    const token = this.getToken();

    this.profileService.getProfile(token).subscribe({
      next: (profileData) => {
        this.getProfileResponse = profileData;
        console.log("URL pic" + profileData.drivingLicenseUrl);
        this.populateDriverLocation(this.getProfileResponse);
        this.updateDriverFormValues(this.getProfileResponse);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching profile:', error); // Log errors
      }
    });
  }


  updateDriverFormValues(profileData: any): void {
    this.profileForm.patchValue({
      profileDriver: {
        nameProfileDriver: profileData.fullName || '',
        phoneDriver: profileData.phoneNo || '',
        nationalNoDriver: profileData.nationalIdNo || '',
        cityDriver: '',
        districtDriver: '',
        wardDriver: '',
        houseDriver: this.extractHouse(profileData.address) || '',
        dateOfBirthDriver: profileData.dateOfBirth || '',
        emailDriver: profileData.email || '',
        drivingLicenseDriver: profileData.drivingLicenseFile || ''
      }
    });


  }

  private populateDriverLocation(profileData: any) {
    const city = this.extractCity(profileData.address);
    const district = this.extractDistrict(profileData.address);
    const ward = this.extractWard(profileData.address);
    this.carService.getCities().subscribe(cities => {
      this.citiesDriver = cities;
      const cityObj = this.citiesDriver.find(c => c.cityProvince === city);
      if (cityObj) {
        this.profileForm.get('profileDriver.cityDriver')?.setValue(cityObj.cityProvinceCode);
        this.carService.getDistrictsByCityProvince(cityObj.cityProvinceCode).subscribe(districts => {
          console.log("INSIDE DRIVER FUNC"+ districts)
          this.districtsDriver = districts;
          const districtObj = this.districtsDriver.find(d => d.district === district);
          if (districtObj) {
            this.profileForm.get('profileDriver.districtDriver')?.setValue(districtObj.districtCode);
            this.carService.getWardByDistrict(districtObj.districtCode).subscribe(wards => {
              this.wardsDriver = wards;
              const wardObj = this.wardsDriver.find(w => w.ward === ward);
              if (wardObj) {
                this.profileForm.get('profileDriver.wardDriver')?.setValue(wardObj.wardCode);
              }
            });
          }
        });
      }
    });

    this.filePreviewDriverUrl = profileData.drivingLicenseUrl || null;
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  fetchCitiesProvinceDriver(): void {
    this.carService.getCities().subscribe({
      next: data =>
      {
        this.handleCitiesDriverData(data);
      },
      error: error => console.error('Error fetching cities:', error)
    });
  }

  private handleCitiesDriverData(data: any[]): void { // Replace 'any' with the actual type
    this.citiesDriver = data;
    console.log("Im insdie driver handle data"+ JSON.stringify(data));
    if (this.citiesDriver.length > 0) {
      this.profileForm.get('profileDriver.cityDriver')?.setValue(this.citiesDriver[0].cityProvinceCode);
      this.onCityProvinceDriverChange(this.citiesDriver[0].cityProvinceCode);
    }
  }

  onCityProvinceDriverChange(cityProvinceCode: number): void {
    this.carService.getDistrictsByCityProvince(cityProvinceCode).subscribe({
      next: (data) => {
        console.log("data inside OnCiTyProvinceChange Driver XD: " + cityProvinceCode);
        this.districtsDriver = data;
        if (this.districtsDriver.length > 0) {
          this.profileForm
            .get('profileDriver.districtDriver')
            ?.setValue(this.districtsDriver[this.chosenCity.cityProvinceCode].districtCode);
          this.onDistrictDriverChange(this.districtsDriver[0].districtCode);
        }
      },
      error: (error) => {
        console.error('Error fetching districts:', error);
      }
    });
  }

  onDistrictDriverChange(districtCode: number): void {
    this.carService.getWardByDistrict(districtCode).subscribe(
      (data) => {
        this.wardsDriver = data;
        console.log('Wards:', this.wardsDriver);
        if (this.wardsDriver.length > 0) {
          this.profileForm.get('profileDriver.wardDriver')?.setValue(this.wardsDriver[0].wardCode); // Assuming wardCode is available
        }
      },
      (error) => {
        console.error('Error fetching wards:', error);
      }
    );
  }

}
