package fa.training.carrental.controllers;

import fa.training.carrental.dto.FileUploadResponse;
import fa.training.carrental.utils.FileUploadUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
public class FileUploadController {

    @Value("${fileStorage}")
    private String fileStoragePath;

    @PostMapping("/uploadFile")
    public ResponseEntity<FileUploadResponse> uploadFile(
            @RequestParam("file") MultipartFile multipartFile) throws IOException {
        String originalFileName = multipartFile.getOriginalFilename();
        long size = multipartFile.getSize();

        // Save the file using the utility method and get the new file name
        String newFileName = FileUploadUtil.saveFile(fileStoragePath, originalFileName, multipartFile);

        // Prepare the response
        FileUploadResponse response = new FileUploadResponse();
        response.setFileName(newFileName);
        response.setSize(size);
        response.setUrl(Paths.get(fileStoragePath).resolve(newFileName).toString());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @GetMapping("/viewFile/{fileName:.+}")
    public ResponseEntity<Resource> viewFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(fileStoragePath).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                // Try to determine the file's content type
                String contentType;
                try {
                    contentType = Files.probeContentType(filePath);
                } catch (IOException ex) {
                    contentType = "application/octet-stream"; // Default to binary stream
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}
