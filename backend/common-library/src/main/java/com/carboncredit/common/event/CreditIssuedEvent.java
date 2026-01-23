package com.carboncredit.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CreditIssuedEvent extends BaseEvent {
    private Long creditId;
    private String serialNumber;
    private Long organizationId;
    private Long verificationId;
    private BigDecimal creditAmount;
    private String unit;
}
