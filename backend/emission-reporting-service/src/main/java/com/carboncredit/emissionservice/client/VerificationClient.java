package com.carboncredit.emissionservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "verification-service")
public interface VerificationClient {

    @PostMapping("/api/verifications")
    void initiateVerification(@RequestBody Map<String, Object> verificationRequest);
}
