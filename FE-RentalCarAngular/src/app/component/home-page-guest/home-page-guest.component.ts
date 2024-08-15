import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-home-page-guest',
  templateUrl: './home-page-guest.component.html',
  styleUrls: ['./home-page-guest.component.css']
})
export class HomePageGuestComponent implements OnInit{
  constructor(private router: Router) {
  }
  ngOnInit(): void {

    const role = localStorage.getItem('role');
    if(role==='ROLE_CUSTOMER'){
      this.router.navigate(['/customer'])
    }else if(role==='ROLE_CAR_OWNER'){
      this.router.navigate(['/car-owner'])
    }

  }


}
