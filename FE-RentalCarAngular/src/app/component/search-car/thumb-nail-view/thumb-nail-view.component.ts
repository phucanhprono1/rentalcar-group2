import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { ShareDataService } from '../../../services/share-data.service';
import { SearchCarDTO } from '../../../common/search-car-dto';
import {Router} from "@angular/router";
import {CarService} from "../../../services/car.service";


@Component({
  selector: 'app-thumb-nail-view',
  templateUrl: './thumb-nail-view.component.html',
  styleUrls: ['./thumb-nail-view.component.css']
})
export class ThumbNailViewComponent implements OnInit {
  cars: SearchCarDTO[] = [];

  constructor(private sharedDataService: ShareDataService,
              private router: Router,
              private carService: CarService,
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
