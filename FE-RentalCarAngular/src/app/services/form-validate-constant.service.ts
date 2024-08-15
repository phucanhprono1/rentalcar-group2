import {Injectable} from '@angular/core';
import {AbstractControl, FormControl, ValidationErrors, ValidatorFn} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class FormValidateConstantService {
  constructor() { }
  static notOnlyWhitespace(control: FormControl): ValidationErrors | null {
    if (control.value && typeof control.value === 'string' && control.value.trim().length === 0) {
      return { 'notOnlyWhitespace': true };
    } else {
      return null;
    }
  }
  static  fileValidator(control:FormControl): ValidationErrors|null {
      const fileName: string|null = control.value;
      console.log(fileName);
      let allowedExtensions: string [] = ['jpeg','png','jpg', 'webp', 'heic'];
      if (fileName) {
        const extension = fileName?.split('.').pop()?.toLowerCase();
        console.log("extension:" + extension);
        if (!allowedExtensions.includes(<string>extension)) {
          return { invalidExtension: true };
        }
      }
        return null;
  }
  static pickUpDateTimeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const pickUpDate = control.get('pickUpDate')?.value;
      const pickUpTime = control.get('pickUpTime')?.value;

      const pickUpDateTime = new Date(`${pickUpDate}T${pickUpTime}`);
      const currentDateTime = new Date();

      if (pickUpDateTime < currentDateTime) {
        return { 'pickUpDateTimePast': true };
      }

      return null;
    };
  }
  static dropOffDateTimeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const pickUpDate = control.get('pickUpDate')?.value;
      const pickUpTime = control.get('pickUpTime')?.value;
      const dropOffDate = control.get('dropOffDate')?.value;
      const dropOffTime = control.get('dropOffTime')?.value;

      const pickUpDateTime = new Date(`${pickUpDate}T${pickUpTime}`);
      const dropOffDateTime = new Date(`${dropOffDate}T${dropOffTime}`);

      if (dropOffDateTime < pickUpDateTime) {
        return { 'dropOffBeforePickUp': true };
      }
      return null;
    };
  }


  // static fileValidator(control:FormControl): ValidationErrors|null {
  //     const fileName: string | null = control.value;
  //     console.log("file name is " + fileName)
  //     let allowedExtensions: string [] = ['jpeg','png','jpg', 'webp', 'heic'];
  //     const extension = fileName?.split('.').pop()?.toLowerCase();
  //     if (!allowedExtensions.includes(<string>extension)) {
  //       return { invalidExtension: true };
  //     }
  //     // No need to check file size here, as it should be handled by other means
  //     return null;
  //     // Validation passed
  //   };

}

