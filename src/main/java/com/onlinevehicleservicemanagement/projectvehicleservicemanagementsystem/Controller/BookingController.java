package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Controller;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.Booking;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.User;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository.UserRepository;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Security.JwtUtil;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService service;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository; // ✅ DB approach

    // ── GET ALL ───────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Booking>> getAll(HttpServletRequest request) {
        String role = extractRole(request);

        System.out.println("=== GET ALL BOOKINGS === Role: " + role);

        if ("Admin".equals(role)) {
            return ResponseEntity.ok(service.getAll()); // ✅ Admin — ඔක්කොම
        }

        // ✅ Garage Owner — DB එකෙන් garageId ගන්නවා
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(403).build();

        System.out.println("=== Garage Owner garageId: " + user.getId());
        return ResponseEntity.ok(service.getByGarageId(user.getId()));
    }

    // ── GET BY ID ─────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getById(@PathVariable Long id,
                                           HttpServletRequest request) {
        String role = extractRole(request);
        Booking booking = service.getById(id);

        if ("Admin".equals(role)) {
            return ResponseEntity.ok(booking);
        }

        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(403).build();

        // ✅ ඔවුන්ගේ booking නොවේ නම් 403
        if (booking.getGarageId() == null || !user.getId().equals(booking.getGarageId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(booking);
    }

    // ── CREATE ────────────────────────────────────
    @PostMapping
    public ResponseEntity<Booking> create(@RequestBody Booking booking,
                                          HttpServletRequest request) {
        String role = extractRole(request);

        System.out.println("=== CREATE BOOKING === Role: " + role);

        if (!"Admin".equals(role)) {
            // ✅ Token වෙනුවට DB එකෙන් garageId — 100% reliable
            User user = getCurrentUser();
            if (user == null) return ResponseEntity.status(403).build();

            System.out.println("=== Setting garageId: " + user.getId());
            booking.setGarageId(user.getId());
        }

        Booking saved = service.save(booking);
        System.out.println("=== Saved garageId: " + saved.getGarageId());
        return ResponseEntity.ok(saved);
    }

    // ── UPDATE ────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<Booking> update(@PathVariable Long id,
                                          @RequestBody Booking booking,
                                          HttpServletRequest request) {
        String role = extractRole(request);

        if (!"Admin".equals(role)) {
            User user = getCurrentUser();
            if (user == null) return ResponseEntity.status(403).build();

            Booking existing = service.getById(id);
            if (existing.getGarageId() == null || !user.getId().equals(existing.getGarageId())) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(service.update(id, booking));
    }

    // ── UPDATE STATUS ─────────────────────────────
    @PatchMapping("/{id}/status")
    public ResponseEntity<Booking> updateStatus(@PathVariable Long id,
                                                @RequestBody Map<String, String> body,
                                                HttpServletRequest request) {
        String role = extractRole(request);

        if (!"Admin".equals(role)) {
            User user = getCurrentUser();
            if (user == null) return ResponseEntity.status(403).build();

            Booking existing = service.getById(id);
            if (existing.getGarageId() == null || !user.getId().equals(existing.getGarageId())) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(service.updateStatus(id, body.get("status")));
    }

    // ── DELETE ────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       HttpServletRequest request) {
        String role = extractRole(request);

        if (!"Admin".equals(role)) {
            User user = getCurrentUser();
            if (user == null) return ResponseEntity.status(403).build();

            Booking existing = service.getById(id);
            if (existing.getGarageId() == null || !user.getId().equals(existing.getGarageId())) {
                return ResponseEntity.status(403).build();
            }
        }
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── DB එකෙන් current user ගන්නවා ────────────
    private User getCurrentUser() {
        try {
            String username = SecurityContextHolder.getContext()
                    .getAuthentication()
                    .getName();
            System.out.println("=== Current username: " + username);
            return userRepository.findByUsername(username).orElse(null);
        } catch (Exception e) {
            System.out.println("=== getCurrentUser error: " + e.getMessage());
            return null;
        }
    }

    // ── Token Helpers (role check only) ──────────
    private String extractRole(HttpServletRequest request) {
        String token = getToken(request);
        if (token == null) return null;
        return jwtUtil.extractRole(token);
    }

    private String getToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}