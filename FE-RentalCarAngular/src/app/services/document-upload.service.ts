import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class DocumentUploadService {
  private uploadUrl = environment.fileUploadUrl;
  private viewUrl='http://localhost:8081/viewFile';

  private files: File[] = [];

  constructor(private http: HttpClient) {

  }

  uploadDocument(file: File, token: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(this.uploadUrl, formData, { headers });
  }
  uploadFile(file: File, folderPath: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('folderPath', folderPath);

    return this.http.post<any>(`${this.uploadUrl}`, formData);
  }
  viewFile(fileName: string): Observable<Blob> {
    return this.http.get(`${this.viewUrl}/${fileName}`, { responseType: 'blob' });
  }

  setFiles(files: File[]): void {
    this.files = files;
  }

  getFiles(): File[] {
    return this.files;
  }

}
