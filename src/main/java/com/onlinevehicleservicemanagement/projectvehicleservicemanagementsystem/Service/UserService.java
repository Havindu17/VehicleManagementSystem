package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.User;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ── Spring Security ────────────────────────────────────────
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }

    // ── REGISTER ───────────────────────────────────────────────
    public User register(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setJoinedAt(LocalDateTime.now());

        if (user.getStatus() == null) {
            if ("Garage Owner".equals(user.getRole())) {
                user.setStatus("Pending");
            } else {
                user.setStatus("Active");
            }
        }

        return userRepository.save(user);
    }

    public User login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        // ✅ null status — block කරන්නේ නෑ (Admin137 වගේ cases)
        String status = user.getStatus();
        if ("Pending".equals(status)) {
            throw new RuntimeException("Account pending approval. Please contact admin.");
        }
        if ("Blocked".equals(status)) {
            throw new RuntimeException("Account blocked. Please contact admin.");
        }

        return user;
    }

    // ── FORGOT PASSWORD ─────────────────────────────────────────
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        userRepository.save(user);
        return token;
    }

    // ── RESET PASSWORD ──────────────────────────────────────────
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        userRepository.save(user);
    }

    // ── GET ALL ─────────────────────────────────────────────────
    public List<User> getAll() {
        return userRepository.findAll();
    }

    // ── GET BY ID ───────────────────────────────────────────────
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    // ── FIND BY USERNAME ────────────────────────────────────────
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── UPDATE STATUS ✅ (Admin approve / block) ─────────────────
    // Valid values: "Active", "Pending", "Blocked"
    public void updateStatus(Long id, String newStatus) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        if ("Admin".equals(user.getRole())) {
            throw new RuntimeException("Cannot change Admin status");
        }

        user.setStatus(newStatus);
        userRepository.save(user);
    }

    // ── UPDATE ──────────────────────────────────────────────────
    public User update(Long id, User updated) {
        User user = getById(id);

        user.setFullName(updated.getFullName());
        user.setEmail(updated.getEmail());
        user.setPhone(updated.getPhone());
        user.setAddress(updated.getAddress());
        user.setNic(updated.getNic());
        user.setDrivingLicense(updated.getDrivingLicense());
        user.setBusinessName(updated.getBusinessName());
        user.setBusinessReg(updated.getBusinessReg());
        user.setGarageAddress(updated.getGarageAddress());
        user.setGaragePhone(updated.getGaragePhone());
        user.setOpenHours(updated.getOpenHours());

        if (updated.getStatus() != null) {
            user.setStatus(updated.getStatus());
        }

        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updated.getPassword()));
        }

        return userRepository.save(user);
    }

    // ── DELETE ───────────────────────────────────────────────────
    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}