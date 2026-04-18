package com.campus.campusops.repository;

import com.campus.campusops.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByResourceId(Long resourceId);
    List<Booking> findByStatus(String status);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.resourceId = :resourceId " +
           "AND b.status = 'APPROVED' " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    boolean existsConflict(@Param("resourceId") Long resourceId,
                           @Param("startTime") LocalDateTime startTime,
                           @Param("endTime") LocalDateTime endTime);
}