package com.carbon.trade.client;

import com.carbon.trade.dto.CarbonCreditDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "core-service", url = "http://localhost:8082")
public interface CoreServiceClient {

        @GetMapping("/api/credits/{creditId}")
        CarbonCreditDTO getCreditById(@PathVariable("creditId") Long creditId);

        @PostMapping("/api/credits/{creditId}/transfer")
        void transferCredit(
                        @PathVariable("creditId") Long creditId,
                        @RequestBody Map<String, Long> request,
                        @RequestHeader("X-Role") String role);

        @PostMapping("/api/credits/{creditId}/retire")
        void retireCredit(
                        @PathVariable("creditId") Long creditId,
                        @RequestBody Map<String, String> request,
                        @RequestHeader("X-Role") String role);
}
