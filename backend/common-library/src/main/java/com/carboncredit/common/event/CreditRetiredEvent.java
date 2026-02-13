package com.carboncredit.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CreditRetiredEvent extends BaseEvent {
    private Long creditId;
    private String serialNumber;
    private Long ownerId;
    private String reason;
    private Long transactionId;
}
