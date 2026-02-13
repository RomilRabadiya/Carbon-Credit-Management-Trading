package com.carboncredit.creditservice.dto;

import java.util.List;

/**
 * DTO for paginated or batch responses containing multiple credits
 */
public class CreditListResponseDTO {

    private List<CarbonCreditDTO> credits;
    private long totalCount;
    private String message;

    public CreditListResponseDTO() {
    }

    public CreditListResponseDTO(List<CarbonCreditDTO> credits, long totalCount, String message) {
        this.credits = credits;
        this.totalCount = totalCount;
        this.message = message;
    }

    public List<CarbonCreditDTO> getCredits() {
        return credits;
    }

    public void setCredits(List<CarbonCreditDTO> credits) {
        this.credits = credits;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
