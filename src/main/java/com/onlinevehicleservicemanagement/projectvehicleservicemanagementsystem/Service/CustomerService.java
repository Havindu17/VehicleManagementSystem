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

    public List<Customer> getByGarageId(Long garageId) {
        return repository.findByGarageId(garageId);
    }

    public Customer getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
    }

    public Customer saveCustomer(Customer customer) {
        Customer saved = repository.save(customer);
        saved.setCustomerCode("C" + String.format("%04d", saved.getId()));
        return repository.save(saved);
    }

    public Customer updateCustomer(Long id, Customer updated) {
        Customer customer = getById(id);
        customer.setFullName(updated.getFullName());
        customer.setEmail(updated.getEmail());
        customer.setPhone(updated.getPhone());
        customer.setNic(updated.getNic());
        customer.setAddress(updated.getAddress());
        customer.setDrivingLicense(updated.getDrivingLicense());
        customer.setRole(updated.getRole());
        customer.setStatus(updated.getStatus());
        customer.setVehicles(updated.getVehicles());
        customer.setBookings(updated.getBookings());
        customer.setJoinDate(updated.getJoinDate());
        return repository.save(customer);
    }

    public void deleteCustomer(Long id) {
        repository.deleteById(id);
    }
}