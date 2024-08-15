package fa.training.carrental.dto.feedbackdto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FindFeedbackDto {
    private LocalDateTime createDate;
    private String createBy;
    private LocalDateTime lastModifiedDate;
    private String content;
    private Integer ratings;
}
