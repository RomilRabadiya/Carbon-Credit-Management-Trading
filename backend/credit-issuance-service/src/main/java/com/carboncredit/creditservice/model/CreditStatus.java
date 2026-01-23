package com.carboncredit.creditservice.model;

/**
 * Enum representing the lifecycle status of a Carbon Credit
 * 
 * Business Rules:
 * - ISSUED: Credit newly created and assigned to organization
 * - LISTED: Credit listed on trading marketplace
 * - SOLD: Credit has been sold to another organization
 * - RETIRED: Credit permanently retired (cannot be traded)
 */
public enum CreditStatus {
    ISSUED, // Initial status when credit is first issued
    LISTED, // Credit is available for trading
    SOLD, // Credit has been sold (ownership transferred)
    RETIRED // Credit retired/consumed (end of lifecycle)
}
