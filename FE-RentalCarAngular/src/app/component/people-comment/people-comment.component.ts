import {Component, OnInit} from '@angular/core';
import {FeedBackService, FindFeedBackDto} from "../../services/feed-back.service";

@Component({
  selector: 'app-people-comment',
  templateUrl: './people-comment.component.html',
  styleUrls: ['./people-comment.component.css']
})
export class PeopleCommentComponent implements OnInit{

  feedbacks!: FindFeedBackDto[];
  constructor(private feedbackService: FeedBackService) {}
  ngOnInit(): void {
    this.getTopHighestFeedBack();
  }
  getTopHighestFeedBack(){
    this.feedbackService.getTopHighestFeedBack().subscribe(
      data=>{
      this.feedbacks = data;
    },error => {
        console.log('error'+JSON.stringify(error))
      })
  }
}
