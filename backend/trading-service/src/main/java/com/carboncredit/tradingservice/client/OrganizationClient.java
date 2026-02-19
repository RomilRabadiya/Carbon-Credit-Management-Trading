package com.carboncredit.tradingservice.client;

import com.carboncredit.common.dto.ResponseEnvelope;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.math.BigDecimal;

@FeignClient(name = "organization-service")
public interface OrganizationClient {

    @org.springframework.web.bind.annotation.GetMapping("/api/organizations/{id}")
    ResponseEnvelope<Object> getOrganization(@PathVariable("id") Long id);

    @PostMapping("/api/orgs/{id}/balance/deduct")
    ResponseEnvelope<Void> deductBalance(@PathVariable("id") Long id, @RequestBody BigDecimal amount);

    @PostMapping("/api/orgs/{id}/balance/add")
    ResponseEnvelope<Void> addBalance(@PathVariable("id") Long id, @RequestBody BigDecimal amount);
}
