package com.agriculture.advisor.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.agriculture.advisor.entity.CropRecommendation;

import java.util.List;

public interface CropRepository extends JpaRepository<CropRecommendation, Long> {
    List<CropRecommendation> findByFarmerEmail(String farmerEmail);
}