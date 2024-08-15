import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { FormValidateConstantService } from "../../services/form-validate-constant.service";
import {ShareDataService} from "../../services/share-data.service";

@Component({
  selector: 'app-step-three',
  templateUrl: './step-three.component.html',
  styleUrls: ['./step-three.component.css']
})
export class StepThreeComponent implements OnInit {
  stepThreeForm!: FormGroup;
  constructor(private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.stepThreeForm = this.fb.group({
      basePrice: new FormControl("", [Validators.required, FormValidateConstantService.notOnlyWhitespace, Validators.pattern('^[0-9]+(?:\\.[0-9]+)?$')]),
      deposit: new FormControl("", [Validators.required, FormValidateConstantService.notOnlyWhitespace, Validators.pattern('^[0-9]+(?:\\.[0-9]+)?$')]),
      termOfUse: this.fb.group({
        noSmoking: new FormControl(false),
        noPet: new FormControl(false),
        noFood: new FormControl(false),
        other: new FormControl(false),
        specifyOther: new FormControl("")
      })
    });

    this.onOtherChange();


    this.stepThreeForm.get('termOfUse.other')?.valueChanges.subscribe(() => {
      this.onOtherChange();
    });
  }

  onOtherChange(): void {
    const otherControl = this.stepThreeForm.get('termOfUse.other');
    const specifyOtherControl = this.stepThreeForm.get('termOfUse.specifyOther');

    if (otherControl?.value) {
      specifyOtherControl?.setValidators([Validators.required]);
    } else {
      specifyOtherControl?.clearValidators();
    }
    specifyOtherControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.stepThreeForm.invalid) {
      this.stepThreeForm.markAllAsTouched();
      return;
    }
    if (this.stepThreeForm.valid) {
      localStorage.setItem('stepThreeFormData', JSON.stringify(this.stepThreeForm.value));
      this.router.navigate(['/car-owner/add-car/step-4']);
    } else {
      console.error('Form is not valid');
    }
  }

  navigate(url: string): void {
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

  get basePrice() {
    return this.stepThreeForm.get('basePrice');
  }

  get deposit() {
    return this.stepThreeForm.get('deposit');
  }

  get specifyOther() {
    return this.stepThreeForm.get('termOfUse.specifyOther');
  }
}
