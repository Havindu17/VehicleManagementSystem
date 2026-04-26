package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "feedBack")
public class FeedBack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long garageId;  // ← ADD

    private String feedbackCode;
    private String customer;
    private String garage;
    private String service;
    private Integer rating;
    private String comment;
    private LocalDate date;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGarageId() { return garageId; }          // ← ADD
    public void setGarageId(Long garageId) { this.garageId = garageId; }  // ← ADD

    public String getFeedbackCode() { return feedbackCode; }
    public void setFeedbackCode(String feedbackCode) { this.feedbackCode = feedbackCode; }
    public String getCustomer() { return customer; }
    public void setCustomer(String customer) { this.customer = customer; }
    public String getGarage() { return garage; }
    public void setGarage(String garage) { this.garage = garage; }
    public String getService() { return service; }
    public void setService(String service) { this.service = service; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}