import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormValidateConstantService } from '../../services/form-validate-constant.service';

@Component({
  selector: 'app-home-page-customer',
  templateUrl: './home-page-customer.component.html',
  styleUrls: ['./home-page-customer.component.css']
})
export class HomePageCustomerComponent implements OnInit {

  searchForm!: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      pickUpLocation: new FormControl('', [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
      pickUpDate: new FormControl('', Validators.required),
      pickUpTime: new FormControl('', Validators.required),
      dropOffDate: new FormControl('', Validators.required),
      dropOffTime: new FormControl('', Validators.required)
    },{
      validators: [FormValidateConstantService.pickUpDateTimeValidator(), FormValidateConstantService.dropOffDateTimeValidator()]
    });
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    } else {
      sessionStorage.setItem('searchFormData', JSON.stringify(this.searchForm.value));
      this.router.navigate(['customer/search-car']);
    }
  }

  get pickUpLocation() {
    return this.searchForm.get('pickUpLocation');
  }

  get pickUpDate() {
    return this.searchForm.get('pickUpDate');
  }

  get pickUpTime() {
    return this.searchForm.get('pickUpTime');
  }

  get dropOffDate() {
    return this.searchForm.get('dropOffDate');
  }

  get dropOffTime() {
    return this.searchForm.get('dropOffTime');
  }
}
