package com.carboncredit.emissionservice.strategy;

import java.math.BigDecimal;
import java.util.Map;

public interface EmissionCalculationStrategy {
    BigDecimal calculateEmission(Map<String, Object> data);

    String getProjectType();
}
