package fa.training.carrental.controllers;

import fa.training.carrental.dto.FeedbackDto;
import fa.training.carrental.dto.PaginatedResponse;
import fa.training.carrental.dto.RatingCountDto;
import fa.training.carrental.dto.ViewFeedbackResponseDto;
import fa.training.carrental.dto.feedbackdto.FindFeedbackDto;
import fa.training.carrental.services.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/custom-feedback")
public class FeedbackController {
    private final FeedbackService feedbackService;
    @Autowired
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/send-feedback")
    public ResponseEntity<?> sendFeedback(@RequestBody @Valid FeedbackDto feedback, BindingResult bindingResult) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }
        FeedbackDto feedbackDto = feedbackService.sendFeedback(feedback, authentication.getName());
        if(feedbackDto.getId() == null) {
            return ResponseEntity.badRequest().body(feedbackDto.getMessage());
        }
        return ResponseEntity.ok(feedbackDto);
    }
    @GetMapping("/view-all-feedback")
    public ResponseEntity<List<FindFeedbackDto>> getHighestFeedback(){
        return ResponseEntity.ok(feedbackService.getHighestFeedback());
    }

    @GetMapping("/{carId}")
    public ResponseEntity<PaginatedResponse<ViewFeedbackResponseDto>> getFeedBackList(@PathVariable("carId") Long carId,
                                                                                      @RequestParam(defaultValue = "") Integer ratingStars,
                                                                                      @RequestParam(defaultValue = "1") int page,
                                                                                      @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page-1, size);

        Page<ViewFeedbackResponseDto> feedbackPaginated = feedbackService.viewFeedbackOfOneCar(carId, ratingStars, pageable);

        PaginatedResponse<ViewFeedbackResponseDto> response = new PaginatedResponse<>();
        response.setContent(feedbackPaginated.getContent());
        response.setTotalPages(feedbackPaginated.getTotalPages());
        response.setTotalElements(feedbackPaginated.getTotalElements());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rating/{carId}")
    public ResponseEntity<Double> getCarAvgRating(@PathVariable("carId") Long carId) {
        return ResponseEntity.ok(feedbackService.getCarAvgRating(carId));
    }

    @GetMapping("/rating/count/{carId}")
    public ResponseEntity<List<RatingCountDto>> getCarRatingCount(@PathVariable("carId") Long carId) {
        return ResponseEntity.ok(feedbackService.countRatingStar(carId));
    }
}
