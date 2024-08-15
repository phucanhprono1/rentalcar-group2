import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-car-rating-star',
  templateUrl: './car-rating-star.component.html',
  styleUrls: ['./car-rating-star.component.css']
})
export class CarRatingStarComponent implements OnInit {

  @Input() rating: number | undefined | null = null;
  fullStar: number[] = [];
  halfStar: boolean = false;
  emptyStar: number[] = [];

  ngOnInit(): void {
    if (this.rating !== null && this.rating !== undefined) {
      this.fullStar = Array(Math.floor(this.rating)).fill(0);
      this.halfStar = this.rating % 1 >= 0.5;
      this.emptyStar = Array(5 - this.fullStar.length - (this.halfStar ? 1 : 0)).fill(0);
    } else {
      this.emptyStar = Array(5).fill(0);
    }
  }

}
