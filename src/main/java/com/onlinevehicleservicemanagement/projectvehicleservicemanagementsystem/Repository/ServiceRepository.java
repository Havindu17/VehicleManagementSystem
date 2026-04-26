package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByGarageId(Long garageId);
}