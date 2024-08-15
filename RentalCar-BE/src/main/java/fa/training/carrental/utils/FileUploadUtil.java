package fa.training.carrental.utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

public class FileUploadUtil {

    public static String saveFile(String uploadDir, String originalFileName, MultipartFile multipartFile)
            throws IOException {
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate UUID
        String uuid = UUID.randomUUID().toString();

        // Extract file extension
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));

        // Construct new file name with UUID
        String newFileName = uuid + fileExtension;

        try (InputStream inputStream = multipartFile.getInputStream()) {
            Path filePath = uploadPath.resolve(newFileName);
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ioe) {
            throw new IOException("Could not save file: " + originalFileName, ioe);
        }

        return newFileName;
    }
}
