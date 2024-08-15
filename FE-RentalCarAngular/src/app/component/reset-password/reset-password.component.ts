import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, Form, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {FormValidateConstantService} from "../../services/form-validate-constant.service";
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from "../../services/auth.service";
import {HttpErrorResponse} from "@angular/common/http"; // Import ActivatedRoute
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  isLoading=false;
  passwordForm!: FormGroup;
  token!: string; // Store the token
  resetSuccess: boolean = false; // Flag for successful reset
  resetError: string | null = null; // Error message (if any)
  @ViewChild('resetPasswordModal') resetPasswordModal!: ElementRef;

  constructor(private route: ActivatedRoute, private authService: AuthService
              , private router: Router
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.token = params['token']; // Get token from URL
      // You can optionally validate the token here
    });
    this.passwordForm = new FormGroup({
      password: new FormControl("", [Validators.required,
        Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{7,}$'),
        FormValidateConstantService.notOnlyWhitespace

      ]),
      repassword: new FormControl("", [Validators.required,
        Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{7,}$'),
        FormValidateConstantService.notOnlyWhitespace])
    })
  }

  get password() {
    return this.passwordForm.get("password");
  }

  get repassword() {
    return this.passwordForm.get('repassword');
  }

  protected readonly onsubmit = onsubmit;

  onSubmit() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched(); // Mark fields as touched to trigger validation errors
      return;
    }
    this.isLoading=true;
    const newPassword = this.passwordForm.get('password')?.value;
    this.authService.updatePassword(this.token, newPassword).subscribe({
      next: (response) => {
        this.resetSuccess = true;
        this.isLoading=false;
        const modal = this.showModal();
        this.passwordForm.reset(); // Reset the form after successful submission
        setTimeout(() => {
          modal.hide(); // Hide the modal before navigation
          setTimeout(() => {
            this.router.navigate(['']);
          }, 300); // Small delay to ensure modal is hidden
        }, 3700); // Reduced from 4000 to account for the hide delay
      },
      error: (error) => {
        this.isLoading=false;
        if (error instanceof HttpErrorResponse && error.status === 400) {
          // Handle specific validation errors from the backend (if available)
          if (error.error && typeof error.error === 'object') {
            for (const field in error.error) {
              const control = this.passwordForm.get(field);
              if (control) {
                control.setErrors({serverError: error.error[field]});
              }
            }
          } else {
            this.resetError = error.error || 'Failed to reset password.';
          }
        } else {
          // Handle other types of errors (e.g., network issues)
          this.resetError = 'An unexpected error occurred.';
        }
      }
    });
  }



  showModal() {
    const modalElement = this.resetPasswordModal.nativeElement;
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    return modal;

  }
}
