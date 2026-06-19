package com.agriculture.advisor.entity;

import jakarta.persistence.*;

@Entity
public class CropRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String farmerName;

    private String farmerEmail;

    private String soilType;

    private double temperature;

    private double humidity;

    private double ph;

    private double rainfall;

    private String recommendedCrop;

    public CropRecommendation() {
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFarmerName() {
		return farmerName;
	}

	public void setFarmerName(String farmerName) {
		this.farmerName = farmerName;
	}

	public String getFarmerEmail() {
		return farmerEmail;
	}

	public void setFarmerEmail(String farmerEmail) {
		this.farmerEmail = farmerEmail;
	}

	public String getSoilType() {
		return soilType;
	}

	public void setSoilType(String soilType) {
		this.soilType = soilType;
	}

	public double getTemperature() {
		return temperature;
	}

	public void setTemperature(double temperature) {
		this.temperature = temperature;
	}

	public double getHumidity() {
		return humidity;
	}

	public void setHumidity(double humidity) {
		this.humidity = humidity;
	}

	public double getPh() {
		return ph;
	}

	public void setPh(double ph) {
		this.ph = ph;
	}

	public double getRainfall() {
		return rainfall;
	}

	public void setRainfall(double rainfall) {
		this.rainfall = rainfall;
	}

	public String getRecommendedCrop() {
		return recommendedCrop;
	}

	public void setRecommendedCrop(String recommendedCrop) {
		this.recommendedCrop = recommendedCrop;
	}
	private String season;

	private String recommendedFertilizer;

	public String getSeason() {
		return season;
	}

	public void setSeason(String season) {
		this.season = season;
	}

	public String getRecommendedFertilizer() {
		return recommendedFertilizer;
	}

	public void setRecommendedFertilizer(String recommendedFertilizer) {
		this.recommendedFertilizer = recommendedFertilizer;
	}

     
}