package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Controller;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.Finance;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service.FinanceService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class FinanceController {

    @Autowired
    private FinanceService service;

    @GetMapping
    public List<Finance> getAll() {
        return service.getAll();
    }

    @PostMapping
    public ResponseEntity<Finance> create(@RequestBody Finance finance) {
        return ResponseEntity.ok(service.save(finance));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Finance> update(@PathVariable Long id, @RequestBody Finance finance) {
        return ResponseEntity.ok(service.update(id, finance));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<Finance> markPaid(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.markPaid(id, body.get("payMethod")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}