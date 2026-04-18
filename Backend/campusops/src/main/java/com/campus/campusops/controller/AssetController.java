package com.campus.campusops.controller;

import com.campus.campusops.model.Asset;
import com.campus.campusops.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/resources/{resourceId}/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetRepository assetRepository;

    @GetMapping
    public List<Asset> getAll(@PathVariable Long resourceId) {
        return assetRepository.findByResourceId(resourceId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@PathVariable Long resourceId, @RequestBody Asset asset) {
        // validate asset code uniqueness for tracked assets
        if (Boolean.TRUE.equals(asset.getIsTracked()) && asset.getAssetCode() != null) {
            if (assetRepository.existsByAssetCode(asset.getAssetCode())) {
                return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", "Asset code " + asset.getAssetCode() + " already exists")
                );
            }
        }
        asset.setResourceId(resourceId);
        return ResponseEntity.ok(assetRepository.save(asset));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long resourceId,
                                    @PathVariable Long id,
                                    @RequestBody Asset updated) {
        return assetRepository.findById(id).map(a -> {
            a.setName(updated.getName());
            a.setQuantity(updated.getQuantity());
            a.setCondition(updated.getCondition());
            a.setAssetCode(updated.getAssetCode());
            a.setIsTracked(updated.getIsTracked());
            return ResponseEntity.ok(assetRepository.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        assetRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}