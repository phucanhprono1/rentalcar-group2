import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import {BreadcrumbService} from "../../services/breadcrumb.service";

@Component({
  selector: 'app-add-a-car',
  templateUrl: './add-a-car.component.html',
  styleUrls: ['./add-a-car.component.css']
})
export class AddACarComponent implements OnInit {
  steps: string[] = ['Step 1: Basic', 'Step 2: Detail', 'Step 3: Pricing', 'Step 4: Finish'];
  currentStep: number = 0;

  constructor(private router: Router,
              private breadCrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.updateCurrentStep();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateCurrentStep();
      }
    });
  }

  updateCurrentStep() {
    const url = this.router.url;
    if (url.includes('step-1')) {
      this.currentStep = 0;
    } else if (url.includes('step-2')) {
      this.currentStep = 1;
    } else if (url.includes('step-3')) {
      this.currentStep = 2;
    } else if (url.includes('step-4')) {
      this.currentStep = 3;
    }
  }

}
