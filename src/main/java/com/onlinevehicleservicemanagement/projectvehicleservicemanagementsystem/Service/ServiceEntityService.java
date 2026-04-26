package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.ServiceEntity;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ServiceEntityService {

    @Autowired
    private ServiceRepository repository;

    public List<ServiceEntity> getAll() {
        return repository.findAll();
    }

    public List<ServiceEntity> getByGarageId(Long garageId) {
        return repository.findByGarageId(garageId);
    }

    public ServiceEntity getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found: " + id));
    }

    public ServiceEntity save(ServiceEntity s) {
        ServiceEntity saved = repository.save(s);
        saved.setServiceCode("S" + String.format("%03d", saved.getId()));
        return repository.save(saved);
    }

    public ServiceEntity update(Long id, ServiceEntity updated) {
        ServiceEntity existing = getById(id);
        existing.setName(updated.getName());
        existing.setCategory(updated.getCategory());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setVehicleType(updated.getVehicleType());
        existing.setVehicle(updated.getVehicle());
        existing.setDuration(updated.getDuration());
        existing.setWarranty(updated.getWarranty());
        existing.setCount(updated.getCount());
        existing.setPriority(updated.getPriority());
        existing.setStatus(updated.getStatus());
        existing.setAssignedDate(updated.getAssignedDate());
        existing.setTechNotes(updated.getTechNotes());
        existing.setSelectedBrand(updated.getSelectedBrand());
        existing.setSelectedSize(updated.getSelectedSize());
        existing.setAssignedVehicles(updated.getAssignedVehicles());
        existing.setNames(updated.getNames());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}