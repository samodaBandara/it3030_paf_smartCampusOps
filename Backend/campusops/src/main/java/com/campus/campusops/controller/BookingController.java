package com.campus.campusops.controller;

import com.campus.campusops.model.Booking;
import com.campus.campusops.model.Notification;
import com.campus.campusops.repository.BookingRepository;
import com.campus.campusops.repository.NotificationRepository;
import com.campus.campusops.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Booking booking, Authentication auth) {
        String email = auth.getName();
        Long userId = userRepository.findByEmail(email).get().getId();
        booking.setUserId(userId);

        if (bookingRepository.existsConflict(booking.getResourceId(),
                booking.getStartTime(), booking.getEndTime())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Time slot not available for this resource"));
        }
        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    @GetMapping("/my")
    public List<Booking> myBookings(Authentication auth) {
        String email = auth.getName();
        Long userId = userRepository.findByEmail(email).get().getId();
        return bookingRepository.findByUserId(userId);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Booking> all(@RequestParam(required = false) String status) {
        if (status != null) return bookingRepository.findByStatus(status);
        return bookingRepository.findAll();
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        return bookingRepository.findById(id).map(b -> {
            b.setStatus("APPROVED");
            bookingRepository.save(b);
            sendNotification(b.getUserId(), "Your booking #" + id + " has been approved.", "BOOKING");
            return ResponseEntity.ok(b);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return bookingRepository.findById(id).map(b -> {
            b.setStatus("REJECTED");
            bookingRepository.save(b);
            sendNotification(b.getUserId(), "Your booking #" + id + " was rejected: " + body.get("reason"), "BOOKING");
            return ResponseEntity.ok(b);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id, Authentication auth) {
        String email = auth.getName();
        Long userId = userRepository.findByEmail(email).get().getId();
        return bookingRepository.findById(id).map(b -> {
            if (!b.getUserId().equals(userId))
                return ResponseEntity.status(403).<Booking>build();
            b.setStatus("CANCELLED");
            return ResponseEntity.ok(bookingRepository.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    private void sendNotification(Long userId, String message, String type) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        n.setType(type);
        n.setIsRead(false);
        notificationRepository.save(n);
    }
}