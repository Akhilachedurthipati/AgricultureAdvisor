package com.agriculture.advisor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.agriculture.advisor.entity.Farmer;
import com.agriculture.advisor.repository.FarmerRepository;

@Service
public class FarmerService {

    @Autowired
    FarmerRepository repo;

    public Farmer register(Farmer farmer) {
        if (repo.findByEmail(farmer.getEmail()) != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }
        return repo.save(farmer);
    }

    public String login(String email, String password) {

        Farmer farmer = repo.findByEmail(email);

        if(farmer != null &&
                farmer.getPassword().equals(password)) {

            return "Login Successful:" + farmer.getName();
        }

        return "Invalid Email or Password";
    }
}