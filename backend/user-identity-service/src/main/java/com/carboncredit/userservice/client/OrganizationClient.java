package com.carboncredit.userservice.client;

import com.carboncredit.common.dto.ResponseEnvelope;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// Define DTOs here or import them if available
// For simplicity, using Object or Map if Organization class isn't available in this service
// Ideally, use a shared library for DTOs.
// I will use a simple inner record or class for OrganizationDTO if Common Library doesn't have it.
// Actually, I should use the common-library if it has OrganizationDTO.
// But earlier list_dir of common-library showed Event classes.
// I'll stick to a generic Object or a local DTO for now to avoid dependency hell.

@FeignClient(name = "organization-service")
public interface OrganizationClient {

    @PostMapping("/api/organizations")
    ResponseEnvelope<Object> registerOrganization(@RequestBody Object organization);
}
