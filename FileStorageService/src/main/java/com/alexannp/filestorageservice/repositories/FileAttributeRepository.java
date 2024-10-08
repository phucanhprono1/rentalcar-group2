package com.alexannp.filestorageservice.repositories;

import com.alexannp.filestorageservice.entities.MyFileAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileAttributeRepository extends JpaRepository<MyFileAttribute, Integer> {
}
