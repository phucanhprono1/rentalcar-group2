package fa.training.carrental.mapper;

import fa.training.carrental.dto.CarRequestDto;
import fa.training.carrental.entities.Car;
import fa.training.carrental.repositories.CarRepository;
import org.mapstruct.*;
import org.springframework.stereotype.Component;

@Component
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CarMapper {
    
    @Mapping(target = "brandModel", ignore = true)
    @Mapping(target = "color", ignore = true)
    @Mapping(target = "cityProvince", ignore = true)
    @Mapping(target = "district", ignore = true)
    @Mapping(target = "ward", ignore = true)
    Car convertToEntity(CarRequestDto carRequestDto);
    @AfterMapping
    default void setCityProvince(@MappingTarget Car car, CarRequestDto carRequestDto, @Context CarRepository carRepository) {
        car.setCityProvince(carRepository.findById(Long.valueOf(carRequestDto.getCityProvince())).get().getCityProvince());
    }

    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "model", ignore = true)
    @Mapping(target = "color", ignore = true)
    @Mapping(target = "cityProvince", ignore = true)
    @Mapping(target = "district", ignore = true)
    @Mapping(target = "ward", ignore = true)
    CarRequestDto convertToDto(Car car);
}
