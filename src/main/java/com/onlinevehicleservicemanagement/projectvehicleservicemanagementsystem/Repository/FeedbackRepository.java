package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.FeedBack;

import org.springframework.data.jpa.repository.JpaRepository;
public interface FeedbackRepository extends JpaRepository<FeedBack, Long> {}