package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.Vehicle;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository repository;

    public List<Vehicle> getAll() { return repository.findAll(); }

    public Vehicle save(Vehicle v) {
        Vehicle saved = repository.save(v);
        saved.setVehicleCode("V" + String.format("%03d", saved.getId()));
        return repository.save(saved);
    }

    public Vehicle update(Long id, Vehicle updated) {
        Vehicle vehicle = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found: " + id));
        vehicle.setPlate(updated.getPlate());
        vehicle.setOwner(updated.getOwner());
        vehicle.setOwnerPhone(updated.getOwnerPhone());
        vehicle.setMake(updated.getMake());
        vehicle.setModel(updated.getModel());
        vehicle.setYear(updated.getYear());
        vehicle.setColor(updated.getColor());
        vehicle.setFuel(updated.getFuel());
        vehicle.setMileage(updated.getMileage());
        vehicle.setLastService(updated.getLastService());
        vehicle.setNextService(updated.getNextService());
        vehicle.setInsuranceExp(updated.getInsuranceExp());
        vehicle.setRevenueExp(updated.getRevenueExp());
        vehicle.setEmissionExp(updated.getEmissionExp());
        vehicle.setStatus(updated.getStatus());
        return repository.save(vehicle);
    }

    public void delete(Long id) { repository.deleteById(id); }
}