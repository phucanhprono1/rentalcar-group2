import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BehaviorSubject, forkJoin, Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import { CityProvince } from '../common/city-province';
import { District } from '../common/district';
import { Ward } from '../common/ward';
import {MyCar} from "../common/my-car";
import {SearchCarDTO} from "../common/search-car-dto";
import {CarDetail} from "../common/car-detail";
import {UpdateCarDTO} from "../common/update-car-dto";
import {Feedback} from "../common/feedback";
import {CarRatingCount} from "../common/car-rating-count";

@Injectable({
  providedIn: 'root'
})
export class CarService {

  private baseUrl = environment.baseUrl;
  private getBrandListUrl = `${environment.baseUrl}/getBrandList`;
  private getModelUrl = `${environment.baseUrl}/getModelList`;
  private addCarUrl = `${environment.baseUrl}/cars/save`;
  private getCityUrl = `${environment.baseUrl}/cityProvince?size=100`;
  private getDistrictUrl = `${environment.baseUrl}/district`;
  private getWardUrl = `${environment.baseUrl}/ward`;
  private getCarByOwner = `${environment.baseUrl}/cars/view-my-cars`;
  private getCarImagesUrl = `${environment.baseUrl}/cars`;
  private getCarInfoUrl = `${environment.baseUrl}/cars`;
  private updateBookingStatusUrl = `${environment.baseUrl}/bookings/confirm`;
  private getFeedbackUrl = `${environment.baseUrl}/custom-feedback`;
  private getAvgRatingUrl = `${environment.baseUrl}/custom-feedback/rating`;
  private getRatingCountUrl = `${environment.baseUrl}/custom-feedback/rating/count`;
  private updateCarStatusUrl = `${environment.baseUrl}/cars/updateStatus`;

  private carDetailSource = new BehaviorSubject<CarDetail | null>(null);
  currentCarDetail = this.carDetailSource.asObservable();

  constructor(private http: HttpClient) {}

  private carImgSource = new BehaviorSubject<string[]>([]);
  currentCarImg = this.carImgSource.asObservable();
  sendCarImage(carImg: string[]){
    this.carImgSource.next(carImg);
  }
  updateCarDetail(carDetail: CarDetail) {
    this.carDetailSource.next(carDetail);
    sessionStorage.setItem('address', carDetail.address);
  }



  getCarData(carId: number): Observable<{ carDetail: CarDetail, carImages: string[] }> {
    return forkJoin({
      carDetail: this.getCarDetail(carId),
      carImages: this.getCarImages(carId),
    }).pipe(
      tap(({ carDetail, carImages }) => {
        this.updateCarDetail(carDetail);
        this.sendCarImage(carImages);
      })
    );
  }


  getBrandList(): Observable<string[]> {
    return this.http.get<string[]>(this.getBrandListUrl);
  }

  getModelList(brandName: string): Observable<string[]> {
    const searchModelUrl = `${this.getModelUrl}?brand=${brandName}`;
    return this.http.get<string[]>(searchModelUrl);
  }

  getCities(): Observable<CityProvince[]> {
    return this.http.get<any>(this.getCityUrl).pipe(
      map(response => {
        return response._embedded.cityProvince.map((city: any) => {
          const cityProvinceCode = this.extractCodeFromUrl(city._links.self.href);
          return { ...city, cityProvinceCode };
        });
      })
    );
  }
  getCityProvinceById(id: number): Observable<CityProvince> {
    const url = `${this.baseUrl}/cityProvince/${id}`;
    return this.http.get<CityProvince>(url);
  }
  getDistrictById(id: number): Observable<District> {
    const url = `${this.getDistrictUrl}/${id}`;
    return this.http.get<District>(url);
  }
  getWardById(id: number): Observable<Ward> {
    const url = `${this.getWardUrl}/${id}`;
    return this.http.get<Ward>(url);
  }

  getDistrictsByCityProvince(cityProvinceCode: number): Observable<District[]> {
    return this.http.get<any>(`${this.baseUrl}/district/search/findDistrictByCityProvince_CityCode?cityProvinceCode=${cityProvinceCode}`).pipe(
      map(response => {
        return response._embedded.district.map((district: any) => {
          const districtCode = this.extractCodeFromUrl(district._links.self.href);
          return { ...district, districtCode };
        });
      })
    );
  }

  getWardByDistrict(districtCode: number): Observable<Ward[]> {
    return this.http.get<any>(`${this.baseUrl}/ward/search/findWardByDistrict_DistrictCode?districtCode=${districtCode}`).pipe(
      map(response => {
        return response._embedded.ward.map((ward: any) => {
          const wardCode = this.extractCodeFromUrl(ward._links.self.href);
          return { ...ward, wardCode };
        });
      })
    );
  }

  addCar(carData: any, token: string): Observable<any> {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<any>(this.addCarUrl, carData, { headers });
  }

  private extractCodeFromUrl(url: string): number {
    const parts = url.split('/');
    return parseInt(parts[parts.length - 1], 10);
  }

  getCarsByOwner(token: string, page: number, pageSize: number, sortBy: string): Observable<MyCarPaginatedResponse> {
    const headers = {Authorization: `Bearer ${token}`};
    return this.http.get<MyCarPaginatedResponse>(`${this.getCarByOwner}?page=${page}&size=${pageSize}&${sortBy}`, {headers});
  }

  getUserToken(): string | null {
    return localStorage.getItem("token");
  }
  findAvailableCars(startDate: string, endDate: string, address: string, sortBy: string, page:number, size: number): Observable<Page<SearchCarDTO>> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('address', address)
      .set('sortBy', sortBy)
      .set('page', page.toString())
      .set('size', size.toString());


    return this.http.get<Page<SearchCarDTO>>(`${this.baseUrl}/cars/available`, { params });
  }

  // private mapToSearchCarDTO(carArray: any[]): SearchCarDTO {
  //   return {
  //     carId: carArray[0],
  //     carName: carArray[1],
  //     address: carArray[2],
  //     carStatus: carArray[3],
  //     basePrice: carArray[4],
  //     lastModifiedDate: carArray[5],
  //     ratings: carArray[6],
  //     noOfRide: carArray[7],
  //   };
  // }
  hasBookings(carId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/cars/has-bookings?carId=${carId}`);
  }

  getCarImages(carId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.getCarImagesUrl}/${carId}/images`);
  }

  getCarDetail(carId: number): Observable<CarDetail> {
    return this.http.get<CarDetail>(`${this.getCarInfoUrl}/${carId}`);
  }
  updateCar(id: number,token: string, carUpdateDto: UpdateCarDTO): Observable<any> {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.put(`${this.baseUrl}/cars/${id}`, carUpdateDto, { headers });
  }

  updateBookingStatus(carId: number, currentStatus: string, targetStatus: string, token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.patch(`${this.updateBookingStatusUrl}/${carId}`,
      {
        currentStatus: currentStatus,
        targetStatus: targetStatus
      },
      { headers }
    );
  }
  checkLicensePlate(licensePlate: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/cars/license-plate/exists?licensePlate=${licensePlate}`);
  }
  getSumOfCar(): Observable<CarHomePageDto[]>{
    return this.http.get<CarHomePageDto[]>(`${this.baseUrl}/cars/sum-cars`)
  }

  getFeedbackByCarId(id: number, page: number, size: number, ratingStars: string) {
    return this.http.get<FeedbackPaginatedResponse>(`${this.getFeedbackUrl}/${id}?page=${page}&size=${size}&ratingStars=${ratingStars}`);
  }

  getAvgRatingByCarId(id: number)  {
    return this.http.get<number>(`${this.getAvgRatingUrl}/${id}`);
  }

  getRatingCount(id: number) {
    return this.http.get<CarRatingCount[]>(`${this.getRatingCountUrl}/${id}`);
  }

  updateCarStatus(id: number, status: string) {
    return this.http.patch(`${this.updateCarStatusUrl}?id=${id}&status=${status}`, null);
  }
}

interface MyCarPaginatedResponse {
  content: MyCar[];
  totalPages: number;
  totalElements: number;
}

interface FeedbackPaginatedResponse {
  content: Feedback[];
  totalPages: number;
  totalElements: number;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  empty: boolean;
  size: number;
  number: number;
}
export class CarHomePageDto{
  sumOfCars!: number;
  cityCode!: number;
  cityName!: string;
}
