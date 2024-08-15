package fa.training.carrental.services.impl;

import fa.training.carrental.dto.*;
import fa.training.carrental.entities.*;
import fa.training.carrental.enums.CarStatus;
import fa.training.carrental.repositories.*;
import fa.training.carrental.services.CarOwnerService;
import fa.training.carrental.services.CarService;
import fa.training.carrental.utils.CarImageSorter;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service

public class CarServiceImpl implements CarService {

    private final CarRepository carRepository;
    private final CityProvinceRepository cityProvinceRepository;
    private final DistrictRepository districtRepository;
    private final WardRepository wardRepository;
    private final CarOwnerService carOwnerService;
    Logger logger = Logger.getLogger(CarServiceImpl.class.getName());

    public CarServiceImpl(CarRepository carRepository, CityProvinceRepository cityProvinceRepository, DistrictRepository districtRepository, WardRepository wardRepository, CarOwnerService carOwnerService) {
        this.carRepository = carRepository;
        this.cityProvinceRepository = cityProvinceRepository;
        this.districtRepository = districtRepository;
        this.wardRepository = wardRepository;
        this.carOwnerService = carOwnerService;
    }

    @Override
    public Car save(Car car) {
        return carRepository.save(car);
    }

    @Override
    public Page<MyCarDto> findByOwner(Long ownerId, Pageable pageable) {
        return carRepository.findByOwnerId(ownerId, pageable);
    }

    @Override
    @Transactional
    public Car updateCarStatus(Long id, CarStatus status) {
        carRepository.updateCarStatus(id, status);
        return carRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Car not found"));
    }

    @Override
    public Page<SearchCarDtoResponse> findAvailableCarsWithRatingsAndBookings(LocalDateTime startDateTime,
                                                             LocalDateTime endDateTime,
                                                             String addressPattern,
                                                             String sortBy,
                                                             Pageable pageable) {
        Page<SearchCarDtoResponse> carDTOs = carRepository.findAvailableCarsWithRatingsAndBookings(startDateTime, endDateTime, addressPattern, sortBy, pageable);
        carDTOs.forEach(carDTO -> {
            logger.info("CarDTO: " + carDTO.toString());
            // Process images if necessary
            carDTO.setImages(CarImageSorter.sortFilePaths(getCarImages(carDTO.getId())));
        });
        return carDTOs;
    }


    @Override
    public Optional<CarDetailResponseDto> findCarById(long id) {
        return carRepository.findCarById(id);
    }

    @Override
    public List<String> getCarImages(Long carId) {
        logger.info("Get car images by car id");
        logger.info(CarImageSorter.sortFilePaths(carRepository.getImageByCarId(carId)).toString());
        return CarImageSorter.sortFilePaths(carRepository.getImageByCarId(carId));
    }

    @Override
    @Transactional
    @Modifying
    public Car updateCar(Long id, CarUpdateDto carUpdateDto) {

        Optional<Car> optionalCar = carRepository.findById(id);

        if (optionalCar.isPresent()) {
            Car car = optionalCar.get();
            car.setMileage(carUpdateDto.getMileage());
            car.setFuelConsumption(carUpdateDto.getFuelConsumption());
            car.setBasePrice(carUpdateDto.getBasePrice());
            car.setDeposit(carUpdateDto.getDeposit());
            car.setAddress(carUpdateDto.getAddress());
            car.setDescription(carUpdateDto.getDescription());
            car.setAdditionalFunctions(carUpdateDto.getAdditionalFunctions());
            car.setTermsOfUse(carUpdateDto.getTermsOfUse());
            car.setCarStatus(carUpdateDto.getCarStatus());
            car.setImages(carUpdateDto.getImages());

            if (carUpdateDto.getCityProvinceId() != null) {
                CityProvince cityProvince = cityProvinceRepository.findById(carUpdateDto.getCityProvinceId()).orElse(null);
                car.setCityProvince(cityProvince);
            }

            if (carUpdateDto.getDistrictId() != null) {
                District district = districtRepository.findById(carUpdateDto.getDistrictId()).orElse(null);
                car.setDistrict(district);
            }

            if (carUpdateDto.getWardId() != null) {
                Ward ward = wardRepository.findById(carUpdateDto.getWardId()).orElse(null);
                car.setWard(ward);
            }

            return carRepository.save(car);
        } else {
            throw new RuntimeException("Car not found with id " + id);
        }
    }

    @Override
    public boolean hasBookings(Long carId) {
        Integer resultCheck = carRepository.existsByCarId(carId);
        return resultCheck == 1;
    }

    @Override
    public boolean existsByLicensePlate(String licensePlate) {
        return carRepository.existsByLicensePlate(licensePlate);
    }

    @Override
    public List<CarHomePageDto> sumOfCarByCity() {
        Pageable pageable = PageRequest.of(0,6);
        return carRepository.sumOfCarByCity(pageable).getContent();
    }
}



