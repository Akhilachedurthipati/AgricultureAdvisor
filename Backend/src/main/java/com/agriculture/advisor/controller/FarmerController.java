package com.agriculture.advisor.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.agriculture.advisor.entity.Farmer;
import com.agriculture.advisor.service.FarmerService;

@CrossOrigin
@RestController
@RequestMapping("/farmer")
public class FarmerController {

    @Autowired
    FarmerService service;

    @PostMapping("/register")
    public Farmer register(@RequestBody Farmer farmer) {

        return service.register(farmer);
    }

    @PostMapping("/login")
    public String login(@RequestBody Map<String,String> data) {

        return service.login(
                data.get("email"),
                data.get("password"));
    }
}