package com.carboncredit.tradingservice.client;

import com.carboncredit.tradingservice.dto.CarbonCreditDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "credit-issuance-service")
public interface CreditClient {

        @GetMapping("/api/credits/{creditId}")
        CarbonCreditDTO getCreditById(@PathVariable("creditId") Long creditId);

        @org.springframework.web.bind.annotation.PostMapping("/api/credits/{creditId}/transfer")
        void transferCredit(@PathVariable("creditId") Long creditId,
                        @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Long> request);

        @org.springframework.web.bind.annotation.PostMapping("/api/credits/{creditId}/retire")
        void retireCredit(@PathVariable("creditId") Long creditId,
                        @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> request);
}
