package com.agriculture.advisor.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.agriculture.advisor.entity.CropRecommendation;
import com.agriculture.advisor.service.CropService;

@CrossOrigin
@RestController
@RequestMapping("/crop")
public class CropController {

    @Autowired
    private CropService service;

    @PostMapping("/recommend")
    public CropRecommendation recommendCrop(
            @RequestBody CropRecommendation crop,
            @RequestHeader(value = "email", required = false) String emailHeader,
            @RequestParam(value = "email", required = false) String emailParam) {

        String email = emailHeader != null && !emailHeader.trim().isEmpty() ? emailHeader : emailParam;
        if (email == null || email.trim().isEmpty()) {
            email = crop.getFarmerEmail();
        }
        return service.recommend(crop, email);
    }

    @GetMapping("/all")
    public List<CropRecommendation> getAll(
            @RequestHeader(value = "email", required = false) String emailHeader,
            @RequestParam(value = "email", required = false) String emailParam) {

        String email = emailHeader != null && !emailHeader.trim().isEmpty() ? emailHeader : emailParam;
        return service.getRecommendationsByEmail(email);
    }
    @GetMapping("/{id}")
    public CropRecommendation getCropById(@PathVariable Long id) {
        return service.getCropById(id);
    }
    @DeleteMapping("/{id}")
    public String deleteCrop(@PathVariable Long id) {
        return service.deleteCrop(id);
    }
    @PutMapping("/{id}")
    public CropRecommendation updateCrop(
            @PathVariable Long id,
            @RequestBody CropRecommendation crop) {

        return service.updateCrop(id, crop);
    }
}