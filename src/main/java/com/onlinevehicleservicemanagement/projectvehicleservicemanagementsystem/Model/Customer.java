package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerCode;
    private String fullName;
    private String email;
    private String phone;
    private String nic;
    private String address;
    private String drivingLicense;
    private String role;
    private String status;
    private Integer vehicles = 0;
    private Integer bookings = 0;
    private LocalDate joinDate;

    // ── Getters & Setters ──────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getDrivingLicense() { return drivingLicense; }
    public void setDrivingLicense(String drivingLicense) { this.drivingLicense = drivingLicense; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getVehicles() { return vehicles; }
    public void setVehicles(Integer vehicles) { this.vehicles = vehicles; }

    public Integer getBookings() { return bookings; }
    public void setBookings(Integer bookings) { this.bookings = bookings; }

    public LocalDate getJoinDate() { return joinDate; }
    public void setJoinDate(LocalDate joinDate) { this.joinDate = joinDate; }
}