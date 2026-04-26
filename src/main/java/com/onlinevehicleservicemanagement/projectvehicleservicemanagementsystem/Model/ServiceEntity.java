package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "services")
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long garageId;  // ← ADD

    private String serviceCode;
    private String name;
    private String category;
    private String description;
    private BigDecimal price;
    private String vehicleType;
    private String vehicle;
    private String duration;
    private String warranty;
    private Integer count = 0;
    private String priority;
    private String status;
    private LocalDate assignedDate;
    private String techNotes;
    private String selectedBrand;
    private String selectedSize;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "service_assigned_vehicles", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "plate")
    private List<String> assignedVehicles = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "service_names", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "service_name")
    private List<String> names = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGarageId() { return garageId; }          // ← ADD
    public void setGarageId(Long garageId) { this.garageId = garageId; }  // ← ADD

    public String getServiceCode() { return serviceCode; }
    public void setServiceCode(String serviceCode) { this.serviceCode = serviceCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getVehicle() { return vehicle; }
    public void setVehicle(String vehicle) { this.vehicle = vehicle; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getWarranty() { return warranty; }
    public void setWarranty(String warranty) { this.warranty = warranty; }
    public Integer getCount() { return count; }
    public void setCount(Integer count) { this.count = count; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; }
    public String getTechNotes() { return techNotes; }
    public void setTechNotes(String techNotes) { this.techNotes = techNotes; }
    public String getSelectedBrand() { return selectedBrand; }
    public void setSelectedBrand(String selectedBrand) { this.selectedBrand = selectedBrand; }
    public String getSelectedSize() { return selectedSize; }
    public void setSelectedSize(String selectedSize) { this.selectedSize = selectedSize; }
    public List<String> getAssignedVehicles() { return assignedVehicles; }
    public void setAssignedVehicles(List<String> assignedVehicles) { this.assignedVehicles = assignedVehicles != null ? assignedVehicles : new ArrayList<>(); }
    public List<String> getNames() { return names; }
    public void setNames(List<String> names) { this.names = names != null ? names : new ArrayList<>(); }
}