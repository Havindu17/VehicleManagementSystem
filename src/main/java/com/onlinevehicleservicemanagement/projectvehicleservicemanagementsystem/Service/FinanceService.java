package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.Finance;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository.FinanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class FinanceService {

    @Autowired
    private FinanceRepository repository;

    public List<Finance> getAll() { return repository.findAll(); }

    public Finance save(Finance inv) {
        if (inv.getSubtotal() != null) {
            BigDecimal tax = inv.getSubtotal().multiply(BigDecimal.valueOf(0.10));
            inv.setTax(tax);
            inv.setTotal(inv.getSubtotal().add(tax));
        }
        Finance saved = repository.save(inv);
        saved.setInvoiceCode("INV-" + String.format("%04d", saved.getId()));
        return repository.save(saved);
    }

    public Finance update(Long id, Finance updated) {
        Finance Finance = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found: " + id));
        Finance.setCustomer(updated.getCustomer());
        Finance.setVehicle(updated.getVehicle());
        Finance.setService(updated.getService());
        Finance.setParts(updated.getParts());
        Finance.setDate(updated.getDate());
        Finance.setDueDate(updated.getDueDate());
        Finance.setSubtotal(updated.getSubtotal());
        Finance.setTax(updated.getTax());
        Finance.setTotal(updated.getTotal());
        Finance.setPaid(updated.getPaid());
        Finance.setPayMethod(updated.getPayMethod());
        Finance.setStatus(updated.getStatus());
        Finance.setNotes(updated.getNotes());
        return repository.save(Finance);
    }

    public Finance markPaid(Long id, String payMethod) {
        Finance finance = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found: " + id));
        finance.setPaid(finance.getTotal());
        finance.setPayMethod(payMethod);
        finance.setStatus("Paid");
        return repository.save(finance);
    }

    public void delete(Long id) { repository.deleteById(id); }
}