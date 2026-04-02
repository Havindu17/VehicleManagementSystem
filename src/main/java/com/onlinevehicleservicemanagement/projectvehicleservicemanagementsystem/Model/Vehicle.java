package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vehicleCode;
    private String plate;
    private String owner;
    private String ownerPhone;
    private String make;
    private String model;
    private Integer year;
    private String color;
    private String fuel;
    private String mileage;
    private LocalDate lastService;
    private LocalDate nextService;
    private LocalDate insuranceExp;
    private LocalDate revenueExp;
    private LocalDate emissionExp;
    private String status;

    @ElementCollection
    @CollectionTable(name = "vehicle_history",
            joinColumns = @JoinColumn(name = "vehicle_id"))
    @Column(name = "history_entry")
    private List<String> history = new ArrayList<>();

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVehicleCode() { return vehicleCode; }
    public void setVehicleCode(String vehicleCode) { this.vehicleCode = vehicleCode; }
    public String getPlate() { return plate; }
    public void setPlate(String plate) { this.plate = plate; }
    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }
    public String getOwnerPhone() { return ownerPhone; }
    public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }
    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getFuel() { return fuel; }
    public void setFuel(String fuel) { this.fuel = fuel; }
    public String getMileage() { return mileage; }
    public void setMileage(String mileage) { this.mileage = mileage; }
    public LocalDate getLastService() { return lastService; }
    public void setLastService(LocalDate lastService) { this.lastService = lastService; }
    public LocalDate getNextService() { return nextService; }
    public void setNextService(LocalDate nextService) { this.nextService = nextService; }
    public LocalDate getInsuranceExp() { return insuranceExp; }
    public void setInsuranceExp(LocalDate insuranceExp) { this.insuranceExp = insuranceExp; }
    public LocalDate getRevenueExp() { return revenueExp; }
    public void setRevenueExp(LocalDate revenueExp) { this.revenueExp = revenueExp; }
    public LocalDate getEmissionExp() { return emissionExp; }
    public void setEmissionExp(LocalDate emissionExp) { this.emissionExp = emissionExp; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<String> getHistory() { return history; }
    public void setHistory(List<String> history) { this.history = history; }
}