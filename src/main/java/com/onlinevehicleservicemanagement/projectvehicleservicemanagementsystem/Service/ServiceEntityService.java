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

    public List<ServiceEntity> getAll() { return repository.findAll(); }

    public ServiceEntity save(ServiceEntity s) {
        ServiceEntity saved = repository.save(s);
        saved.setServiceCode("S" + String.format("%03d", saved.getId()));
        return repository.save(saved);
    }

    public ServiceEntity update(Long id, ServiceEntity updated) {
        ServiceEntity serviceEntity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found: " + id));
        serviceEntity.setName(updated.getName());
        serviceEntity.setCategory(updated.getCategory());
        serviceEntity.setDescription(updated.getDescription());
        serviceEntity.setPrice(updated.getPrice());
        serviceEntity.setVehicleType(updated.getVehicleType());
        serviceEntity.setVehicle(updated.getVehicle());
        serviceEntity.setDuration(updated.getDuration());
        serviceEntity.setWarranty(updated.getWarranty());
        serviceEntity.setCount(updated.getCount());
        serviceEntity.setPriority(updated.getPriority());
        serviceEntity.setStatus(updated.getStatus());
        serviceEntity.setAssignedDate(updated.getAssignedDate());
        serviceEntity.setTechNotes(updated.getTechNotes());
        return repository.save(serviceEntity);
    }

    public void delete(Long id) { repository.deleteById(id); }
}