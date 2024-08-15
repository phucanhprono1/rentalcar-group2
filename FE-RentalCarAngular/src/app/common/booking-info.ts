export class BookingInfo {
  bookingNo: number;
  startDateTime: string;
  endDateTime: string;
  numberOfDays: number;
  total: number;
  deposit: number;
  carId: number;
  carName: string;
  basePrice: number;
  bookingStatus: BookingStatus;
  customerId: number;
  driverId: number;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail: string;
  customerNationalIdNo: string;
  customerPhone: string;
  customerDrivingLicense: string;
  customerDateOfBirth: string;
  customerAddress: string;
  customerWardCode: number;
  customerDistrictCode: number;
  customerCityCode: number;
  customerDriverName: string;
  customerDriverEmail: string;
  customerDriverNationalIdNo: string;
  customerDriverPhone: string;
  customerDriverDateOfBirth: string;
  customerDriverAddress: string;
  customerDriverDrivingLicense: string;
  customerDriverWardCode: number;
  customerDriverDistrictCode: number;
  customerDriverCityCode: number;
  images: string[];

  constructor(data: any) {
    this.bookingNo = data.bookingNo;
    this.startDateTime = data.startDateTime;
    this.endDateTime = data.endDateTime;
    this.numberOfDays = data.numberOfDays;
    this.total = data.total;
    this.deposit = data.deposit;
    this.carId = data.carId;
    this.carName = data.carName;
    this.basePrice = data.basePrice;
    this.bookingStatus = data.bookingStatus;
    this.customerId = data.customerId;
    this.driverId = data.driverId;
    this.paymentMethod = data.paymentMethod;
    this.customerName = data.customerName;
    this.customerEmail = data.customerEmail;
    this.customerNationalIdNo = data.customerNationalIdNo;
    this.customerPhone = data.customerPhone;
    this.customerDrivingLicense = data.customerDrivingLicense;
    this.customerDateOfBirth = data.customerDateOfBirth;
    this.customerAddress = data.customerAddress;
    this.customerWardCode = data.customerWardCode;
    this.customerDistrictCode = data.customerDistrictCode;
    this.customerCityCode = data.customerCityCode;
    this.customerDriverName = data.customerDriverName;
    this.customerDriverEmail = data.customerDriverEmail;
    this.customerDriverNationalIdNo = data.customerDriverNationalIdNo;
    this.customerDriverPhone = data.customerDriverPhone;
    this.customerDriverDateOfBirth = data.customerDriverDateOfBirth;
    this.customerDriverAddress = data.customerDriverAddress;
    this.customerDriverDrivingLicense = data.customerDriverDrivingLicense;
    this.customerDriverWardCode = data.customerDriverWardCode;
    this.customerDriverDistrictCode = data.customerDriverDistrictCode;
    this.customerDriverCityCode = data.customerDriverCityCode;
    this.images = data.images;
  }
}
export enum BookingStatus{
  CONFIRMED='CONFIRMED',
  PENDING_DEPOSIT='PENDING_DEPOSIT',
  IN_PROGRESS='IN_PROGRESS',
  CANCELLED='CANCELLED',
  PENDING_PAYMENT='PENDING_PAYMENT',
  COMPLETED='COMPLETED'
}
export enum PaymentMethod{
  MY_WALLET='MY_WALLET',
  CASH='CASH',
  BANK_TRANSFER='BANK_TRANSFER'
}
