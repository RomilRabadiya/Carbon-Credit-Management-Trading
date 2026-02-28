package com.carbon.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrganizationRequest {
    private String name;
    private String type;
    private String address;
    private String contactEmail;
}
