package com.Elito.OCP.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class HomeController {

    @GetMapping
    public String home(){
        return "welcome to the APP";
    }

    @GetMapping("/api")
    public String secure(){
        return " welcome this is place you cant acess";
    }
}
