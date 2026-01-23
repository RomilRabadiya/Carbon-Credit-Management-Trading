package com.carboncredit.tradingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarbonCreditDTO {
    private Long id;
    private String serialNumber;
    private Long ownerId;
    private Double amount;
    private String status;
    private LocalDateTime issuanceDate;
}
