package com.agriculture.advisor.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.agriculture.advisor.entity.CropRecommendation;
import com.agriculture.advisor.repository.CropRepository;

@Service
public class CropService {

    @Autowired
    private CropRepository repo;

    public CropRecommendation recommend(CropRecommendation crop) {
        return recommend(crop, null);
    }

    public CropRecommendation recommend(CropRecommendation crop, String email) {

        String recommendedCrop;
        String fertilizer;

        if(crop.getSoilType().equalsIgnoreCase("Black")
                && crop.getSeason().equalsIgnoreCase("Kharif")) {

            recommendedCrop = "Cotton";
            fertilizer = "Urea";
        }

        else if(crop.getSoilType().equalsIgnoreCase("Black")
                && crop.getSeason().equalsIgnoreCase("Rabi")) {

            recommendedCrop = "Wheat";
            fertilizer = "DAP";
        }

        else if(crop.getSoilType().equalsIgnoreCase("Red")
                && crop.getSeason().equalsIgnoreCase("Kharif")) {

            recommendedCrop = "Groundnut";
            fertilizer = "Potash";
        }

        else if(crop.getSoilType().equalsIgnoreCase("Alluvial")) {

            recommendedCrop = "Rice";
            fertilizer = "NPK";
        }

        else {

            recommendedCrop = "Maize";
            fertilizer = "Urea";
        }

        crop.setRecommendedCrop(recommendedCrop);
        crop.setRecommendedFertilizer(fertilizer);

        if (email != null && !email.trim().isEmpty()) {
            crop.setFarmerEmail(email);
        }

        boolean isGuest = (crop.getFarmerName() == null || crop.getFarmerName().trim().isEmpty() || crop.getFarmerName().equalsIgnoreCase("Guest"))
                && (email == null || email.trim().isEmpty());

        if (isGuest) {
            return crop;
        }

        return repo.save(crop);
    }

    public List<CropRecommendation> getAllRecommendations() {
        return repo.findAll();
    }

    public List<CropRecommendation> getRecommendationsByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return repo.findByFarmerEmail(email);
    }
    public CropRecommendation getCropById(Long id) {
        return repo.findById(id).orElse(null);
    }
    public String deleteCrop(Long id) {
        repo.deleteById(id);
        return "Record Deleted Successfully";
    }
    public CropRecommendation updateCrop(Long id, CropRecommendation crop) {

        CropRecommendation existing = repo.findById(id).orElse(null);

        if(existing != null) {
            existing.setFarmerName(crop.getFarmerName());
            existing.setSoilType(crop.getSoilType());
            existing.setTemperature(crop.getTemperature());
            existing.setHumidity(crop.getHumidity());
            existing.setPh(crop.getPh());
            existing.setRainfall(crop.getRainfall());
            if (crop.getFarmerEmail() != null) {
                existing.setFarmerEmail(crop.getFarmerEmail());
            }

            return repo.save(existing);
        }

        return null;
    }
}