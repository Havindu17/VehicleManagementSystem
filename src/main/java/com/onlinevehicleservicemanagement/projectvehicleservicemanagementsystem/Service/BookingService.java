package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.Booking;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository repository;

    public List<Booking> getAll() { return repository.findAll(); }

    public Booking save(Booking b) {
        Booking saved = repository.save(b);
        saved.setBookingCode("B" + String.format("%04d", saved.getId()));
        return repository.save(saved);
    }

    public Booking update(Long id, Booking updated) {
        Booking booking = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found: " + id));
        booking.setCustomer(updated.getCustomer());
        booking.setCustomerPhone(updated.getCustomerPhone());
        booking.setVehicle(updated.getVehicle());
        booking.setPlate(updated.getPlate());
        booking.setService(updated.getService());
        booking.setDate(updated.getDate());
        booking.setTime(updated.getTime());
        booking.setTech(updated.getTech());
        booking.setSlot(updated.getSlot());
        booking.setStatus(updated.getStatus());
        booking.setAmount(updated.getAmount());
        booking.setNotes(updated.getNotes());
        return repository.save(booking);
    }

    public Booking updateStatus(Long id, String status) {
        Booking existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found: " + id));
        existing.setStatus(status);
        return repository.save(existing);
    }

    public void delete(Long id) { repository.deleteById(id); }
}