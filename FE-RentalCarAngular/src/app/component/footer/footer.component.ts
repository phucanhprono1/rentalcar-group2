import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {BookingCarService} from "../../services/booking-car.service";
import {ViewportScroller} from "@angular/common";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy{
  role:string='';
  private roleSub: Subscription | undefined;


  constructor(private viewportScroller: ViewportScroller,private router: Router, private authService: AuthService, private bookingCarService: BookingCarService) {
  }
  ngOnInit(): void {
    this.roleSub = this.authService.role$.subscribe(role => {
      this.role = role;
    });
    const roleStorage = localStorage.getItem('role');
    console.log("Is roleStorage null?: ", roleStorage === null);
    if (roleStorage) {
      this.role = roleStorage;
      console.log("ROLE " + this.role);
    } else {
      console.log("Role not found in session storage");
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.viewportScroller.scrollToPosition([0, 0]); // Scroll to top
      }
    });

  }

  ngOnDestroy() {
    if (this.roleSub) {
      this.roleSub.unsubscribe();
    }
  }

  navigate(url: string) {
    this.router.navigate([url]).then(success => {
      if (success) {
        console.log('Navigation was successful!');
      } else {
        console.log('Navigation failed!');
      }
    }).catch(error => {
      console.error('Error during navigation:', error);
    });
  }

  navigateToHomeAndScroll() {
    if (this.role === 'ROLE_CUSTOMER') {
      this.router.navigate(['/customer']).then(() => {
        // Use fragment for direct scroll
        setTimeout(() => {
          const whyUsElement = document.getElementById('top');
          if (whyUsElement) {
            whyUsElement.scrollIntoView({behavior: 'smooth'});
          }
        }, 100); // Adjust the delay if needed
      });
    }
  }
}
