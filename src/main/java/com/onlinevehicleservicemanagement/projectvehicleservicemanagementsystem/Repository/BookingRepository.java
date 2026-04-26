package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByGarageId(Long garageId);
}