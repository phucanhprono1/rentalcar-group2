import { Injectable } from '@angular/core';
import {SearchCarDTO} from "../common/search-car-dto";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {
  private carsSubject = new BehaviorSubject<SearchCarDTO[]>([]);
  cars$ = this.carsSubject.asObservable();

  constructor() { }

  setCars(cars: SearchCarDTO[]) {
    this.carsSubject.next(cars);
  }

  getCars(): SearchCarDTO[] {
    return this.carsSubject.value;
  }

  private carIdSource = new BehaviorSubject<number | null>(null);
  currentCarId$ = this.carIdSource.asObservable();

  setCarId(carId: number) {
    this.carIdSource.next(carId);
  }

  private filesSubject = new BehaviorSubject<File[]>([]);
  files$ = this.filesSubject.asObservable();

  addFile(file: File) {
    const currentFiles = this.filesSubject.getValue();
    this.filesSubject.next([...currentFiles, file]);
  }
}
