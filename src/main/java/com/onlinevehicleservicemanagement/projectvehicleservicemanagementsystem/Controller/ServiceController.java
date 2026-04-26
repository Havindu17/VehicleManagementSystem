package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Controller;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.ServiceEntity;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.User;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository.UserRepository;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Security.JwtUtil;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service.ServiceEntityService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    @Autowired private ServiceEntityService service;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ServiceEntity>> getAll(HttpServletRequest request) {
        String role = extractRole(request);
        if ("Admin".equals(role)) return ResponseEntity.ok(service.getAll());
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(service.getByGarageId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<ServiceEntity> create(@RequestBody ServiceEntity s,
                                                HttpServletRequest request) {
        String role = extractRole(request);
        if (!"Admin".equals(role)) {
            User user = getCurrentUser();
            if (user == null) return ResponseEntity.status(403).build();
            s.setGarageId(user.getId());
        }
        return ResponseEntity.ok(service.save(s));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceEntity> update(@PathVariable Long id,
                                                @RequestBody ServiceEntity s,
                                                HttpServletRequest request) {
        String role = extractRole(request);
        if (!"Admin".equals(role)) {
            User user = getCurrentUser();
            if (user == null) return ResponseEntity.status(403).build();
            ServiceEntity existing = service.getById(id);
            if (!user.getId().equals(existing.getGarageId()))
                return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(service.update(id, s));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       HttpServletRequest request) {
        String role = extractRole(request);
        if (!"Admin".equals(role)) {
            User user = getCurrentUser();
            if (user == null) return ResponseEntity.status(403).build();
            ServiceEntity existing = service.getById(id);
            if (!user.getId().equals(existing.getGarageId()))
                return ResponseEntity.status(403).build();
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