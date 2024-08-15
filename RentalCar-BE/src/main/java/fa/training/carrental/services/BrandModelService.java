package fa.training.carrental.services;

import java.util.List;

public interface BrandModelService {

    List<String> getBrandList();

    List<String> getModelList(String brand);
}
