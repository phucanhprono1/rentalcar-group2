package fa.training.carrental.mapper;

import fa.training.carrental.dto.EditProfileRequest;
import fa.training.carrental.dto.ProfileResponse;
import fa.training.carrental.entities.*;
import fa.training.carrental.repositories.CityProvinceRepository;
import fa.training.carrental.repositories.DistrictRepository;
import fa.training.carrental.repositories.WardRepository;
import org.mapstruct.*;
import org.springframework.stereotype.Component;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {CityProvinceRepository.class, DistrictRepository.class, WardRepository.class})
public interface ProfileMapper {
    @Mapping(target = "name", source = "fullName")
    @Mapping(target = "drivingLicense", ignore = true)
    @Mapping(target = "cityProvince", ignore = true)
    @Mapping(target = "district", ignore = true)
    @Mapping(target = "ward", ignore = true)
    void updateCustomerFromRequest(@MappingTarget Customer customer, EditProfileRequest request);

    @Mapping(target = "name", source = "fullName")
    @Mapping(target = "drivingLicense", ignore = true)
    @Mapping(target = "cityProvince", ignore = true)
    @Mapping(target = "district", ignore = true)
    @Mapping(target = "ward", ignore = true)
    void updateCarOwnerFromRequest(@MappingTarget CarOwner carOwner, EditProfileRequest request);

    @Mapping(target = "fullName", source = "name")
    ProfileResponse customerToEditProfileRequest(Customer customer);

    @Mapping(target = "fullName", source = "name")
    ProfileResponse carOwnerToEditProfileRequest(CarOwner carOwner);

}

