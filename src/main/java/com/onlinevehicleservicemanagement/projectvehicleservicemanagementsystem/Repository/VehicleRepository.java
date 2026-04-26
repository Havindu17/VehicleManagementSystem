package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByGarageId(Long garageId);
}