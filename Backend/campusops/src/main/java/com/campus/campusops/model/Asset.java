package com.campus.campusops.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Data
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "resource_id")
    private Long resourceId;

    private String name;
    private Integer quantity;
    private String condition;

    @Column(name = "asset_code")
    private String assetCode;

    @Column(name = "is_tracked")
    private Boolean isTracked = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (condition == null) condition = "GOOD";
        if (quantity == null) quantity = 1;
        if (isTracked == null) isTracked = false;
    }
}