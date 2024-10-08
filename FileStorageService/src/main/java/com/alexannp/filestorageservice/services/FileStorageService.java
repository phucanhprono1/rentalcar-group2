package com.alexannp.filestorageservice.services;

import com.alexannp.filestorageservice.entities.MyFileAttribute;
import com.alexannp.filestorageservice.repositories.FileAttributeRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@Slf4j
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    private final Path fileStorageLocation;
    private final FileAttributeRepository fileAttributeRepository;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir, FileAttributeRepository fileAttributeRepository) {
        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath().normalize();
        this.fileAttributeRepository = fileAttributeRepository;
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Transactional(rollbackOn = Exception.class)
    public MyFileAttribute storeFile(MultipartFile file, String folderPath) {
        String fileName = file.getOriginalFilename();
        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            // Combine base storage location with the dynamic folder path
            Path targetFolder = this.fileStorageLocation.resolve(folderPath).normalize();
            // Create directories if they do not exist
            Files.createDirectories(targetFolder);

            Path targetLocation = targetFolder.resolve(fileName);

            // Log the file path
            logger.info("Storing file at location: {}", targetLocation.toString());

            // Copy file to the target location
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Save file metadata to the database
            MyFileAttribute fileAttribute = new MyFileAttribute();
            fileAttribute.setName(fileName);
            fileAttribute.setUrl(targetLocation.toUri().toString());
            fileAttribute.setType(file.getContentType());
            fileAttribute.setSize(file.getSize());
            fileAttributeRepository.save(fileAttribute);

            return fileAttribute;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public Path loadFileAsResource(String folderPath, String fileName) {
        Path fileLocation = this.fileStorageLocation.resolve(folderPath).resolve(fileName).normalize();
        if (!Files.exists(fileLocation)) {
            throw new RuntimeException("File not found: " + fileName);
        }

        // Log the file path
        logger.info("Loading file from location: {}", fileLocation.toString());

        return fileLocation;
    }

    public ResponseEntity<Resource> viewFile(String folderPath, String fileName, HttpServletRequest request) throws MalformedURLException {
        Path filePath = loadFileAsResource(folderPath, fileName);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File not found: " + fileName);
        }

        // Log the file path
        logger.info("Viewing file from location: {}", filePath.toString());

        // Determine the content type
        String contentType = request.getServletContext().getMimeType(filePath.toString());
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}