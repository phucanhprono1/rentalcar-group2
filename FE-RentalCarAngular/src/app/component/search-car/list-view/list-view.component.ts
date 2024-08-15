import {Component, Input, OnInit,ChangeDetectorRef} from '@angular/core';
import {SearchCarDTO} from "../../../common/search-car-dto";
import {ShareDataService} from "../../../services/share-data.service";
import {CarService} from "../../../services/car.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.css']
})
export class ListViewComponent implements OnInit {
  cars: SearchCarDTO[] = [];

  constructor(private sharedDataService: ShareDataService,
              private carService: CarService,
              private router: Router,
              private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.sharedDataService.cars$.subscribe(cars => {
      this.cars = cars;
      this.cd.detectChanges();
    });
  }


  getId(carId: number) {
    this.carService.getCarData(carId).subscribe(
      () => {
        sessionStorage.setItem('selectedCarId', carId.toString());
        this.sharedDataService.setCarId(carId); // Set carId in service
        this.router.navigate(['/customer/rent-a-car/booking-info']);
      });
  }
}
