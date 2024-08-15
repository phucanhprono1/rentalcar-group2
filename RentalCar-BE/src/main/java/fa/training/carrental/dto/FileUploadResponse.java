package fa.training.carrental.dto;

import lombok.Data;

@Data
public class FileUploadResponse {
    private String fileName;
    private String url;
    private long size;
}
