package com.carboncredit.creditservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for paginated or batch responses containing multiple credits
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditListResponseDTO {

    /**
     * List of credits
     */
    private List<CarbonCreditDTO> credits;

    /**
     * Total count of credits (useful for pagination)
     */
    private long totalCount;

    /**
     * Optional summary information
     */
    private String message;
}
