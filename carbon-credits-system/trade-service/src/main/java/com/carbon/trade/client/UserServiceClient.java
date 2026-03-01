package com.carbon.trade.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;

@FeignClient(name = "user-service", url = "http://localhost:8081")
public interface UserServiceClient {

        @PostMapping("/api/users/{id}/balance/deduct")
        void deductBalance(
                        @PathVariable("id") Long id,
                        @RequestBody BigDecimal amount);

        @PostMapping("/api/users/{id}/balance/add")
        void addBalance(
                        @PathVariable("id") Long id,
                        @RequestBody BigDecimal amount);
}
