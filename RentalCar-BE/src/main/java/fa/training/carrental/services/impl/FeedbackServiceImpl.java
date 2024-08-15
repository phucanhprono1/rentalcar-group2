package fa.training.carrental.services.impl;

import fa.training.carrental.dto.FeedbackDto;
import fa.training.carrental.dto.RatingCountDto;
import fa.training.carrental.dto.ViewFeedbackResponseDto;
import fa.training.carrental.dto.feedbackdto.FindFeedbackDto;
import fa.training.carrental.entities.Booking;
import fa.training.carrental.entities.Feedback;
import fa.training.carrental.enums.BookingStatus;
import fa.training.carrental.mapper.FeedbackMapper;
import fa.training.carrental.repositories.BookingRepository;
import fa.training.carrental.repositories.FeedbackRepository;
import fa.training.carrental.services.CarService;
import fa.training.carrental.services.FeedbackService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackServiceImpl extends BaseServiceImpl<Feedback,Long> implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackMapper feedbackMapper;
    private final BookingRepository bookingRepository;
    private final CarService carService;

    public FeedbackServiceImpl(FeedbackRepository feedbackRepository, FeedbackMapper feedbackMapper, BookingRepository bookingRepository, CarService carService) {
        super(feedbackRepository);
        this.feedbackRepository = feedbackRepository;
        this.feedbackMapper = feedbackMapper;
        this.bookingRepository = bookingRepository;
        this.carService = carService;
    }

    @Override
    @Transactional
    public FeedbackDto sendFeedback(FeedbackDto feedbackDto, String email) {
        Optional<Booking> booking = bookingRepository.findById(feedbackDto.getBookingNo());
        if(booking.isEmpty()){
            feedbackDto.setMessage("Booking not found");
            return feedbackDto;
        }
        if(!booking.get().getCustomer().getEmail().equals(email)){
            feedbackDto.setMessage("You are not allowed to send feedback for this booking");
            return feedbackDto;
        }
        if(booking.get().getBookingStatus().equals(BookingStatus.COMPLETED)){
            Feedback feedback = feedbackMapper.toFeedback(feedbackDto);
            feedback.setBooking(bookingRepository.findById(feedbackDto.getBookingNo()).get());
            feedbackRepository.save(feedback);
            feedbackDto.setId(feedback.getId());
            feedbackDto.setMessage("Feedback sent successfully!");
            return feedbackDto;
        }
        else {
            feedbackDto.setMessage("You can only send feedback for completed booking");
            return feedbackDto;
        }

    }

    @Override
    public List<FindFeedbackDto> getHighestFeedback() {
        Pageable pageable = PageRequest.of(0, 4);
        return feedbackRepository.getHighestFeedback(pageable).getContent();
    }

    @Override
    public Page<ViewFeedbackResponseDto> viewFeedbackOfOneCar(Long carId, Integer ratingStars, Pageable pageable) {
        Page<ViewFeedbackResponseDto> feedbackPaginated = feedbackRepository.getMyCarsFeedBack(carId, ratingStars, pageable);
        feedbackPaginated.get().forEach(x -> x.setImage(carService.getCarImages(x.getId()).get(0)));
        return feedbackPaginated;
    }

    @Override
    public Double getCarAvgRating(Long carId) {
        List<Double> result = feedbackRepository.getAvgRating(carId);
        return result.isEmpty() ? null : (Math.round(result.get(0) * 2) / 2.0);
    }

    @Override
    public List<RatingCountDto> countRatingStar(Long carId) {
        List<RatingCountDto> list = feedbackRepository.countRatingStar(carId);
        long totalRating = list.stream().map(RatingCountDto::getCount).reduce(0L, Long::sum);
        list.add(new RatingCountDto(100, totalRating));
        return list;
    }

}
