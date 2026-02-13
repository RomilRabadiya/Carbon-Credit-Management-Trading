package com.carboncredit.tradingservice.client;

import com.carboncredit.common.dto.ResponseEnvelope;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "user-identity-service")
public interface UserClient {

    @GetMapping("/api/users/current")
    ResponseEnvelope<Object> getCurrentUser();
}
