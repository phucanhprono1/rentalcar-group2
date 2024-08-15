package fa.training.carrental.services.impl;

import fa.training.carrental.dto.*;
import fa.training.carrental.entities.*;
import fa.training.carrental.enums.ERole;
import fa.training.carrental.exception.InvalidFileTypeException;
import fa.training.carrental.mapper.ProfileMapper;
import fa.training.carrental.repositories.*;
import fa.training.carrental.services.EditProfileService;
import fa.training.carrental.services.FileGatewayService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.util.Optional;
import java.util.logging.Logger;

@Service
@Slf4j
public class EditProfileServiceImpl implements EditProfileService {

    private final ProfileMapper profileMapper;
    private final CustomerRepository customerRepository;
    private final CarOwnerRepository carOwnerRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileGatewayService fileGatewayService;
    private final CityProvinceRepository cityProvinceRepository;
    private final DistrictRepository districtRepository;
    private final WardRepository wardRepository;
    @Value("${file.service.view-url}")
    private String fileViewUrl;
    @Value("${file.service.download-url}")
    private String fileDownloadUrl;
    @Value("${spring.application.name}")
    private String fileUploadPath;
    Logger logger = Logger.getLogger(FileGatewayServiceImpl.class.getName());
    @Autowired
    public EditProfileServiceImpl(ProfileMapper profileMapper, CustomerRepository customerRepository, CarOwnerRepository carOwnerRepository, AccountRepository accountRepository, @Qualifier("passwordEncoder") PasswordEncoder passwordEncoder, FileGatewayService fileGatewayService, CityProvinceRepository cityProvinceRepository, DistrictRepository districtRepository, WardRepository wardRepository) {
        this.profileMapper = profileMapper;
        this.customerRepository = customerRepository;
        this.carOwnerRepository = carOwnerRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileGatewayService = fileGatewayService;
        this.cityProvinceRepository = cityProvinceRepository;
        this.districtRepository = districtRepository;
        this.wardRepository = wardRepository;
    }

    @Override
    @Transactional(rollbackOn = {Exception.class, RuntimeException.class, Error.class})
    public EditProfileResponse editProfile(EditProfileRequest request, MultipartFile file) {
        Optional<Account> accountOptional = accountRepository.findByEmail(request.getEmail());

        if (accountOptional.isEmpty()) {
            return new EditProfileResponse("Account not found");
        }

        if (request.getRole().equals(ERole.ROLE_CUSTOMER.name())) {
            Optional<Customer> customerOptional = customerRepository.findByEmail(request.getEmail());
            if (customerOptional.isEmpty()) {
                return new EditProfileResponse("Customer not found");
            }
            Customer existingCustomer = customerOptional.get();
            profileMapper.updateCustomerFromRequest(existingCustomer, request);
            // Fetch and set CityProvince, District, and Ward
            setCityProvinceDistrictWard(existingCustomer, request);

            if (file != null && !file.isEmpty()) {
                try {
                    existingCustomer.setDrivingLicense(fileGatewayService.uploadImageFile(file, fileUploadPath + "/drivingLicense/" + accountOptional.get().getId() + "/").getUrl());
                } catch (InvalidFileTypeException e) {
                    logger.info("Invalid file type: " + file.getContentType());
                }
            }
            else{
                logger.info(customerOptional.get().getDrivingLicense());
                existingCustomer.setDrivingLicense(customerOptional.get().getDrivingLicense());
            }
            customerRepository.save(existingCustomer);
            return new EditProfileResponse("Edit profile successfully");

        } else if (request.getRole().equals(ERole.ROLE_CAR_OWNER.name())) {
            Optional<CarOwner> carOwnerOptional = carOwnerRepository.findByEmail(request.getEmail());
            if (carOwnerOptional.isEmpty()) {
                return new EditProfileResponse("Car owner not found");
            }
            CarOwner existingCarOwner = carOwnerOptional.get();
            profileMapper.updateCarOwnerFromRequest(existingCarOwner, request);

            // Fetch and set CityProvince, District, and Ward
            setCityProvinceDistrictWard(existingCarOwner, request);

            if (file != null && !file.isEmpty()) {
                try {
                    existingCarOwner.setDrivingLicense(fileGatewayService.uploadImageFile(file, fileUploadPath + "/drivingLicense/" + carOwnerOptional.get().getId() + "/").getUrl());
                } catch (InvalidFileTypeException e) {
                    logger.info("Invalid file type: " + file.getContentType());
                    throw new RuntimeException(e);
                }
            }
            else {
                existingCarOwner.setDrivingLicense(carOwnerOptional.get().getDrivingLicense());
            }
            carOwnerRepository.save(existingCarOwner);
            return new EditProfileResponse("Edit profile successfully");
        }

        return new EditProfileResponse("Edit profile failed");
    }

    private void setCityProvinceDistrictWard(AbstractUser user, EditProfileRequest request) {
        if (request.getCityCode() != null) {
            user.setCityProvince(cityProvinceRepository.findById(request.getCityCode()).orElse(null));
        }
        if (request.getDistrictCode() != null) {
            user.setDistrict(districtRepository.findById(request.getDistrictCode()).orElse(null));
        }
        if (request.getWardCode() != null) {
            user.setWard(wardRepository.findById(request.getWardCode()).orElse(null));
        }
    }


    @Override
    @Transactional(rollbackOn = {Exception.class, RuntimeException.class, Error.class, Throwable.class})
    public EditProfileResponse editPassword(EditPasswordRequest password) {
        Optional<Account> accountOptional = accountRepository.findByEmail(password.getEmail());
        if (accountOptional.isEmpty()) {
            return new EditProfileResponse("Account not found");
        }
        Account existingAccount = accountOptional.get();
        existingAccount.setPassword(passwordEncoder.encode(password.getPassword()));
//        accountRepository.save(existingAccount);
        return new EditProfileResponse("Edit password successfully");
    }


    @Override
    public ProfileResponse getProfile(String username) {
        Optional<Account> accountOptional = accountRepository.findByEmail(username);
        if (accountOptional.isEmpty()) {
            return null;
        }
        Account account = accountOptional.get();
        if (account.getRole().equals(ERole.ROLE_CUSTOMER)) {
            Optional<Customer> customerOptional = customerRepository.findByEmail(username);
            if (customerOptional.isEmpty()) {
                return null;
            }
            ProfileResponse profileResponse = profileMapper.customerToEditProfileRequest(customerOptional.get());
            profileResponse.setDrivingLicenseUrl(fileViewUrl + customerOptional.get().getDrivingLicense());
            profileResponse.setDrivingLicenseFile(fileDownloadUrl + customerOptional.get().getDrivingLicense());
            if(customerOptional.get().getCityProvince() != null && customerOptional.get().getDistrict() != null && customerOptional.get().getWard() != null){
                profileResponse.setCityCode(customerOptional.get().getCityProvince().getCityCode());
                profileResponse.setDistrictCode(customerOptional.get().getDistrict().getDistrictCode());
                profileResponse.setWardCode(customerOptional.get().getWard().getWardCode());
            }
            profileResponse.setRole(ERole.ROLE_CUSTOMER.name());
            return profileResponse;
        } else{
            Optional<CarOwner> carOwnerOptional = carOwnerRepository.findByEmail(username);
            if (carOwnerOptional.isEmpty()) {
                return null;
            }
            ProfileResponse profileResponse = profileMapper.carOwnerToEditProfileRequest(carOwnerOptional.get());
            profileResponse.setDrivingLicenseUrl(fileViewUrl + carOwnerOptional.get().getDrivingLicense());
            profileResponse.setDrivingLicenseFile(fileDownloadUrl + carOwnerOptional.get().getDrivingLicense());
            if(carOwnerOptional.get().getCityProvince() != null && carOwnerOptional.get().getDistrict() != null && carOwnerOptional.get().getWard() != null){
                profileResponse.setCityCode(carOwnerOptional.get().getCityProvince().getCityCode());
                profileResponse.setDistrictCode(carOwnerOptional.get().getDistrict().getDistrictCode());
                profileResponse.setWardCode(carOwnerOptional.get().getWard().getWardCode());
            }
            profileResponse.setRole(ERole.ROLE_CAR_OWNER.name());
            return profileResponse;
        }
    }

    @Override
    public Optional<Account> getAccount(String email) {
        return accountRepository.findByEmail(email);
    }


}
