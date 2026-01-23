package com.carboncredit.tradingservice.client;

import com.carboncredit.tradingservice.dto.CarbonCreditDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "CREDIT-SERVICE")
public interface CreditClient {

    @GetMapping("/api/credits/{creditId}")
    CarbonCreditDTO getCreditById(@PathVariable("creditId") Long creditId);
}
