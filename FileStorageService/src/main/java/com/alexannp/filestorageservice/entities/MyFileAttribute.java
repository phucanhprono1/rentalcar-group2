package com.alexannp.filestorageservice.entities;

import jakarta.persistence.*;
import lombok.*;

@Table(name = "tbl_file")
@Data
@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class MyFileAttribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String url;
    private String currentUrl;
    private String type;
    private long size;
}
