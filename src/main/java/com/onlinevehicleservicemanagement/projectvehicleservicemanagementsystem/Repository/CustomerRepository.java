package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository;


import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}