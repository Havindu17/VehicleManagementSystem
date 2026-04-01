package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bookingCode;
    private String customer;
    private String customerPhone;
    private String vehicle;
    private String plate;
    private String service;
    private LocalDate date;
    private LocalTime time;
    private String tech;
    private String slot;
    private String status;
    private BigDecimal amount;
    private String notes;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBookingCode() { return bookingCode; }
    public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }
    public String getCustomer() { return customer; }
    public void setCustomer(String customer) { this.customer = customer; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getVehicle() { return vehicle; }
    public void setVehicle(String vehicle) { this.vehicle = vehicle; }
    public String getPlate() { return plate; }
    public void setPlate(String plate) { this.plate = plate; }
    public String getService() { return service; }
    public void setService(String service) { this.service = service; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }
    public String getTech() { return tech; }
    public void setTech(String tech) { this.tech = tech; }
    public String getSlot() { return slot; }
    public void setSlot(String slot) { this.slot = slot; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}