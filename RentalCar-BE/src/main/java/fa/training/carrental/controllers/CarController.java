package fa.training.carrental.controllers;

import fa.training.carrental.dto.*;
import fa.training.carrental.entities.Car;
import fa.training.carrental.entities.CarOwner;
import fa.training.carrental.enums.BookingStatus;
import fa.training.carrental.enums.CarStatus;
import fa.training.carrental.mapper.CarMapper;
import fa.training.carrental.repositories.*;
import fa.training.carrental.services.CarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.parameters.P;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarMapper carMapper;
    private final CarService carService;
    private final CarOwnerRepository carOwnerRepository;
    private final BrandModelRepository brandModelRepository;
    private final ColorRepository colorRepository;
    private final CityProvinceRepository cityProvinceRepository;
    private final DistrictRepository districtRepository;
    private final WardRepository wardRepository;
    private final BookingRepository bookingRepository;

    @PostMapping("/save")
    @PreAuthorize("hasRole('CAR_OWNER')")
    public ResponseEntity<?> createCar(@RequestBody @Valid CarRequestDto dto,
                                         BindingResult bindingResult,
                                         Authentication authentication) {
        if (bindingResult.hasErrors()) {

            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }
        String email = authentication.getName();

        CarOwner owner = carOwnerRepository.findByEmail(email).orElseThrow(() ->
                new UsernameNotFoundException("Can not find owner has email: " + email));
        Car car = carMapper.convertToEntity(dto);

        car.setDeposit(dto.getDeposit());
        car.setCityProvince(cityProvinceRepository.findById(dto.getCityProvince()).orElseThrow(() ->
                new RuntimeException("City Province code not found")));
        car.setDistrict(districtRepository.findById(dto.getDistrict()).orElseThrow(() ->
                new RuntimeException("District code not found")));
        car.setWard(wardRepository.findById(dto.getWard()).orElseThrow(() ->
                new RuntimeException("Ward code not found")));

        car.setOwner(owner);
        car.setBrandModel(brandModelRepository.findByBrandAndModel(dto.getBrand(), dto.getModel()).orElseThrow(() ->
                new UsernameNotFoundException("Can not find brand and model: " + dto.getBrand() + " " + dto.getModel())));
        car.setColor(colorRepository.findByColor(dto.getColor()).orElseThrow(() ->
                new UsernameNotFoundException("Can not find color: " + dto.getColor())));

        return ResponseEntity.ok(carService.save(car));
    }
    @PreAuthorize("hasRole('CAR_OWNER')")
    @GetMapping("/view-my-cars")
    public ResponseEntity<PaginatedResponse<MyCarDto>> GetMyCarList(Authentication authentication,
                                                                    @RequestParam(defaultValue = "1") int page,
                                                                    @RequestParam(defaultValue = "10") int size,
                                                                    @RequestParam(defaultValue = "") String sortPrice,
                                                                    @RequestParam(defaultValue = "") String sortModifiedDate) {
        String email = authentication.getName();

        CarOwner owner = carOwnerRepository.findByEmail(email).orElseThrow(()
                -> new UsernameNotFoundException("Can not find owner has email: " + email));

        // mặc định tiêu chí lastModifiedDate (newest -> oldest)
        Sort sort = Sort.by("lastModifiedDate").descending();

        if (!sortModifiedDate.isEmpty()) {
            sort = sortModifiedDate.equals("asc") ? Sort.by("lastModifiedDate").ascending() : Sort.by("lastModifiedDate").descending();
        }

        if (!sortPrice.isEmpty()) {
            sort = sortPrice.equals("asc") ? Sort.by("basePrice").ascending() : Sort.by("basePrice").descending();
        }

        Pageable pageable = PageRequest.of(page - 1, size, sort);
        Page<MyCarDto> carPaginated = carService.findByOwner(owner.getId(), pageable);

        PaginatedResponse<MyCarDto> response = new PaginatedResponse<>();
        carPaginated.getContent().forEach(e -> {
            e.setIsPendingDeposit(bookingRepository.isPending(e.getId(), Enum.valueOf(BookingStatus.class, "PENDING_DEPOSIT")) == 1);
            e.setIsPendingPayment(bookingRepository.isPending(e.getId(), Enum.valueOf(BookingStatus.class, "PENDING_PAYMENT")) == 1);
        });
        response.setContent(carPaginated.getContent());
        response.setTotalPages(carPaginated.getTotalPages());
        response.setTotalElements(carPaginated.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/updateStatus")
    public ResponseEntity<Car> updateCarStatus(@RequestParam(value = "id") Long id, @RequestParam() String status) {
        Car updatedCar = carService.updateCarStatus(id, Enum.valueOf(CarStatus.class, status));
        return ResponseEntity.ok(updatedCar);
    }

    @GetMapping("/available")
    public ResponseEntity<Page<SearchCarDtoResponse>>  findAvailableCarsWithRatingsAndBookings(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate,
            @RequestParam String address,
            @RequestParam(required = false) String sortBy,
            Pageable pageable) {
        return ResponseEntity.ok(carService.findAvailableCarsWithRatingsAndBookings(startDate, endDate, address, sortBy, pageable));
    }

    @GetMapping("/{id}/images")
    public List<String> getCarImages(@PathVariable Long id) {
        return carService.getCarImages(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarDetailResponseDto> findCarById(@PathVariable Long id) {
        Optional<CarDetailResponseDto> optionalDto = carService.findCarById(id);
        if (optionalDto.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        CarDetailResponseDto dto = optionalDto.get();
        dto.setIsPendingDeposit(bookingRepository.isPending(dto.getId(), Enum.valueOf(BookingStatus.class, "PENDING_DEPOSIT")) == 1);
        dto.setIsPendingPayment(bookingRepository.isPending(dto.getId(), Enum.valueOf(BookingStatus.class, "PENDING_PAYMENT")) == 1);

        return ResponseEntity.ok(dto);
    }
    @PreAuthorize("hasRole('CAR_OWNER')")
    @PutMapping("/{id}")
    public ResponseEntity<Car> updateCar(@PathVariable Long id, @RequestBody CarUpdateDto carUpdateDto) {
        Car updatedCar = carService.updateCar(id, carUpdateDto);
        return ResponseEntity.ok(updatedCar);
    }

    @GetMapping("/has-bookings")
    public ResponseEntity<Boolean> hasBookings(@RequestParam Long carId) {
        boolean hasBookings = carService.hasBookings(carId);
        return ResponseEntity.ok(hasBookings);
    }

    @GetMapping("/license-plate/exists")
    public boolean checkLicensePlateExists(@RequestParam String licensePlate) {
        return carService.existsByLicensePlate(licensePlate);
    }

    @GetMapping("/sum-cars")
    public ResponseEntity<List<CarHomePageDto>> getSumOfCars(){
        return ResponseEntity.ok(carService.sumOfCarByCity());
    }
}
