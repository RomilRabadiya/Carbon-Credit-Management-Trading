package com.carboncredit.emissionservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class EmissionServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EmissionServiceApplication.class, args);
    }
}
