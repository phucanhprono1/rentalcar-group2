import {Component, OnInit, ElementRef, Renderer2} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {jwtDecode} from "jwt-decode";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {RegisterAccount} from "../../common/register-account";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {FormValidateConstantService} from "../../services/form-validate-constant.service";
import * as bootstrap from "bootstrap";


interface LoginResponse { // Define an interface for the expected API response
  token: string;
  refreshToken?: string;
  role: string;
  // ... other properties if needed
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  isAuthenticated: boolean = false;
  userName: string = '';
  roles: string = '';
  authSubscription!: Subscription;
  refreshToken: string = '';

  constructor(private authService: AuthService,
              private formBuilder: FormBuilder,
              private router: Router,
              private http: HttpClient,
              private elementRef: ElementRef,
              private renderer: Renderer2) {
  }

  ngOnInit(): void {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userName = localStorage.getItem("userName");

    if (token && role && userName) {
      this.authService.setAuthenticated(true);
      this.authService.setUserName(userName);
      this.authService.setRole(role);
    } else {
      this.authService.setAuthenticated(false);
    }

    this.authSubscription = this.authService.authState$.subscribe((authState: LoginResponse|null) => {
      this.isAuthenticated = !!authState;
      if (this.isAuthenticated) {
        this.authService.userName$.subscribe((userName) => {
          this.userName = userName;
        });
        this.authService.role$.subscribe((role) => {
          this.roles = role;
        });
      }
    });
    this.loginForm = this.formBuilder.group({
      email: new FormControl("", [Validators.required,  Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+[.][A-Za-z.]{2,}$')]),
      password: new FormControl("", [Validators.required,
        Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{7,}$')
      ])

    });
    this.registerForm = this.formBuilder.group({

      nameRegister: new FormControl("", [Validators.required, FormValidateConstantService.notOnlyWhitespace]),
      emailRegister: new FormControl("", [Validators.required, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+[.][A-Za-z.]{2,}$')]),
      phoneRegister: new FormControl("", [Validators.required, Validators.pattern('^\\+\\d{11}$'), FormValidateConstantService.notOnlyWhitespace]),
      passwordRegister: new FormControl("", [Validators.required,
        Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{7,}$')
      ]),
      repassword: new FormControl("", [Validators.required, passwordMatchValidator('passwordRegister')]),
      roleRegister: new FormControl("", [Validators.required]),
      agreeTerm: new FormControl(false, [Validators.requiredTrue])
    })

    function passwordMatchValidator(passwordControlName: string): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const password = control?.parent?.get(passwordControlName)?.value;
        return control?.value !== password ? {passwordMismatch: true} : null;
      };
    }
  }

  navigateToHomePage() {
    if (this.roles === 'ROLE_CUSTOMER') {
      this.router.navigate(['/customer']);
    } else if (this.roles === 'ROLE_CAR_OWNER') {
      this.router.navigate(['/car-owner']);
    } else {
      this.router.navigate(['']);
    }
  }

  navigateToHomeAndScroll() {
    if (this.roles === 'ROLE_CUSTOMER') {
      this.router.navigate(['/customer']).then(() => {
        // Use fragment for direct scroll
        setTimeout(() => {
          const whyUsElement = document.getElementById('whyUsSection');
          if (whyUsElement) {
            whyUsElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100); // Adjust the delay if needed
      });
    }
    else if (this.roles==='ROLE_CAR_OWNER')
    {
      this.router.navigate(['/car-owner']).then(() => {
        // Use fragment for direct scroll
        setTimeout(() => {
          const yourBenefit = document.getElementById('benefit');
          if (yourBenefit) {
            yourBenefit.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100); // Adjust the delay if needed
      });
    }
  }

  logout() {
    const refreshTokenStorage = localStorage.getItem('refreshToken');
    if (refreshTokenStorage){
        this.refreshToken = refreshTokenStorage;
    }
    this.authService.logout(this.refreshToken)
      .subscribe({
        next: response => {
          // API call successful
          console.log('Logout successful:', response);
          localStorage.clear()
          sessionStorage.clear();
          // ... remove other items
          this.authService.setAuthenticated(false); // Update your auth state
          this.authService.setUserName('');
          this.authService.setRole('');
          this.authService.authStateSubject.next(null);
          this.router.navigate(['/']); // Redirect to the login page
        },
        error: error => {
          // API call failed
          console.error('Logout failed:', error);
          // Handle errors gracefully (e.g., display an error message to the user)
        }
      });
  }

  // login-signup
  storage: Storage = localStorage;
  loginErrors: { [key: string]: string } = {}; // Store validation errors per field
  generalLoginError: string | null = null;
  user: RegisterAccount | undefined;
  duplicateEmailMessage: string = '';

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.user = new RegisterAccount(
      this.registerForm.controls['nameRegister'].value,
      this.registerForm.controls['phoneRegister'].value,
      this.registerForm.controls['roleRegister'].value,
      this.registerForm.controls['emailRegister'].value,
      this.registerForm.controls['passwordRegister'].value
    );

    this.authService.register(this.user).subscribe(
      res => {
        alert('Registered Successfully, Please login!');
        this.registerForm.reset();
        this.router.navigate(['']);
      },
      err => {
        console.log("Registration failed", err);
        this.duplicateEmailMessage = err;
      }
    );
  }

  navigate(url: string) {
    this.router.navigate([url]).then(success => {
      if (success) {
        console.log('Navigation was successful!');
        window.location.reload();
      } else {
        console.log('Navigation failed!');
      }
    }).catch(error => {
      console.error('Error during navigation:', error);
    });
  }

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get emailRegister() {
    return this.registerForm.get('emailRegister');
  }

  get nameRegister() {
    return this.registerForm.get('nameRegister');
  }

  get phoneRegister() {
    return this.registerForm.get('phoneRegister');
  }

  get passwordRegister() {
    return this.registerForm.get('passwordRegister');
  }

  get repassword() {
    return this.registerForm.get('repassword');
  }

  get roleRegister() {
    return this.registerForm.get('roleRegister');
  }

  get agreeTerm() {
    return this.registerForm.get('agreeTerm');
  }

  onSubmitLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const credentials = this.loginForm.value;



    this.authService.login(credentials)
      .subscribe({
        next: (response) => {
          // Login successful
          console.log('Login successful:', response);
          this.authService.setAuthenticated(true);

          const decodedToken: any = jwtDecode(response.token);
          const name = decodedToken.name;
          this.authService.setUserName(name);
          const role = response.role;
          this.authService.setRole(role);

          // Store tokens and user info in localStorage
          localStorage.setItem("token", response.token);
          localStorage.setItem("role", role);
          localStorage.setItem("userName", name);
          localStorage.setItem("email", this.loginForm.controls['email'].value);

          // Close the modal and remove backdrop
          this.closeModalAndRemoveBackdrop();

          // Redirect based on role
          switch (response.role) {
            case 'ROLE_CAR_OWNER':
              this.router.navigate(['/car-owner']);
              break;
            case 'ROLE_CUSTOMER':
              console.log("Navigating to home page customer");
              this.router.navigate(['/customer']);
              break;
            default:
              console.log("Unknown role");
              // Handle unknown role if necessary
              break;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log("ERROR"+ error.message + error.status);
          if (error.status===404) {
            this.generalLoginError = "Either email address or password is incorrect. Please try again";
          }
          else if (error.status===0)
          {
            this.generalLoginError = "Please check your internet connection and try again"
          }
          else {
            this.generalLoginError = error.error.message;
           }
          }
      });
  }
  closeModalAndRemoveBackdrop(): void {
    const modalElements = document.querySelectorAll('.modal-backdrop');

    // Remove each modal backdrop element found
    modalElements.forEach(modalBackdrop => {
      if (modalBackdrop.parentNode) {
        modalBackdrop.parentNode.removeChild(modalBackdrop);
      }
    });

    // Optional: Remove 'show' class from the modal if needed
    const modalElement = this.elementRef.nativeElement.querySelector('#loginSignupModal');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
    }
    // Restore scrolling on the body element
    document.body.style.overflow = 'auto';
  }
  protected readonly parent = parent;

}

