package fa.training.carrental.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyFileAttribute {
    private String name;
    private String url;
    private String type;
    private long size;
}
