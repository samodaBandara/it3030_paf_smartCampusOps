package com.campus.campusops.repository;

import com.campus.campusops.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReportedBy(Long userId);
    List<Ticket> findByStatus(String status);
    List<Ticket> findByAssignedTo(Long userId);
}