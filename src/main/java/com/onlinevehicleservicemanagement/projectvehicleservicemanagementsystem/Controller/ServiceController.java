package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Controller;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.ServiceEntity;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service.ServiceEntityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    @Autowired
    private ServiceEntityService service;

    @GetMapping
    public List<ServiceEntity> getAll() {
        return service.getAll();
    }

    @PostMapping
    public ResponseEntity<ServiceEntity> create(@RequestBody ServiceEntity s) {
        return ResponseEntity.ok(service.save(s));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceEntity> update(@PathVariable Long id, @RequestBody ServiceEntity s) {
        return ResponseEntity.ok(service.update(id, s));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}