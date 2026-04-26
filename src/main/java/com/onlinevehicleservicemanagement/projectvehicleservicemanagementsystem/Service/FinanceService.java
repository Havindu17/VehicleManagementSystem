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

    public List<Finance> getAll() {
        return repository.findAll();
    }

    public List<Finance> getByGarageId(Long garageId) {
        return repository.findByGarageId(garageId);
    }

    public Finance getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
    }

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
        Finance finance = getById(id);
        finance.setCustomer(updated.getCustomer());
        finance.setVehicle(updated.getVehicle());
        finance.setService(updated.getService());
        finance.setParts(updated.getParts());
        finance.setDate(updated.getDate());
        finance.setDueDate(updated.getDueDate());
        finance.setSubtotal(updated.getSubtotal());
        finance.setTax(updated.getTax());
        finance.setTotal(updated.getTotal());
        finance.setPaid(updated.getPaid());
        finance.setPayMethod(updated.getPayMethod());
        finance.setStatus(updated.getStatus());
        finance.setNotes(updated.getNotes());
        return repository.save(finance);
    }

    public Finance markPaid(Long id, String payMethod) {
        Finance finance = getById(id);
        finance.setPaid(finance.getTotal());
        finance.setPayMethod(payMethod);
        finance.setStatus("Paid");
        return repository.save(finance);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}