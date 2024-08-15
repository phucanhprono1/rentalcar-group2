import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BreadcrumbService, Breadcrumb } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-home-page-car-owner',
  templateUrl: './home-page-car-owner.component.html',
  styleUrls: ['./home-page-car-owner.component.css']
})
export class HomePageCarOwnerComponent implements OnInit {
  constructor(
    private router: Router

  ) { }

  ngOnInit(): void {

  }

  navigateToAddCar() {
    this.router.navigate(['car-owner/add-car']).then(success => {
      if (success) {
        console.log('Navigation to Add a Car was successful!');
      } else {
        console.log('Navigation to Add a Car failed!');
      }
    }).catch(error => {
      console.error('Error during navigation:', error);
    });
  }
}

