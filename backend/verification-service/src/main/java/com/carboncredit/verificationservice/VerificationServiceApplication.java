package com.carboncredit.verificationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
@org.springframework.cloud.openfeign.EnableFeignClients
public class VerificationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(VerificationServiceApplication.class, args);
    }
}
