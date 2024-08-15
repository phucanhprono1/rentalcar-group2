package fa.training.carrental.mapper;

import fa.training.carrental.dto.RegisterRequestDto;
import fa.training.carrental.entities.Account;
import fa.training.carrental.entities.CarOwner;
import fa.training.carrental.entities.Customer;
import org.mapstruct.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AuthenticationMapper {
    @Mappings({
            @Mapping(target = "carOwner", expression = "java(toCarOwner(request))"),
            @Mapping(target = "customer", expression = "java(toCustomer(request))"),
            @Mapping(target = "password", source = "password", qualifiedByName = "encodePassword"),
    })
    Account toAccount(RegisterRequestDto request);
    @Named("encodePassword")
    default String encode(String password){
        return new BCryptPasswordEncoder().encode(password);
    }
    default CarOwner toCarOwner(RegisterRequestDto request) {
        if ("ROLE_CAR_OWNER".equalsIgnoreCase(request.getRole())) {
            return CarOwner.builder()
                    .name(request.getName())
                    .phoneNo(request.getPhoneNo())
                    .email(request.getEmail())
                    .wallet(BigDecimal.valueOf(0.0))
                    .build();
        }
        return null;
    }

    default Customer toCustomer(RegisterRequestDto request) {
        if ("ROLE_CUSTOMER".equalsIgnoreCase(request.getRole())) {
            return Customer.builder()
                    .name(request.getName())
                    .phoneNo(request.getPhoneNo())
                    .email(request.getEmail())
                    .wallet(BigDecimal.valueOf(0.0))
                    .build();
        }
        return null;
    }
}
