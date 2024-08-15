package fa.training.carrental.services.impl;

import fa.training.carrental.services.CarOwnerService;
import fa.training.carrental.services.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CarOwnerServiceImpl implements CarOwnerService {

    private final CarService carService;
    @Autowired
    public CarOwnerServiceImpl(CarService carService) {
        this.carService = carService;
    }

    @Override
    public BigDecimal calculateMonthlyIncome(Long carOwnerId, int month, int year) {
        return null;
    }
    @Override
    public List<BigDecimal> listMonthlyIncome(Long carOwnerId, int year) {
        return null;
    }

    @Override
    public List<BigDecimal> listYearlyIncome(Long carOwnerId) {
        return List.of();
    }
}
