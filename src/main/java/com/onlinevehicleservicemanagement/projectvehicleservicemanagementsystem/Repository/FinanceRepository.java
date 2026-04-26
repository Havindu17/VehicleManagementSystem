package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.Finance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FinanceRepository extends JpaRepository<Finance, Long> {
    List<Finance> findByGarageId(Long garageId);
}