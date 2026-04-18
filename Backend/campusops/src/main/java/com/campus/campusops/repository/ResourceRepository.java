package com.campus.campusops.repository;

import com.campus.campusops.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(String type);
    List<Resource> findByLocation(String location);
    List<Resource> findByTypeAndLocation(String type, String location);
    List<Resource> findByStatus(String status);
}