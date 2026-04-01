package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    private String fullName;
    private String phone;
    private String nic;
    private String role;
    private String address;
    private String drivingLicense;

    // Garage Owner fields
    private String businessName;
    private String businessReg;
    private String garageAddress;
    private String openHours;
    private String garagePhone;

    // Forgot password
    private String resetToken;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getDrivingLicense() { return drivingLicense; }
    public void setDrivingLicense(String drivingLicense) { this.drivingLicense = drivingLicense; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getBusinessReg() { return businessReg; }
    public void setBusinessReg(String businessReg) { this.businessReg = businessReg; }
    public String getGarageAddress() { return garageAddress; }
    public void setGarageAddress(String garageAddress) { this.garageAddress = garageAddress; }
    public String getOpenHours() { return openHours; }
    public void setOpenHours(String openHours) { this.openHours = openHours; }
    public String getGaragePhone() { return garagePhone; }
    public void setGaragePhone(String garagePhone) { this.garagePhone = garagePhone; }
    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
}