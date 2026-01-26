package com.carboncredit.common.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ResponseEnvelope<T> {

    private LocalDateTime timestamp = LocalDateTime.now();

    private int status;
    private boolean success;
    private String message;
    private T data;
    private String error;

    public ResponseEnvelope() {
    }

    public ResponseEnvelope(LocalDateTime timestamp, int status, boolean success, String message, T data,
            String error) {
        this.timestamp = timestamp;
        this.status = status;
        this.success = success;
        this.message = message;
        this.data = data;
        this.error = error;
    }

    public static <T> ResponseEnvelopeBuilder<T> builder() {
        return new ResponseEnvelopeBuilder<>();
    }

    public static class ResponseEnvelopeBuilder<T> {
        private LocalDateTime timestamp = LocalDateTime.now();
        private int status;
        private boolean success;
        private String message;
        private T data;
        private String error;

        public ResponseEnvelopeBuilder<T> status(int status) {
            this.status = status;
            return this;
        }

        public ResponseEnvelopeBuilder<T> success(boolean success) {
            this.success = success;
            return this;
        }

        public ResponseEnvelopeBuilder<T> message(String message) {
            this.message = message;
            return this;
        }

        public ResponseEnvelopeBuilder<T> data(T data) {
            this.data = data;
            return this;
        }

        public ResponseEnvelopeBuilder<T> error(String error) {
            this.error = error;
            return this;
        }

        public ResponseEnvelope<T> build() {
            return new ResponseEnvelope<T>(timestamp, status, success, message, data, error);
        }
    }

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
