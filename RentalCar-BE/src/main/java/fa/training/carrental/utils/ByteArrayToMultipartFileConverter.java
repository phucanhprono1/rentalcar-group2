package fa.training.carrental.utils;

import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

public class ByteArrayToMultipartFileConverter {

    public MultipartFile convert(byte[] fileContent, String fileName, String contentType) {
        return new MockMultipartFile(fileName, fileName, contentType, fileContent);
    }
}