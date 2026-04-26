package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.FeedBack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedBack, Long> {
    List<FeedBack> findByGarageId(Long garageId);
}