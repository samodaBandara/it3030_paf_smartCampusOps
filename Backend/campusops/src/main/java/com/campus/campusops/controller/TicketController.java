package com.campus.campusops.controller;

import com.campus.campusops.model.Asset;
import com.campus.campusops.model.Notification;
import com.campus.campusops.model.Ticket;
import com.campus.campusops.repository.AssetRepository;
import com.campus.campusops.repository.NotificationRepository;
import com.campus.campusops.repository.TicketRepository;
import com.campus.campusops.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketRepository ticketRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final AssetRepository assetRepository;

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping
    public ResponseEntity<?> create(
            @RequestParam("description") String description,
            @RequestParam("priority") String priority,
            @RequestParam(value = "resourceId", required = false) Long resourceId,
            @RequestParam(value = "assetId", required = false) Long assetId,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            Authentication auth) throws IOException {

        Long userId = userRepository.findByEmail(auth.getName()).get().getId();

        Ticket ticket = new Ticket();
        ticket.setReportedBy(userId);
        ticket.setDescription(description);
        ticket.setPriority(priority);
        ticket.setResourceId(resourceId);
        ticket.setAssetId(assetId);
        ticketRepository.save(ticket);

        // auto set asset condition to UNDER_REPAIR when ticket opened
        if (assetId != null) {
            assetRepository.findById(assetId).ifPresent(a -> {
                a.setCondition("UNDER_REPAIR");
                assetRepository.save(a);
            });
        }

        if (files != null) {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) dir.mkdirs();
            int count = 0;
            for (MultipartFile file : files) {
                if (count >= 3) break;
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                file.transferTo(new File(UPLOAD_DIR + filename));
                count++;
            }
        }
        return ResponseEntity.ok(ticket);
    }

    @GetMapping
    public List<Ticket> getAll(@RequestParam(required = false) String status, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isStaff = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));
        if (isAdmin || isStaff) {
            if (status != null) return ticketRepository.findByStatus(status);
            return ticketRepository.findAll();
        }
        Long userId = userRepository.findByEmail(auth.getName()).get().getId();
        return ticketRepository.findByReportedBy(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getById(@PathVariable Long id) {
        return ticketRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody Map<String, String> body) {
        return ticketRepository.findById(id).map(t -> {
            String newStatus = body.get("status");
            t.setStatus(newStatus);
            if (newStatus.equals("CLOSED") || newStatus.equals("RESOLVED")) {
                t.setClosedAt(LocalDateTime.now());
            }
            ticketRepository.save(t);

            // auto update asset condition based on ticket status
            if (t.getAssetId() != null) {
                assetRepository.findById(t.getAssetId()).ifPresent(a -> {
                    switch (newStatus) {
                        case "IN_PROGRESS" -> a.setCondition("UNDER_REPAIR");
                        case "RESOLVED", "CLOSED" -> a.setCondition("GOOD");
                        case "REJECTED" -> {} // no change
                    }
                    assetRepository.save(a);
                });
            }

            Notification n = new Notification();
            n.setUserId(t.getReportedBy());
            n.setMessage("Your ticket #" + id + " status changed to " + newStatus);
            n.setType("TICKET");
            n.setIsRead(false);
            notificationRepository.save(n);
            return ResponseEntity.ok(t);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assign(@PathVariable Long id,
                                    @RequestBody Map<String, Long> body) {
        return ticketRepository.findById(id).map(t -> {
            t.setAssignedTo(body.get("userId"));
            t.setStatus("IN_PROGRESS");
            if (t.getAssetId() != null) {
                assetRepository.findById(t.getAssetId()).ifPresent(a -> {
                    a.setCondition("UNDER_REPAIR");
                    assetRepository.save(a);
                });
            }
            return ResponseEntity.ok(ticketRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }
}