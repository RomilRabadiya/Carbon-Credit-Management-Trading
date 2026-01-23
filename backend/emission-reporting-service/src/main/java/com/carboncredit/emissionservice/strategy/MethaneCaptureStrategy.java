package com.carboncredit.emissionservice.strategy;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Map;

@Component
public class MethaneCaptureStrategy implements EmissionCalculationStrategy {
    @Override
    public BigDecimal calculateEmission(Map<String, Object> data) {
        // Example: volume in m3 * factor (0.015 tonnes CO2 per m3)
        if (!data.containsKey("volume_m3")) {
            throw new IllegalArgumentException("Methane Methane strategy requires 'volume_m3'");
        }
        double volume = Double.parseDouble(data.get("volume_m3").toString());
        return BigDecimal.valueOf(volume * 0.015);
    }

    @Override
    public String getProjectType() {
        return "METHANE_CAPTURE";
    }
}
