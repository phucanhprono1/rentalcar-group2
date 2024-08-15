package fa.training.carrental.services;

import fa.training.carrental.dto.MyFileAttribute;
import fa.training.carrental.exception.InvalidFileTypeException;
import org.springframework.web.multipart.MultipartFile;

public interface FileGatewayService {
    MyFileAttribute uploadImageFile(MultipartFile file, String folderPath) throws InvalidFileTypeException;
}
