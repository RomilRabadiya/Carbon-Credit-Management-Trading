package com.carboncredit.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseEvent {
    private String eventId = UUID.randomUUID().toString();
    private LocalDateTime timestamp = LocalDateTime.now();
    private String eventType;
}
