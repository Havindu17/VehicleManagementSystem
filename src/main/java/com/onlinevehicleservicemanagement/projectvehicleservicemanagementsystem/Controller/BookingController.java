package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Controller;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.Booking;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService service;

    @GetMapping
    public List<Booking> getAll() {
        return service.getAll();
    }

    @PostMapping
    public ResponseEntity<Booking> create(@RequestBody Booking booking) {
        return ResponseEntity.ok(service.save(booking));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> update(@PathVariable Long id, @RequestBody Booking booking) {
        return ResponseEntity.ok(service.update(id, booking));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Booking> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.updateStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}