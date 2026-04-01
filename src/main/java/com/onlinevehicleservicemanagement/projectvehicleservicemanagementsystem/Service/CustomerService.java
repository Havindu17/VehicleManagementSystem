package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.Customer;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository repository;

    public List<Customer> getAllCustomers() {
        return repository.findAll();
    }

    public Customer saveCustomer(Customer customer) {
        return repository.save(customer);
    }

    public Customer updateCustomer(Long id, Customer updated) {
        Customer customer = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
        customer.setFullName(updated.getFullName());
        customer.setEmail(updated.getEmail());
        customer.setPhone(updated.getPhone());
        customer.setNic(updated.getNic());
        customer.setAddress(updated.getAddress());
        customer.setDrivingLicense(updated.getDrivingLicense());
        customer.setRole(updated.getRole());
        customer.setStatus(updated.getStatus());
        customer.setJoinDate(updated.getJoinDate());
        return repository.save(customer);
    }

    public void deleteCustomer(Long id) {
        repository.deleteById(id);
    }
}