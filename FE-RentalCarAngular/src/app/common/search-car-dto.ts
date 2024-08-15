import {CarStatus} from "../component/step-four/step-four.component";

export class SearchCarDTO {
  id!: number;
  name!: string;
  address!: string;
  carStatus!: CarStatus;
  basePrice!: number;
  lastModifiedDate!: string;
  ratings!: number;
  noOfRide!: number;
  images?: string[];

}
