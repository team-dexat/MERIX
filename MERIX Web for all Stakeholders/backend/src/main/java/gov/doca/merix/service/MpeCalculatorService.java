package gov.doca.merix.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Calculates Maximum Permissible Error (MPE) as per Legal Metrology (General) Rules, 2011 and OIML R76.
 */
@Service
public class MpeCalculatorService {

    public static class MpeEvaluationResult {
        public double appliedLoad;
        public double observedReading;
        public double error;
        public double mpeLimit;
        public boolean passed;
        public String remark;

        public MpeEvaluationResult(double appliedLoad, double observedReading, double error, double mpeLimit, boolean passed, String remark) {
            this.appliedLoad = appliedLoad;
            this.observedReading = observedReading;
            this.error = error;
            this.mpeLimit = mpeLimit;
            this.passed = passed;
            this.remark = remark;
        }
    }

    public MpeEvaluationResult evaluateLoadReading(
            double appliedLoad,
            double observedReading,
            String accuracyClass,
            double verificationScaleIntervalE,
            boolean isInitialVerification
    ) {
        double error = BigDecimal.valueOf(observedReading - appliedLoad)
                .setScale(4, RoundingMode.HALF_UP)
                .doubleValue();
        double loadInE = appliedLoad / (verificationScaleIntervalE > 0 ? verificationScaleIntervalE : 1.0);

        double mpeInE;
        if (loadInE <= 500) {
            mpeInE = 0.5;
        } else if (loadInE <= 2000) {
            mpeInE = 1.0;
        } else {
            mpeInE = 1.5;
        }

        // In-service re-verification allows 2x initial verification MPE under LM Act
        if (!isInitialVerification) {
            mpeInE = mpeInE * 2.0;
        }

        double mpeLimit = BigDecimal.valueOf(mpeInE * (verificationScaleIntervalE > 0 ? verificationScaleIntervalE : 1.0))
                .setScale(4, RoundingMode.HALF_UP)
                .doubleValue();

        boolean passed = Math.abs(error) <= mpeLimit;
        String remark = passed
                ? "Within Legal Metrology tolerance limit (MPE: +/- " + mpeLimit + ")"
                : "Exceeds MPE by " + (Math.abs(error) - mpeLimit) + "! Adjustment required.";

        return new MpeEvaluationResult(appliedLoad, observedReading, error, mpeLimit, passed, remark);
    }
}
