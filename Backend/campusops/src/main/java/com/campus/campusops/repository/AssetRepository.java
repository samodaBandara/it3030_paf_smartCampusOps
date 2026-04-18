package com.campus.campusops.repository;

import com.campus.campusops.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByResourceId(Long resourceId);
    void deleteByResourceId(Long resourceId);
    boolean existsByAssetCode(String assetCode);
    List<Asset> findByResourceIdAndIsTracked(Long resourceId, Boolean isTracked);
}