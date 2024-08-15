import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class FeedBackService {

  constructor(private http: HttpClient) { }
  sendFeedback(feedbackData: FeedbackDto, token: string): Observable<FeedbackDto> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<FeedbackDto>(`${environment.baseUrl}/custom-feedback/send-feedback`, feedbackData, { headers });
  }
  getTopHighestFeedBack():Observable<FindFeedBackDto[]>{
    return this.http.get<FindFeedBackDto[]>(`${environment.baseUrl}/custom-feedback/view-all-feedback`);
  }
}
export class FeedbackDto {
  ratings!: number;
  content?: string;
  bookingNo!: number;
  dateTime!: string;
  message!: string;

  constructor(ratings: number, content: string, bookingNo: number, dateTime: string) {
    this.ratings = ratings;
    this.content = content;
    this.bookingNo = bookingNo;
    this.dateTime = dateTime;
  }
}
export class FindFeedBackDto {
  createDate!: string;
  createBy!: string;
  lastModifiedDate!: string;
  content!: string;
  ratings!: number;
}
