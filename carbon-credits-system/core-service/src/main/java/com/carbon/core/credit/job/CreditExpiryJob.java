package com.carbon.core.credit.job;

import com.carbon.core.credit.dao.CreditDAO;
import com.carbon.core.credit.model.CarbonCredit;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class CreditExpiryJob {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CreditExpiryJob.class);

    private final CreditDAO creditDAO;

    public CreditExpiryJob(CreditDAO creditDAO) {
        this.creditDAO = creditDAO;
    }

    /**
     * Runs daily at midnight to expire old credits.
     * Cron: 0 0 0 * * ? (At 00:00:00 every day)
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void expireCredits() {
        log.info("Starting Daily Credit Expiry Job...");

        LocalDateTime now = LocalDateTime.now();

        List<CarbonCredit> activeCredits = creditDAO.findByStatus("ACTIVE");

        int expiredCount = 0;
        for (CarbonCredit credit : activeCredits) {
            if (credit.getExpiryDate() != null && credit.getExpiryDate().isBefore(now)) {
                credit.setStatus("EXPIRED");
                creditDAO.save(credit);
                log.info("Expired Credit ID: {} (Expired on: {})", credit.getId(), credit.getExpiryDate());
                expiredCount++;
            }
        }

        log.info("Credit Expiry Job Completed. Total credits expired: {}", expiredCount);
    }
}
