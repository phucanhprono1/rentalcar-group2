package fa.training.carrental.services.impl;

import fa.training.carrental.dto.MyFileAttribute;
import fa.training.carrental.exception.InvalidFileTypeException;
import fa.training.carrental.services.FileGatewayService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.logging.Logger;

@Service
@Slf4j
public class FileGatewayServiceImpl implements FileGatewayService {
    @Value("${file.service.view-url}")
    private String fileViewUrl;
    @Value("${file.service.download-url}")
    private String fileDownloadUrl;
    @Value("${file.service.upload-url}")
    private String fileUploadUrl;

    private final RestTemplate restTemplate;
    Logger logger = Logger.getLogger(FileGatewayServiceImpl.class.getName());

    public FileGatewayServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public MyFileAttribute uploadImageFile(MultipartFile file, String folderPath) throws InvalidFileTypeException {
        // Kiểm tra loại file
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            logger.info("Invalid file type: " + contentType);
            throw new InvalidFileTypeException("Only image files are allowed.");
        }

        Resource resource = file.getResource();
        // Upload file using RestTemplate
        try {
            System.out.println("Upload URL: " + fileUploadUrl);
            System.out.println("File: " + file.getOriginalFilename());
            System.out.println("Folder path: " + folderPath);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", resource);
            body.add("folderPath", folderPath);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<MyFileAttribute> response = restTemplate.exchange(
                    fileUploadUrl,
                    HttpMethod.POST,
                    requestEntity,
                    MyFileAttribute.class);

            if(response.getStatusCode() == HttpStatus.OK){
                System.out.println("File uploaded successfully");
                System.out.println("File URL: " + response.getBody());
                return response.getBody();
            } else {
                System.out.println("File upload failed");
                throw new RuntimeException("File upload failed");
            }
        } catch (Exception e) {
            System.out.println("Exception during file upload: " + e.getMessage());
            throw new RuntimeException("File upload failed", e);
        }
    }
}
