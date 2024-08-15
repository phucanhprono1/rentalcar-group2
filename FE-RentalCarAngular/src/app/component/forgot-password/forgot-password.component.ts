import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {tap} from "rxjs/operators";
// @ts-ignore
import * as bootstrap from 'bootstrap'; // Import Bootstrap


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  isLoading = false;
  // showModal: boolean = false;
  emailForm!: FormGroup;
  emailError: string | null = null;


  constructor(private authService: AuthService) {
  }


  @ViewChild('resetPasswordModal') resetPasswordModal!: ElementRef;
  ngOnInit(): void {
    this.emailForm = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+[.][A-Za-z.]{2,}$')]),
    })
  }

  get email() {
    return this.emailForm.get('email');
  }
  onSubmit() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.isLoading=true;
    const email = this.emailForm.get('email')?.value;
    console.log("im outside");
    this.authService.resetPassword(email)
      .pipe(
        tap((response) => {
          console.log('Backend response:', response);
        })
      )
      .subscribe({
        next: (response) => {
          if (response && response.email) {
            this.emailError = null;
            this.isLoading=false;
            this.showModal()
          } else {
            this.emailError = "An unexpected error occurred."; // Handle cases where the response doesn't contain the expected flag
          }
        },
        error: (error: any) => {
          this.emailError = error; // Use a custom method to extract error message
          this.isLoading=false;
        }
      });
  }
  showModal() {
    const modalElement = this.resetPasswordModal.nativeElement;
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
}
