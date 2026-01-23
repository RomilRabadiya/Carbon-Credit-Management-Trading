package com.carboncredit.creditservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonCreditDTO {
    private Long id;
    private String serialNumber;
    private Long ownerId;
    private BigDecimal amount;
    private String status;
    private Long verificationId;
    private LocalDateTime issuanceDate;
}
