package com.carboncredit.creditservice.job;

import com.carboncredit.creditservice.dao.CreditDAO;
import com.carboncredit.creditservice.model.CarbonCredit;

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

        // logic: Find all ACTIVE credits where expiryDate is before NOW
        // Note: For performance in a real massive DB, we should have a custom query in
        // DAO.
        // For now, we fetch and filter (or assuming small scale/demonstration).
        // Ideally: creditDAO.expireOldCredits(now, "EXPIRED", "ACTIVE"); rather than
        // fetch-loop-save.

        // Let's iterate for safety and logging in this demo
        List<CarbonCredit> activeCredits = creditDAO.findByStatus("ACTIVE");

        int expiredCount = 0;
        for (CarbonCredit credit : activeCredits) {
            if (credit.getExpiryDate() != null && credit.getExpiryDate().isBefore(now)) {
                credit.setStatus("EXPIRED");
                creditDAO.save(credit);
                log.info("Expired Credit ID: {} (Expired on: {})", credit.getId(), credit.getExpiryDate());
                expiredCount++;

                // Optional: Emit CreditExpiredEvent here if needed
            }
        }

        log.info("Credit Expiry Job Completed. Total credits expired: {}", expiredCount);
    }
}
