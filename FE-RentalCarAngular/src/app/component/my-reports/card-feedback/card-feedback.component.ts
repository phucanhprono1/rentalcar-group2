import {Component, Input} from '@angular/core';
import {Feedback} from "../../../common/feedback";

@Component({
  selector: 'app-card-feedback',
  templateUrl: './card-feedback.component.html',
  styleUrls: ['./card-feedback.component.css']
})
export class CardFeedbackComponent {
  @Input() feedback!: Feedback;

  formatDateTime(dateString: string): string {
    // Create a Date object from the ISO date string
    const date = new Date(dateString);

    // Extract day, month, year, hours, minutes, and seconds
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Determine AM or PM
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12 || 12; // Convert to 12-hour format, treating 0 hours as 12

    // Format the date and time string
    const formattedDate = `${day}/${month}/${year} - ${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${period}`;

    return formattedDate;
  }
}
