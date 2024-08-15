import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Feedback} from "../../common/feedback";
import {CarService} from "../../services/car.service";
import {CarRatingCount} from "../../common/car-rating-count";
import {environment} from "../../../environments/environment";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-my-reports',
  templateUrl: './my-reports.component.html',
  styleUrls: ['./my-reports.component.css']
})
export class MyReportsComponent implements OnInit {
  id!: number;
  feedbacks!: Feedback[];
  page: number = 1;
  size: number = 10;
  ratingStars: string = "";
  totalPages!: number;
  totalElements!: number;
  avgRatings?: number;
  ratingCount: CarRatingCount[] = [];

  constructor(private route: ActivatedRoute,
              private carService: CarService,) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = +this.route.snapshot.params['id'];
      this.getFeedbacks();
      this.getAvgRating();
      this.getRatingCount();
    })
  }

  getFeedbacks() {
    this.carService.getFeedbackByCarId(this.id, this.page, this.size, this.ratingStars).subscribe(
      data => {
        this.feedbacks = data.content;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
        this.loadImage();
        console.log(data);
      },
      error => {
        console.error("Fetch list feedbacks has an error: " + error);
      }
    );
  }

  filterByRatingStars(ratingStars: string) {
    this.ratingStars = ratingStars;
    this.getFeedbacks();
  }

  getAvgRating() {
    this.carService.getAvgRatingByCarId(this.id).pipe(tap(value => console.log('rating',value))).subscribe(data => this.avgRatings = data);
  }

  getRatingCount() {
    this.carService.getRatingCount(this.id).subscribe(data => {
      this.ratingCount = data;
    })
  }

  loadImage() {
    this.feedbacks.forEach(feedback => {
      if(feedback.image) {
        this.viewFile(feedback.image, feedback);
      }
    })
  }

  viewFile(fileName: string, feedback: Feedback): void {
    feedback.image = `${environment.fileViewUrl}${fileName}`
  }

  displayRatingCount(rating: number): number {
    const result = this.ratingCount.find(value => value.rating === rating);
    return result ? result.count : 0;
  }

  updatePageSize(value: string) {
    this.size = +value;
    this.page = 1;
    this.ratingStars = "";
    this.getFeedbacks();
  }
}
