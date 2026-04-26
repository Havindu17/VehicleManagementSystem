package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Controller;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.User;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Security.JwtUtil;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ /api/auth/login
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            User user = userService.login(body.get("username"), body.get("password"));
            user.setPassword(null);

            Long garageId = "Garage Owner".equals(user.getRole()) ? user.getId() : null;
            String token = jwtUtil.generateToken(garageId, user.getUsername(), user.getRole());

            Map<String, Object> res = new HashMap<>();
            res.put("token", token);
            res.put("id", user.getId());
            res.put("username", user.getUsername());
            res.put("email", user.getEmail());
            res.put("role", user.getRole());
            res.put("fullName", user.getFullName());
            res.put("status", user.getStatus());
            res.put("garageId", garageId);
            return ResponseEntity.ok(res);

        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ /api/auth/register
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User saved = userService.register(user);
            saved.setPassword(null);

            Long garageId = "Garage Owner".equals(saved.getRole()) ? saved.getId() : null;
            String token = jwtUtil.generateToken(garageId, saved.getUsername(), saved.getRole());

            Map<String, Object> res = new HashMap<>();
            res.put("token", token);
            res.put("id", saved.getId());
            res.put("username", saved.getUsername());
            res.put("email", saved.getEmail());
            res.put("role", saved.getRole());
            res.put("fullName", saved.getFullName());
            res.put("status", saved.getStatus());
            res.put("garageId", garageId);
            return ResponseEntity.ok(res);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ /api/auth/forgot-password
    @PostMapping("/auth/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            String token = userService.forgotPassword(body.get("email"));
            return ResponseEntity.ok(Map.of("token", token));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ /api/auth/reset-password
    @PostMapping("/auth/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            userService.resetPassword(body.get("token"), body.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ /api/garages
    @GetMapping("/garages")
    public ResponseEntity<List<User>> getAllGarages() {
        List<User> garages = userService.getAll()
                .stream()
                .filter(u -> "Garage Owner".equals(u.getRole()))
                .toList();
        garages.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(garages);
    }

    // ✅ /api/garages/{id}
    @GetMapping("/garages/{id}")
    public ResponseEntity<?> getGarageById(@PathVariable Long id) {
        try {
            User garage = userService.getById(id);
            garage.setPassword(null);
            return ResponseEntity.ok(garage);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ /api/garages/{id}/services
    @GetMapping("/garages/{id}/services")
    public ResponseEntity<?> getGarageServices(@PathVariable Long id) {
        return ResponseEntity.ok(List.of());
    }

    // ✅ /api/users — Admin Profiles page
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAll();
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(users);
    }

    // ✅ /api/admin/users/{id}/status — Approve / Block
    @PutMapping("/admin/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            userService.updateStatus(id, body.get("status"));
            return ResponseEntity.ok(Map.of("message", "Status updated to " + body.get("status")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}