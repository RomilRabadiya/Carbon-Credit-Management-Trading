package com.carbon.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompleteProfileRequest {
    private String role;
    private OrganizationRequest organization;
}
