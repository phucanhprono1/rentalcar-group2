import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Feedback} from "../common/feedback";

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

}

interface FeedbackPaginatedResponse {
  content: Feedback[];
  totalPages: number;
  totalElements: number;
}
