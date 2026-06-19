package com.agriculture.advisor.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agriculture.advisor.entity.Farmer;

public interface FarmerRepository extends JpaRepository<Farmer, Long>{

    Farmer findByEmail(String email);
}