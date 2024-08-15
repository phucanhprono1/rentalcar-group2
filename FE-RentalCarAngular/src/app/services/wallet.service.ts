import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private baseUrl = environment.baseUrl+'/payment'; // Adjust this URL based on your backend configuration

  constructor(private http: HttpClient) { }

  getWallet(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}/wallet`, { headers });
  }

  topUp(token: string, amount: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.baseUrl}/top-up?money=${amount}`, null, { headers });
  }

  withdraw(token: string, amount: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.baseUrl}/withdraw?money=${amount}`, null, { headers });
  }
  getTransactionHistory(token: string, page: number, size: number, fromDate?: string, toDate?: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}/transaction-history?fromDate=${fromDate}&toDate=${toDate}&page=${page}&size=${size}`, { headers });
  }
  getTransactionHistoryDefault(token: string, page: number, size: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}/transaction-history?&page=${page}&size=${size}`, { headers });
  }
}
