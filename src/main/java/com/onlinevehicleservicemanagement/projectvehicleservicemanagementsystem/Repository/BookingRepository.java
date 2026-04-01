package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    
}