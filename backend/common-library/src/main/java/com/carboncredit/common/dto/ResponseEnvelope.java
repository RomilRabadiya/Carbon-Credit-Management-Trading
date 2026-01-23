package com.carboncredit.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



import com.carboncredit.common.dto.ResponseEnvelope;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResponseEnvelope<T> {

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    private int status;
    private boolean success;
    private String message;
    private T data;
    private String error;

    public static <T> ResponseEnvelope<T> success(T data, String message) {
        return ResponseEnvelope.<T>builder()
                .status(200)
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ResponseEnvelope<T> error(String errorMessage, int status) {
        return ResponseEnvelope.<T>builder()
                .status(status)
                .success(false)
                .error(errorMessage)
                .build();
    }
}
