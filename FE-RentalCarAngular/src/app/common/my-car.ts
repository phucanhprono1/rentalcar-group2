export class MyCar {
  constructor(public id: number,
              public name: string,
              public basePrice: number,
              public address: string,
              public carStatus: string,
              public rating: number,
              public numberOfRide: number,
              public isPendingDeposit: boolean,
              public isPendingPayment: boolean) {
  }
}
