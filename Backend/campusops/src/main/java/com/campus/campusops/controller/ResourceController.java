package com.campus.campusops.controller;

import com.campus.campusops.model.Resource;
import com.campus.campusops.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceRepository resourceRepository;

    @GetMapping
    public List<Resource> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location) {
        if (type != null && location != null)
            return resourceRepository.findByTypeAndLocation(type, location);
        if (type != null) return resourceRepository.findByType(type);
        if (location != null) return resourceRepository.findByLocation(location);
        return resourceRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getById(@PathVariable Long id) {
        return resourceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> create(@RequestBody Resource resource) {
        return ResponseEntity.ok(resourceRepository.save(resource));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> update(@PathVariable Long id, @RequestBody Resource updated) {
        return resourceRepository.findById(id).map(r -> {
            r.setName(updated.getName());
            r.setType(updated.getType());
            r.setCapacity(updated.getCapacity());
            r.setLocation(updated.getLocation());
            r.setStatus(updated.getStatus());
            return ResponseEntity.ok(resourceRepository.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        resourceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}