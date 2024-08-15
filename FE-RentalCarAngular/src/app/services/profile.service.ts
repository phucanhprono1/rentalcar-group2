import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../environments/environment";
import { CityProvince } from "../common/city-province";
import { District } from "../common/district";
import { Ward } from "../common/ward";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private token = this.getToken();
  private profileUrl = `${environment.baseUrl}/edit-profile/get-profile`;
  private updateProfileUrl = `${environment.baseUrl}/edit-profile/edit-info`;
  private baseUrl = environment.baseUrl;
  private getCityUrl = `${environment.baseUrl}/cityProvince`;
  private getDistrictUrl = `${environment.baseUrl}/district`;
  private getWardUrl = `${environment.baseUrl}/ward`;
  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getProfile(token: string | null): Observable<any> {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<any>(this.profileUrl, { headers });
  }

  updateProfile(token:string | null, profileData: any, file: File | null): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('request', new Blob([JSON.stringify(profileData)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });

    return this.http.put<any>(this.updateProfileUrl, formData, { headers });
  }
  changePassword(token: string | null, passwordData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.put<any>(this.baseUrl + '/edit-profile/edit-password', passwordData, { headers });
  }

  private extractCodeFromUrl(url: string): number {
    const parts = url.split('/');
    return parseInt(parts[parts.length - 1], 10);
  }
}
