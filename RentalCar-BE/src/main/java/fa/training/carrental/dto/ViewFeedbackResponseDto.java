package fa.training.carrental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ViewFeedbackResponseDto {

    private Long id;

    private String carName;

    private String content;

    private LocalDateTime dateTime;

    private Integer ratings;

    private String customer;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String image;

}
