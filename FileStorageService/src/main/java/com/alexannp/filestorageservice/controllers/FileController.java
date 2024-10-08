package com.alexannp.filestorageservice.controllers;

import com.alexannp.filestorageservice.entities.MyFileAttribute;
import com.alexannp.filestorageservice.services.FileStorageService;
import com.alexannp.filestorageservice.utils.URLUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/files")
@Log4j2
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;
    Logger logger = Logger.getLogger(FileController.class.getName());

    @PostMapping("/upload")
    public ResponseEntity<MyFileAttribute> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam String folderPath) {
        MyFileAttribute myFileAttribute = fileStorageService.storeFile(file, folderPath);

        String fileViewUri = ServletUriComponentsBuilder.fromPath("")
                .path(folderPath + "/")
                .path(myFileAttribute.getName())
                .toUriString();
        myFileAttribute.setUrl(fileViewUri);
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(folderPath + "/")
                .path(myFileAttribute.getName())
                .toUriString();

        myFileAttribute.setCurrentUrl(fileDownloadUri);

        return ResponseEntity.ok(myFileAttribute);
    }

    @GetMapping("/download/**")
    public ResponseEntity<Resource> downloadFile(HttpServletRequest request) throws IOException {
        String requestURI = request.getRequestURI();
        String downloadPath = URLUtil.decodeURL(requestURI.substring(requestURI.indexOf("/download/") + 10));

        int lastSlashIndex = downloadPath.lastIndexOf('/');
        if (lastSlashIndex == -1) {
            throw new RuntimeException("Invalid download path: " + downloadPath);
        }

        String folderPath = downloadPath.substring(0, lastSlashIndex);
        String fileName = downloadPath.substring(lastSlashIndex + 1);

        Path filePath = fileStorageService.loadFileAsResource(folderPath, fileName);
        System.out.println("Attempting to load file from: " + filePath.toString());

        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } else {
            throw new RuntimeException("File not found " + fileName);
        }
    }

    @GetMapping("/view/**")
    public ResponseEntity<Resource> viewFile(HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        String filePath = URLUtil.decodeURL(requestURI.substring(requestURI.indexOf("/view/") + 6));

        int lastSlashIndex = filePath.lastIndexOf('/');
        if (lastSlashIndex == -1) {
            throw new RuntimeException("Invalid file path: " + filePath);
        }

        String folderPath = filePath.substring(0, lastSlashIndex);
        String fileName = filePath.substring(lastSlashIndex + 1);

        try {
            return fileStorageService.viewFile(folderPath, fileName, request);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}