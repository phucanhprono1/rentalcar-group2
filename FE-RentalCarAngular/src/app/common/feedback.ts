export class Feedback {

  constructor(
    public id: number,
    public carName: string,
    public content: string,
    public dateTime: string,
    public ratings: number,
    public customer: string,
    public startDate: string,
    public endDate: string,
    public image: string) {
  }
}
