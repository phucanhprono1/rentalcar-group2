import {CarStatus} from "../component/step-four/step-four.component";

export class Car {
  public name: string;
  public licensePlate: string;
  public brand: string;
  public model: string;
  public color: string;
  public numberOfSeats: number;
  public productionYears: number;
  public transmissionType: string;
  public fuelType: string;
  public mileage: number;
  public fuelConsumption: number;
  public basePrice: number;
  public deposit: number;
  public address: string;
  public description: string;
  public additionalFunctions: string;
  public termsOfUse: string;
  public registrationPaper: string;
  public certificateOfInspection: string;
  public insurance: string;
  public carStatus: CarStatus;
  public images: string[];
  public cityProvince: number;
  public district: number;
  public ward: number;

  constructor(
    name: string,
    licensePlate: string,
    brand: string,
    model: string,
    color: string,
    numberOfSeats: number,
    productionYears: number,
    transmissionType: string,
    fuelType: string,
    mileage: number,
    fuelConsumption: number,
    basePrice: number,
    deposit: number,
    address: string,
    description: string,
    additionalFunctions: string,
    termsOfUse: string,
    registrationPaper: string,
    certificateOfInspection: string,
    insurance: string,
    carStatus:CarStatus,
    images: string[] = [],
    cityProvince: number,
    district: number,
    ward: number
  ) {
    this.name = name;
    this.licensePlate = licensePlate;
    this.brand = brand;
    this.model = model;
    this.color = color;
    this.numberOfSeats = numberOfSeats;
    this.productionYears = productionYears;
    this.transmissionType = transmissionType;
    this.fuelType = fuelType;
    this.mileage = mileage;
    this.fuelConsumption = fuelConsumption;
    this.basePrice = basePrice;
    this.deposit = deposit;
    this.address = address;
    this.description = description;
    this.additionalFunctions = additionalFunctions;
    this.termsOfUse = termsOfUse;
    this.registrationPaper = registrationPaper;
    this.certificateOfInspection = certificateOfInspection;
    this.insurance = insurance;
    this.carStatus=carStatus;
    this.images = images;
    this.cityProvince = cityProvince;
    this.district = district;
    this.ward = ward;
  }
}

