package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Controller;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.FeedBack;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service.FeedBackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedBackController {

    @Autowired
    private FeedBackService service;

    @GetMapping
    public List<FeedBack> getAll() {
        return service.getAll();
    }

    @PostMapping
    public ResponseEntity<FeedBack> create(@RequestBody FeedBack feedback) {
        return ResponseEntity.ok(service.save(feedback));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<FeedBack> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.updateStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}