package com.carbon.notification.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String type; // e.g., "EMISSION_REPORTED", "VERIFICATION_COMPLETED", "CREDIT_ISSUED"
    private Long targetUserId;
    private String title;
    private String message;
    private LocalDateTime timestamp;
    private Object data; // Optional raw data
}
