export class EditBookingDto {
  customerName: string;
  customerEmail: string;
  customerNationalIdNo: string;
  customerDateOfBirth: string;
  customerPhone: string;
  customerAddress: string;
  customerWardCode: number;
  customerDistrictCode: number;
  customerCityCode: number;
  hasDriver: boolean;
  customerDriverName?: string;
  customerDriverEmail?: string;
  customerDriverNationalIdNo?: string;
  customerDriverPhone?: string;
  customerDriverDateOfBirth?: string;
  customerDriverAddress?: string;
  customerDriverDriverLicense?: string | null | undefined;
  customerDriverWardCode?: number;
  customerDriverDistrictCode?: number;
  customerDriverCityCode?: number;

  constructor(
    customerName: string,
    customerEmail: string,
    customerNationalIdNo: string,
    customerDateOfBirth: string,
    customerPhone: string,
    customerAddress: string,
    customerWardCode: number,
    customerDistrictCode: number,
    customerCityCode: number,
    hasDriver: boolean,
    customerDriverName?: string,
    customerDriverEmail?: string,
    customerDriverNationalIdNo?: string,
    customerDriverPhone?: string,
    customerDriverDateOfBirth?: string,
    customerDriverAddress?: string,
    customerDriverDriverLicense?: string | null,
    customerDriverWardCode?: number,
    customerDriverDistrictCode?: number,
    customerDriverCityCode?: number
  ) {
    this.customerName = customerName;
    this.customerEmail = customerEmail;
    this.customerNationalIdNo = customerNationalIdNo;
    this.customerDateOfBirth = customerDateOfBirth;
    this.customerPhone = customerPhone;
    this.customerAddress = customerAddress;
    this.customerWardCode = customerWardCode;
    this.customerDistrictCode = customerDistrictCode;
    this.customerCityCode = customerCityCode;
    this.hasDriver = hasDriver;
    this.customerDriverName = customerDriverName;
    this.customerDriverEmail = customerDriverEmail;
    this.customerDriverNationalIdNo = customerDriverNationalIdNo;
    this.customerDriverPhone = customerDriverPhone;
    this.customerDriverDateOfBirth = customerDriverDateOfBirth;
    this.customerDriverAddress = customerDriverAddress;
    this.customerDriverDriverLicense = customerDriverDriverLicense;
    this.customerDriverWardCode = customerDriverWardCode;
    this.customerDriverDistrictCode = customerDriverDistrictCode;
    this.customerDriverCityCode = customerDriverCityCode;
  }
}
