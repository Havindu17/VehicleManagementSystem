package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Service;

import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Model.FeedBack;
import com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class FeedBackService {

    @Autowired
    private FeedbackRepository repository;

    public List<FeedBack> getAll() {
        return repository.findAll();
    }

    public List<FeedBack> getByGarageId(Long garageId) {
        return repository.findByGarageId(garageId);
    }

    public FeedBack getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found: " + id));
    }

    public FeedBack save(FeedBack f) {
        if (f.getDate() == null) f.setDate(LocalDate.now());
        if (f.getStatus() == null) f.setStatus("Pending");
        FeedBack saved = repository.save(f);
        saved.setFeedbackCode("FB-" + String.format("%03d", saved.getId()));
        return repository.save(saved);
    }

    public FeedBack updateStatus(Long id, String status) {
        FeedBack existing = getById(id);
        existing.setStatus(status);
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}