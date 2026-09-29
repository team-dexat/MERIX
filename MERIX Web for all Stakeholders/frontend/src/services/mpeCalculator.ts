// ============================================================================
// MERIX: Legal Metrology MPE Calculator (OIML R76 / General Rules 2011)
// ============================================================================

export interface MpeResult {
  loadPoint: string;
  appliedLoad: number;
  observedReading: number;
  error: number;
  mpeLimit: number;
  unit: string;
  passed: boolean;
  statusText: string;
}

/**
 * Calculates Maximum Permissible Error (MPE) based on accuracy class and verification interval 'e'
 */
export function calculateMpe(
  loadPoint: string,
  appliedLoad: number,
  observedReading: number,
  scaleIntervalE: number = 0.05,
  unit: string = 'kg',
  isInitial: boolean = false
): MpeResult {
  const error = Number((observedReading - appliedLoad).toFixed(4));
  const loadInE = appliedLoad / (scaleIntervalE > 0 ? scaleIntervalE : 1);

  let mpeInE = 1.0;
  if (loadInE <= 500) {
    mpeInE = 0.5;
  } else if (loadInE <= 2000) {
    mpeInE = 1.0;
  } else {
    mpeInE = 1.5;
  }

  // Periodic in-service verification allows 2x initial MPE under Section 15 of LM Act
  if (!isInitial) {
    mpeInE = mpeInE * 2.0;
  }

  const mpeLimit = Number((mpeInE * (scaleIntervalE > 0 ? scaleIntervalE : 1)).toFixed(4));
  const passed = Math.abs(error) <= mpeLimit;

  return {
    loadPoint,
    appliedLoad,
    observedReading,
    error,
    mpeLimit,
    unit,
    passed,
    statusText: passed 
      ? `PASS (Tolerance: ±${mpeLimit} ${unit})` 
      : `FAIL (Exceeds MPE limit by ${(Math.abs(error) - mpeLimit).toFixed(4)} ${unit})`
  };
}
