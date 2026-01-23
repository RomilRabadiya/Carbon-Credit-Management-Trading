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
public class EmissionReportedEvent extends BaseEvent {
    private Long reportId;
    private Long projectId;
    private Long organizationId;
    private BigDecimal carbonAmount;
    private String unit;
    private String description;
}
