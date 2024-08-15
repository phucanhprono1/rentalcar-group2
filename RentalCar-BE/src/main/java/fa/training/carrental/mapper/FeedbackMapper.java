package fa.training.carrental.mapper;

import fa.training.carrental.dto.FeedbackDto;
import fa.training.carrental.entities.Feedback;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.springframework.stereotype.Component;


@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface FeedbackMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "booking", ignore = true)
    Feedback toFeedback(FeedbackDto feedbackDto);
}
