import {CarStatus} from "../component/step-four/step-four.component";

export class UpdateCarDTO {
  constructor(
    private mileage: number,
    private fuelConsumption: number,
    private basePrice: number,
    private deposit: number,
    private address: string,
    private description: string,
    private additionalFunctions: string,
    private termsOfUse: string,
    private carStatus: CarStatus,
    private cityProvinceId: number,
    private districtId: number,
    private wardId: number,
    private images: string[]
  ) {
  }
}
