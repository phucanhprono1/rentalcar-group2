import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {Router} from "@angular/router";
import {ShareDataService} from "../../../services/share-data.service";
import {BookingCarService} from "../../../services/booking-car.service";
import {fakeAsync} from "@angular/core/testing";
import {WalletService} from "../../../services/wallet.service";
import * as bootstrap from 'bootstrap';
import {Modal} from 'bootstrap';

interface BookingCarRequest {
  carId: number,
  startDateTime: string,
  endDateTime: string,
  customerName: string,
  customerEmail: string,
  customerNationalIdNo: string,
  customerDateOfBirth: Date,
  customerPhone: string
  customerWardCode: string;
  customerDistrictCode: string;
  customerCityCode: string;
  customerAddress: string,
  hasDriver: boolean, // Check if profileDriver data exists
  customerDriverName: string,
  customerDriverEmail: string,
  customerDriverNationalIdNo: string,
  customerDriverDateOfBirth: string,
  customerDriverPhone: string,
  customerDriverWardCode: string;
  customerDriverDistrictCode: string;
  customerDriverCityCode: string;
  customerDriverAddress: string,
  customerDriverDriverLicense: string,
  paymentMethod: string,
  paymentDeposit: number
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  balance: number = 0;
  protected selectedCarId: number = 0;
  files: File[] = [];
  formData: any | null;
  deposit: number = 0;
  bookingCarRequest: BookingCarRequest | undefined;
  toDate: string = '';
  fromDate: string = '';
  address: string = '';
  addressDriver: string = '';
  private token: string = '';
  customerDriverLicense: File | undefined;
  customerDriverDriverLicense: File | undefined;
  private hasDriver: boolean = false;
  errorMessage: string = '';
  isBalanceSufficient = true;

  constructor(private formBuilder: FormBuilder, private authService: AuthService,
              private router: Router, private sharedData: ShareDataService,
              private bookingCarService: BookingCarService, private walletService: WalletService) {
  }

  checkForm!: FormGroup;

  ngOnInit(): void {
    const token = localStorage.getItem("token");
    if (token) {
      this.walletService.getWallet(token)
        .subscribe({
          next: (data: any) => {
            this.balance = data.balance;
            console.log("balance" + this.balance);
          },
          error: (error) => this.errorMessage = error.message,
        });
    } else {
      this.errorMessage = "Authentication token not found.";
    }

    const storedCarId = sessionStorage.getItem('selectedCarId');
    if (storedCarId) {
      this.sharedData.setCarId(+storedCarId);
      this.sharedData.currentCarId$.subscribe(carId => {
        if (carId) {
          this.selectedCarId = carId;
        }
      });
    }

    this.checkForm = this.formBuilder.group({
      paymentMethod: new FormControl("MY_WALLET", [Validators.required]),
    })


    const depositStorage = sessionStorage.getItem('deposit');
    if (depositStorage) {
      this.deposit = +JSON.parse(depositStorage);
    }


    const toDate = sessionStorage.getItem("toDate");
    const fromDate = sessionStorage.getItem("fromDate");
    if (toDate && fromDate) {
      this.fromDate = fromDate;
      this.toDate = toDate;
    }
    const hasDriver = sessionStorage.getItem("hasDriver");
    if (hasDriver) {
      this.hasDriver = JSON.parse(hasDriver);
    }
    const addressDriver = sessionStorage.getItem("addressDriver");
    if ( addressDriver) {
      this.addressDriver = addressDriver;
    }
    console.log("Choice: " + JSON.stringify(this.checkForm.value));
    const storageData = sessionStorage.getItem("booking-info");
    if (storageData) {
      this.formData = JSON.parse(storageData);
      console.log(this.formData);
      this.bookingCarRequest = {
        carId: this.selectedCarId,
        startDateTime: this.fromDate,
        endDateTime: this.toDate,
        customerName: this.formData.profile.nameProfile,
        customerEmail: this.formData.profile.email,
        customerNationalIdNo: this.formData.profile.nationalNo,
        customerDateOfBirth: this.formData.profile.dateOfBirth,
        customerPhone: this.formData.profile.phone,
        customerWardCode: this.formData.profile.ward,
        customerDistrictCode: this.formData.profile.district,
        customerCityCode: this.formData.profile.city,
        customerAddress: this.formData.address,
        hasDriver: this.hasDriver,
        customerDriverName: this.formData.profileDriver?.nameProfileDriver || null,
        customerDriverEmail: this.formData.profileDriver?.emailDriver || null,
        customerDriverNationalIdNo: this.formData.profileDriver?.nationalNoDriver || null,
        customerDriverDateOfBirth: this.formData.profileDriver?.dateOfBirthDriver || null,
        customerDriverPhone: this.formData.profileDriver?.phoneDriver || null,
        customerDriverWardCode: this.formData.profileDriver?.wardDriver || null,
        customerDriverDistrictCode: this.formData.profileDriver?.districtDriver|| null,
        customerDriverCityCode: this.formData.profileDriver?.cityDriver || null,
        customerDriverAddress: this.addressDriver,
        customerDriverDriverLicense: this.formData.profileDriver.drivingLicenseDriver,
        paymentMethod: '',
        paymentDeposit: this.deposit
      };
    }
    this.sharedData.files$.subscribe(files => {
      this.files = files;
      this.processFiles();
    });
  }

  processFiles(): void {
    if (this.formData) {
      const customerDriverLicenseBase64 = sessionStorage.getItem('drivingLicense');
      const customerDriverDriverLicenseBase64 = sessionStorage.getItem('driverDrivingLicense');

      if (customerDriverLicenseBase64) {
        this.customerDriverLicense = this.base64ToFile(customerDriverLicenseBase64, 'customerDriverLicense.jpg');
      }
      if (customerDriverDriverLicenseBase64) {
        this.customerDriverDriverLicense = this.base64ToFile(customerDriverDriverLicenseBase64, 'customerDriverDriverLicense.jpg');
      }

      console.log("Customer Driver License:", this.customerDriverLicense?.name);
      console.log("Customer Driver Driver License:", this.customerDriverDriverLicense);
    }
  }

  base64ToFile(base64: string, fileName: string): File {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], {type: mimeString});
    return new File([blob], fileName, {type: mimeString});
  }

  get paymentMethod() {
    return this.checkForm.get('paymentMethod');
  }

  onSubmit() {
    this.isBalanceSufficient = this.balance >= this.deposit;
    if (this.checkForm.invalid || (!this.isBalanceSufficient && this.checkForm.get('paymentMethod')?.value === "MY_WALLET")) {
      this.checkForm.markAllAsTouched();
      return;
    }
    this.bookingCarRequest!.paymentMethod = this.checkForm.get('paymentMethod')?.value;
    console.log("Booking car request" + JSON.stringify(this.bookingCarRequest));
    const tokenStorage = localStorage.getItem("token");
    if (tokenStorage) {
      this.token = tokenStorage;
    }

    this.bookingCarService.createBooking(this.bookingCarRequest, this.token, this.customerDriverLicense, this.customerDriverDriverLicense)
      .subscribe({
        next: (response) => {
          this.bookingCarService.setBooking(response);
          console.log('Booking successful:', response);
          sessionStorage.getItem('drivingLicense');
          sessionStorage.getItem('driverDrivingLicense');
          // Clear session storage, reset files, and navigate
          sessionStorage.removeItem('booking-info');
          sessionStorage.removeItem('drivingLicense');
          sessionStorage.removeItem('driverDrivingLicense');
          sessionStorage.removeItem('deposit');
          sessionStorage.removeItem('toDate');
          sessionStorage.removeItem('fromDate');
          sessionStorage.removeItem('hasDriver');
          sessionStorage.removeItem('address');
          sessionStorage.removeItem('addressDriver');
          sessionStorage.removeItem('carName');
          this.files = []; // Clear your files array
          this.showModalSuccessWindow();
          const modalElement = this.successWindow.nativeElement;
          const modal = Modal.getInstance(modalElement);
          setTimeout(() => {
            modalElement.addEventListener('hidden.bs.modal', () => {
              this.router.navigate(['customer/rent-a-car/finish']);
            });
            modal.hide();
          }, 1000); // Adjust the delay (4000ms = 4 seconds) as needed
        },
        error: (error) => {
          console.error('Booking error:', error);
          // Handle the error (e.g., display error message to the user)
        }
      });
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

  @ViewChild('successWindow') successWindow!: ElementRef;

  showModalSuccessWindow() {
    const modalElement = this.successWindow.nativeElement;
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
}
