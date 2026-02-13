package com.carboncredit.verificationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "credit-issuance-service")
public interface CreditClient {

    @PostMapping("/api/credits/issue")
    void issueCredits(@RequestBody Map<String, Object> creditRequest);
}
