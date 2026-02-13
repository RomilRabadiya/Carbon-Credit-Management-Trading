package com.carboncredit.creditservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CreditIssuedEvent {
    private Long creditId;
    private String serialNumber;
    private Long organizationId;
    private Long verificationId;
    private BigDecimal creditAmount;
    private String unit;
    private String eventType;
}
