package fa.training.carrental.services;

import fa.training.carrental.dto.FeedbackDto;
import fa.training.carrental.dto.RatingCountDto;
import fa.training.carrental.dto.ViewFeedbackResponseDto;
import fa.training.carrental.dto.feedbackdto.FindFeedbackDto;
import fa.training.carrental.entities.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FeedbackService extends BaseService<Feedback,Long> {
    FeedbackDto sendFeedback(FeedbackDto feedbackDto,String email);

    Page<ViewFeedbackResponseDto> viewFeedbackOfOneCar(Long carId, Integer ratingStars, Pageable pageable);

    Double getCarAvgRating(Long carId);

    List<RatingCountDto> countRatingStar(Long carId);

    List<FindFeedbackDto> getHighestFeedback();
}
