import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {ProfileService} from '../../services/profile.service';
import {CarService} from '../../services/car.service';
import {CityProvince} from '../../common/city-province';
import {District} from '../../common/district';
import {Ward} from '../../common/ward';
import {FormValidateConstantService} from '../../services/form-validate-constant.service';
import * as bootstrap from 'bootstrap';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  protected oldPasswordIncorrect: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private carService: CarService
  ) {
  }
  errorMessages: string[] = []; // <-- Declare and initialize errorMessages array
  emailSubscription!: Subscription;
  emailReal: string = '';
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  cities: CityProvince[] = [];
  districts: District[] = [];
  wards: Ward[] = [];
  getProfileResponse: any;
  chosenCity!: CityProvince;
  address: string = '';
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  filePreviewUrl: string | null = null;

  ngOnInit(): void {
    this.initializeForm();

    this.fetchCitiesProvince();

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

    this.loadProfile();

    this.passwordForm.get('oldPassword')?.valueChanges.subscribe(() => {
      // Update password and repassword control validation
      this.passwordForm.get('password')?.updateValueAndValidity();
      this.passwordForm.get('repassword')?.updateValueAndValidity();

      this.oldPasswordIncorrect = false; // Reset the incorrect password flag
    });
  }


  ngOnDestroy(): void {
    if (this.emailSubscription) {
      this.emailSubscription.unsubscribe();
    }
  }

  get fullName() {
    return this.profileForm.get('profile.fullName');
  }

  get phoneNo() {
    return this.profileForm.get('profile.phoneNo');
  }

  get nationalIdNo() {
    return this.profileForm.get('profile.nationalIdNo');
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

  get password() {
    return this.passwordForm.get('password');
  }

  get oldPassword() {
    return this.passwordForm.get('oldPassword');
  }

  get repassword() {
    return this.passwordForm.get('repassword');
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const token = this.getToken();
    const profileData = this.profileForm.value.profile;
    console.log(JSON.stringify(this.profileForm.value.profile));

    profileData['role'] = localStorage.getItem('role') || '';
    console.log('City:', profileData['city'])
    const city:string | undefined = this.cities.find(city => city.cityProvinceCode == profileData['city'])?.cityProvince;
    const district = this.districts.find(district => district.districtCode == profileData['district'])?.district;
    const ward = this.wards.find(ward => ward.wardCode == profileData['ward'])?.ward;
    profileData['cityCode']=profileData['city'];
    profileData['districtCode']=profileData['district']
    profileData['wardCode']=profileData['ward']
    profileData['address'] = `${profileData['house']}, ${ward}, ${district}, ${city}`;
    const fileInput = document.getElementById('license') as HTMLInputElement;
    const file = fileInput.files?.[0] || null;
    console.log('Profile data:', profileData);
    this.profileService.updateProfile(token, profileData, file).subscribe(
      (response) => {
        console.log('Profile updated successfully:', response);
        localStorage.setItem("userName", profileData.fullName);
        this.showModal();
      },
      (error) => {
        console.error('Error updating profile:', error);
      }
    );
  }

  onSubmitChangePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const passwordData = this.passwordForm.value;
    console.log(JSON.stringify(passwordData));
    passwordData['email'] = this.getEmail();
    this.profileService.changePassword(this.getToken(), passwordData).subscribe(
      (response) => {
        console.log('Password changed successfully:', response);
        this.showModalPasswordProfile();
      },error => {
        if (error.status === 400 && error.error) {
          // Explicitly cast error.error to an object to satisfy TypeScript
          this.oldPasswordIncorrect = true; // Set the flag if old password is incorrect
          const errorObject = error.error as { [key: string]: string };
          this.errorMessages = Object.values(errorObject);
          console.error('Validation errors:', this.errorMessages);
        } else {
          console.error('Error changing password:', error);
          this.errorMessages = ['An unexpected error occurred'];
        }
      }
    );
  }

  initializeForm(): void {
    this.profileForm = this.formBuilder.group({
      profile: this.formBuilder.group({
        fullName: new FormControl('', [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        phoneNo: new FormControl('', [Validators.required, Validators.pattern('^\\+\\d{11}$')]),
        nationalIdNo: new FormControl('', [Validators.required, Validators.pattern('^\\d{12}$')]),
        city: new FormControl('', [Validators.required]),
        district: new FormControl('', [Validators.required]),
        ward: new FormControl('', [Validators.required]),
        house: new FormControl('', [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
        dateOfBirth: new FormControl('', [Validators.required, DOB18Validator('dateOfBirth')]),
        email: new FormControl('', [Validators.required])
        // drivingLicense: new FormControl('', [Validators.required, FormValidateConstantService.fileValidator])
      })
    });

    this.passwordForm = this.formBuilder.group({
      oldPassword: new FormControl('', [
        Validators.required,
        Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{7,}$'),
        FormValidateConstantService.notOnlyWhitespace
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{7,}$'),
        FormValidateConstantService.notOnlyWhitespace,
        passwordDifferentValidator('oldPassword')
      ]),
      repassword: new FormControl('', [
        Validators.required,
        Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{7,}$'),
        FormValidateConstantService.notOnlyWhitespace,
        passwordMatchValidator('password')
      ])
    });

    function passwordMatchValidator(passwordControlName: string): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const password = control?.parent?.get(passwordControlName)?.value;
        return control?.value !== password ? {passwordMismatch: true} : null;
      };
    }

    function passwordDifferentValidator(passwordControlName: string): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const password = control?.parent?.get(passwordControlName)?.value;
        return control?.value === password ? {passwordMatch: true} : null;
      };
    }

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



  loadProfile(): void {
    // Replace with actual token retrieval logic
    const token = this.getToken();

    this.profileService.getProfile(token).subscribe(profileData => {
      this.getProfileResponse = profileData;
      this.updateFormValues(profileData);
    });
  }

  updateFormValues(profileData: any): void {
    console.log('Profile data:', profileData);
    this.profileForm.patchValue({
      profile: {
        fullName: profileData.fullName || '',
        phoneNo: profileData.phoneNo || '',
        nationalIdNo: profileData.nationalIdNo || '',
        city: '',
        district: '',
        ward: '',
        house: this.extractHouse(profileData.address) || '',
        dateOfBirth: profileData.dateOfBirth || '',
        email: profileData.email || '',
        drivingLicense: profileData.drivingLicenseFile || ''
      }
    });

    // const cityCode = profileData.cityProvinceCode;
    // const districtCode = profileData.districtCode;
    // const wardCode = profileData.wardCode;
    const city = this.extractCity(profileData.address);
    const district = this.extractDistrict(profileData.address);
    const ward = this.extractWard(profileData.address);

    this.carService.getCities().subscribe(cities => {
      this.cities = cities;
      console.log("number of cities" + this.cities);
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
          this.filePreviewUrl = e.target.result;
        };
        reader.readAsDataURL(this.selectedFile);
      }
    }
  }


  @ViewChild('successProfile') successProfile!: ElementRef;

  showModal() {
    const modalElement = this.successProfile.nativeElement;
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  @ViewChild('changePasswordProfile') changePasswordProfile!: ElementRef;

  showModalPasswordProfile() {
    const modalElement = this.changePasswordProfile.nativeElement;
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

}

