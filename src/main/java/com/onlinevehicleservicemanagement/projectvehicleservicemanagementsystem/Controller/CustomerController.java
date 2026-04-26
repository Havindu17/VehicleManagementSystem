package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Controller;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.Customer;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.User;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository.UserRepository;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Security.JwtUtil;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service.CustomerService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired private CustomerService service;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Customer>> getAll(HttpServletRequest request) {
        String role = extractRole(request);
        if ("Admin".equals(role)) return ResponseEntity.ok(service.getAllCustomers());
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(service.getByGarageId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Customer> create(@RequestBody Customer customer,
                                           HttpServletRequest request) {
        String role = extractRole(request);
        if (!"Admin".equals(role)) {
            User user = getCurrentUser();
            if (user == null) return ResponseEntity.status(403).build();
            customer.setGarageId(user.getId());
        }
        return ResponseEntity.ok(service.saveCustomer(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id,
                                           @RequestBody Customer customer,
                                           HttpServletRequest request) {
        String role = extractRole(request);
        if (!"Admin".equals(role)) {
            User user = getCurrentUser();
            if (user == null) return ResponseEntity.status(403).build();
            Customer existing = service.getById(id);
            if (!user.getId().equals(existing.getGarageId()))
                return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(service.updateCustomer(id, customer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       HttpServletRequest request) {
        String role = extractRole(request);
        if (!"Admin".equals(role)) {
            User user = getCurrentUser();
            if (user == null) return ResponseEntity.status(403).build();
            Customer existing = service.getById(id);
            if (!user.getId().equals(existing.getGarageId()))
                return ResponseEntity.status(403).build();
        }
        service.deleteCustomer(id);
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