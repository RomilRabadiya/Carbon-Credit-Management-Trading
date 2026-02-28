package com.carbon.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableFeignClients
@EnableScheduling
public class CarbonCoreServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CarbonCoreServiceApplication.class, args);
    }
}
