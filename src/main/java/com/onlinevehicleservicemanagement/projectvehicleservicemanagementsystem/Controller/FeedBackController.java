package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Controller;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.FeedBack;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.User;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository.UserRepository;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Security.JwtUtil;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service.FeedBackService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedBackController {

    @Autowired private FeedBackService service;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<FeedBack>> getAll(HttpServletRequest request) {
        String role = extractRole(request);
        if ("Admin".equals(role)) return ResponseEntity.ok(service.getAll());
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(service.getByGarageId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<FeedBack> create(@RequestBody FeedBack feedback,
                                           HttpServletRequest request) {
        String role = extractRole(request);
        if (!"Admin".equals(role)) {
            User user = getCurrentUser();
            if (user == null) return ResponseEntity.status(403).build();
            feedback.setGarageId(user.getId());
        }
        return ResponseEntity.ok(service.save(feedback));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<FeedBack> updateStatus(@PathVariable Long id,
                                                 @RequestBody Map<String, String> body,
                                                 HttpServletRequest request) {
        String role = extractRole(request);
        if (!"Admin".equals(role)) {
            User user = getCurrentUser();
            if (user == null) return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(service.updateStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       HttpServletRequest request) {
        String role = extractRole(request);
        if (!"Admin".equals(role)) {
            User user = getCurrentUser();
            if (user == null) return ResponseEntity.status(403).build();
        }
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            return userRepository.findByUsername(username).orElse(null);
        } catch (Exception e) { return null; }
    }

    private String extractRole(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer "))
            return jwtUtil.extractRole(header.substring(7));
        return null;
    }
}