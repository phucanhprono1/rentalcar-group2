package fa.training.carrental.repositories;

import fa.training.carrental.dto.RatingCountDto;
import fa.training.carrental.dto.ViewFeedbackResponseDto;
import fa.training.carrental.dto.feedbackdto.FindFeedbackDto;
import fa.training.carrental.entities.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface FeedbackRepository extends BaseRepository<Feedback,Long>{
    @Query("SELECT new fa.training.carrental.dto.feedbackdto.FindFeedbackDto(f.createdDate, f.createdBy, f.lastModifiedDate, f.content, f.ratings) " +
            "FROM Feedback f " +
            "WHERE f.content IS NOT NULL AND LTRIM(RTRIM(f.content))<> '' " +
            "ORDER BY f.ratings DESC, f.createdDate DESC")
    Page<FindFeedbackDto> getHighestFeedback(Pageable pageable);

    @Query("select new fa.training.carrental.dto.ViewFeedbackResponseDto(" +
            "c.id, c.name, f.content, f.dateTime, f.ratings, cu.name, b.startDateTime, b.endDateTime, null) " +
            "from Car c " +
            "join c.carBookings cb " +
            "join Feedback f on cb.booking.bookingNo = f.booking.bookingNo " +
            "join Customer cu on cu.email = f.createdBy " +
            "join cb.booking b " +
            "where c.id = :id " +
            "and (:ratingStars is null or f.ratings = :ratingStars)"
    )
    Page<ViewFeedbackResponseDto> getMyCarsFeedBack(@Param("id") Long carId, @Param("ratingStars") Integer ratingStars, Pageable pageable);

    @Query(value =
            "SELECT AVG(CAST(f.ratings AS DECIMAL)) AS average_rating\n" +
            "FROM car_booking cb\n" +
            "         INNER JOIN feedback f ON f.booking_id = cb.booking_id\n" +
            "WHERE cb.car_id = :id", nativeQuery = true)
    List<Double> getAvgRating(@Param("id") Long carId);

    @Query(value = "select new fa.training.carrental.dto.RatingCountDto(f.ratings, count (f.ratings)) " +
            "from CarBooking cb " +
            "inner join Feedback f on cb.booking.bookingNo = f.booking.bookingNo " +
            "where cb.car.id = :id " +
            "group by f.ratings " +
            "order by f.ratings")
    List<RatingCountDto> countRatingStar(@Param("id") Long carId);
}
