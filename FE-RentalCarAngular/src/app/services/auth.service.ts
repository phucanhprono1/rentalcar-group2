import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {catchError, map, tap} from "rxjs/operators";
import {environment} from "../../environments/environment";
import {RegisterAccount} from "../common/register-account";
import {JwtHelperService} from '@auth0/angular-jwt';
import {jwtDecode} from "jwt-decode";

interface LoginResponse {
  token: string;
  refreshToken: string;
  role: string;
  // ... other properties if needed
}

interface LoginRequest { // Define an interface for login request payload
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authStateSubject = new BehaviorSubject<LoginResponse | null>(null);
  authState$ = this.authStateSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private email = new BehaviorSubject<string>('');
  email$ = this.email.asObservable();

  private userNameSubject = new BehaviorSubject<string>('');
  userName$ = this.userNameSubject.asObservable();

  private roleSubject = new BehaviorSubject<string>('');
  role$ = this.roleSubject.asObservable();
  private jwtHelper = new JwtHelperService();
  private tokenExpirationTimer: any;


  constructor(private http: HttpClient) {
    this.initializeAuthState();
  }

  private initializeAuthState() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userName = localStorage.getItem('userName');
    const email: any = localStorage.getItem('email');
    this.email.next(email);

    if (token && !this.jwtHelper.isTokenExpired(token) && role && userName) {
      this.setAuthenticated(true);
      this.setUserName(userName);
      this.setRole(role);
      this.authStateSubject.next({token, refreshToken: '', role});
    }
  }

  private baseUrl = environment.baseUrl;


  setAuthenticated(isAuthenticated: boolean): void {
    if (isAuthenticated) {
      this.isAuthenticatedSubject.next(isAuthenticated); // Emit the login response when authenticated
    } else {
      this.isAuthenticatedSubject.next(!isAuthenticated); // Emit null when not authenticated
    }  }


  setUserName(userName: string): void {
    this.userNameSubject.next(userName);
  }

  setRole(role: string): void {
    this.roleSubject.next(role);
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.baseUrl + '/auth/authenticate', credentials).pipe(
      tap((response: LoginResponse) => {
        this.authStateSubject.next(response);
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        const decodedPayload: any = jwtDecode(response.token);
        const userName = decodedPayload.userName;
        const role = decodedPayload.role;
        this.setUserName(userName);
        this.setRole(role);
        this.setAuthenticated(true);
        localStorage.setItem('userName', userName);
        localStorage.setItem('role', role);
        this.setTokenExpirationTimer(response.token);
      }),
    );
  }
  resetPassword(email: string): Observable<any> {
    const params = new HttpParams().set('email', email); // Create HttpParams object with email
    return this.http.post<any>(
      `${environment.baseUrl}/auth/reset-password-request`,
      null, // No request body needed since using query parameters
      {params: params} // Pass HttpParams in the options
    )
  }


  register(user: RegisterAccount): Observable<any> {
    const url = this.baseUrl + '/auth/register';
    return this.http.post(url, user).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred during registration.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error.email || errorMessage;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  private handleLoginError(error: HttpErrorResponse) {
    if (error.status === 401) {
      return throwError(() => 'Either email address or password is incorrect. Please try again');
    } else if (error.error instanceof ErrorEvent) {
      return throwError(() => `Error: ${error.error.message} 345`);
    } else {
      return throwError(() => `${error.error.email} dfs` || `Error Code: ${error.status}\nMessage: ${error.message} 345`);
    }
  }



  handleNewPasswordError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while resetting your password.';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 400) { // Validation error
        errorMessage = 'Invalid data provided for password reset.';
      } else if (error.status === 404) { // Token not found
        errorMessage = 'Invalid or expired reset token.';
      } // ... handle other error codes as needed
    }
    return throwError(() => new Error(errorMessage));
  }

  // logout() {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("role");
  //   localStorage.removeItem("userName");
  //   localStorage.removeItem("email");
  //   localStorage.removeItem("stepOneFormData");
  //   localStorage.removeItem("stepTwoFormData");
  //   localStorage.removeItem("stepThreeFormData");
  //   this.setAuthenticated(false);
  //   this.setUserName('');
  //   this.setRole('');
  //   this.authStateSubject.next(null);
  // }


  logout(refreshToken: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = JSON.stringify({ refreshToken: refreshToken });
    return this.http.post<any>(`${this.baseUrl}/auth/logout`, body, { headers }).pipe(
      tap(() => this.clearAuthData()),
      catchError(error => {
        console.error('Logout error:', error);
        this.clearAuthData();
        return throwError(error);
      })
    );
  }

  private clearAuthData() {
    localStorage.clear();
    this.setAuthenticated(false);
    this.setUserName('');
    this.setRole('');
    this.authStateSubject.next(null);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
  }

  private setAuthState(token: string) {
    localStorage.setItem('token', token);
    this.setTokenExpirationTimer(token);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token != null && !this.jwtHelper.isTokenExpired(token);
  }
  getAccessToken(): string {
    return localStorage.getItem('token') || '';
  }

  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    return this.jwtHelper.isTokenExpired(token);
  }

  setAccessToken(token: string): void {
    localStorage.setItem('token', token);
  }


  private setTokenExpirationTimer(token: string) {
    const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
    if (expirationDate) {
      const timeout = expirationDate.getTime() - Date.now() - 60000; // Refresh 1 minute before expiration
      if (this.tokenExpirationTimer) {
        clearTimeout(this.tokenExpirationTimer);
      }
      this.tokenExpirationTimer = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }
  }

  initializeAuth(): void {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    if (token && refreshToken) {
      if (this.jwtHelper.isTokenExpired(token)) {
        // Token is expired, attempt to refresh
        this.refreshToken().subscribe(
          () => {
            // Token refreshed successfully
            this.setAuthenticated(true);
          },
          (error) => {
            // Refresh failed, log out the user
            console.error('Token refresh failed:', error);
            this.logout(refreshToken);
          }
        );
      } else {
        // Token is still valid
        this.setAuthenticated(true);
        this.setTokenExpirationTimer(token);
      }
    } else {
      // No tokens found, user is not authenticated
      this.setAuthenticated(false);
    }
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError('No refresh token available');
    }
    return this.http.post<any>(`${environment.baseUrl}/auth/refresh`, { refreshToken }).pipe(
      map(response => {
        this.setAuthState(response.token);
        localStorage.setItem('refreshToken', response.refreshToken); // Update refresh token if new one is provided
        return response.token;
      }),
      catchError(error => {
        console.error('Error refreshing token:', error);
        this.clearAuthData();
        return throwError(error);
      })
    );
  }




  updatePassword(token: string, newPassword: string): Observable<any> { // Change Observable type if you expect specific data
    const body = {newPassword, token};

    return this.http.post<any>(`${environment.baseUrl}/auth/reset-password-confirm`, body)
      .pipe(
        map((response: any) => {
          console.log('Password updated successfully!', response);
          return response;
        }), // Extract the body from the response and log it here
        catchError((error) => {
          console.error('Password update failed:', error);
          return throwError('Password update failed. Please try again later.'); // More informative error handling
        })
      );
  }
}
