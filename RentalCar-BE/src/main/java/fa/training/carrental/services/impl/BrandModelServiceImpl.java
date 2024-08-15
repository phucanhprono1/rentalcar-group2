package fa.training.carrental.services.impl;

import fa.training.carrental.repositories.BrandModelRepository;
import fa.training.carrental.services.BrandModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandModelServiceImpl implements BrandModelService {

    private final BrandModelRepository brandModelRepository;

    @Override
    public List<String> getBrandList() {
        return brandModelRepository.getBrandList();
    }

    @Override
    public List<String> getModelList(String brand) {
        return brandModelRepository.getModelList(brand);
    }
}
