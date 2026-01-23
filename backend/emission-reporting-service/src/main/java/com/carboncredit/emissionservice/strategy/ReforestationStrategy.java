package com.carboncredit.emissionservice.strategy;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Map;

@Component
public class ReforestationStrategy implements EmissionCalculationStrategy {
    @Override
    public BigDecimal calculateEmission(Map<String, Object> data) {
        // Example: area in hectares * factor (10.5 tonnes CO2 per hectare)
        if (!data.containsKey("area_hectares")) {
            throw new IllegalArgumentException("Reforestation strategy requires 'area_hectares'");
        }
        double area = Double.parseDouble(data.get("area_hectares").toString());
        return BigDecimal.valueOf(area * 10.5);
    }

    @Override
    public String getProjectType() {
        return "REFORESTATION";
    }
}
