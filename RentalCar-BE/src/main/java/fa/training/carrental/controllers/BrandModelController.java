package fa.training.carrental.controllers;

import fa.training.carrental.services.BrandModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BrandModelController {

    private final BrandModelService brandModelService;

    @GetMapping("/getBrandList")
    public ResponseEntity<List<String>> getBrandList() {
        return ResponseEntity.ok(brandModelService.getBrandList());
    }

    @GetMapping("/getModelList")
    public ResponseEntity<List<String>> getModelList(@RequestParam(value = "brand") String brand) {
        return ResponseEntity.ok(brandModelService.getModelList(brand));
    }
}
