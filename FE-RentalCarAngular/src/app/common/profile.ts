export class Profile {
  constructor(private id: number,
              private name: string,
              private nationalId: string,
              private cityCode: number,
              private districtCode: number,
              private wardCode: number,
              private house: string,
              private dateOfBirth: Date,
              private email: string,
              private drivingLicense: string,
  ) {
  }
}
