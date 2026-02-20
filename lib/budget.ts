export type HeavyPaycheck = "A" | "B";
export type DebtPriority = "scotia-first" | "amex-first";

export type BudgetConfig = {
  paycheckAmount: number;
  gasWeeklyAvg: number;
  groceriesPerPaycheckB: number;
  debtPayPerPaycheckB: number;
  heavyPaycheck: HeavyPaycheck;
  investingEnabled: boolean;
  debtPriority: DebtPriority;
  rentMonthly: number;
  carInsuranceMonthly: number;
  carPaymentBiweekly: number;
  gymBiweekly: number;
  mobileMonthly: number;
  wifiMonthlyHalf: number;
  hydroMonthlyHalf: number;
  gasUtilityMonthlyHalf: number;
  debtScotia: number;
  debtAmex: number;
  lastPaycheckDate: string;
};

export const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
  paycheckAmount: 1690.47,
  gasWeeklyAvg: 90,
  groceriesPerPaycheckB: 300,
  debtPayPerPaycheckB: 524.42,
  heavyPaycheck: "A",
  investingEnabled: true,
  debtPriority: "scotia-first",
  rentMonthly: 952,
  carInsuranceMonthly: 290,
  carPaymentBiweekly: 221,
  gymBiweekly: 33.29,
  mobileMonthly: 96.3,
  wifiMonthlyHalf: 46.67,
  hydroMonthlyHalf: 11.89,
  gasUtilityMonthlyHalf: 26.9,
  debtScotia: 1001.57,
  debtAmex: 1007.18,
  lastPaycheckDate: "2026-02-13"
};

export type BudgetResult = {
  gasPerPaycheck: number;
  debtRemaining: number;
  debtMode: boolean;
  a: {
    fixed: number;
    leftover: number;
    safeToSpend: number;
  };
  b: {
    fixed: number;
    afterFixed: number;
    afterGroceries: number;
    debtPayment: number;
    savings: number;
    investing: number;
    fun: number;
    buffer: number;
    safeToSpend: number;
  };
  payoffBPaychecks: number;
  payoffWeeks: number;
  payoffDate: Date | null;
  debtProgressPct: number;
  nextPaycheckDate: Date;
  upcomingPaycheckDates: Date[];
};

const PAYCHECK_INTERVAL_DAYS = 14;

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

function getNextPaycheckDate(anchor: string, today = new Date()): Date {
  const start = new Date(`${anchor}T12:00:00`);
  if (Number.isNaN(start.getTime())) {
    return today;
  }
  let cursor = start;
  while (cursor <= today) {
    cursor = addDays(cursor, PAYCHECK_INTERVAL_DAYS);
  }
  return cursor;
}

export function calculateBudget(
  config: BudgetConfig,
  debtBaseline: number
): BudgetResult {
  const nextPaycheckDate = getNextPaycheckDate(config.lastPaycheckDate);
  const upcomingPaycheckDates = Array.from({ length: 4 }, (_, index) =>
    addDays(nextPaycheckDate, index * PAYCHECK_INTERVAL_DAYS)
  );
  const gasPerPaycheck = config.gasWeeklyAvg * 2;
  const debtRemaining = config.debtScotia + config.debtAmex;
  const debtMode = debtRemaining > 0.009;

  const aRentAndInsurance =
    config.heavyPaycheck === "A"
      ? config.rentMonthly + config.carInsuranceMonthly
      : 0;
  const aFixed =
    config.carPaymentBiweekly + config.gymBiweekly + gasPerPaycheck + aRentAndInsurance;
  const aLeftover = config.paycheckAmount - aFixed;

  const bRentAndInsurance =
    config.heavyPaycheck === "B"
      ? config.rentMonthly + config.carInsuranceMonthly
      : 0;
  const bFixed =
    config.carPaymentBiweekly +
    config.gymBiweekly +
    config.mobileMonthly +
    config.wifiMonthlyHalf +
    config.hydroMonthlyHalf +
    config.gasUtilityMonthlyHalf +
    gasPerPaycheck +
    bRentAndInsurance;

  const afterFixed = config.paycheckAmount - bFixed;
  const afterGroceries = afterFixed - config.groceriesPerPaycheckB;

  let remaining = afterGroceries;
  let debtPayment = 0;
  let savings = 0;
  let investing = 0;
  let fun = 0;

  if (debtMode) {
    debtPayment = Math.min(
      config.debtPayPerPaycheckB,
      debtRemaining,
      Math.max(0, afterGroceries)
    );
    remaining -= debtPayment;
  } else {
    savings = Math.min(400, Math.max(0, remaining));
    remaining -= savings;
    if (config.investingEnabled) {
      investing = Math.min(200, Math.max(0, remaining));
      remaining -= investing;
    }
    fun = Math.min(150, Math.max(0, remaining));
    remaining -= fun;
  }

  const buffer = remaining;
  const safeToSpend = debtMode ? Math.max(0, buffer) : Math.max(0, fun + buffer);
  const estimatedDebtPayPerB = Math.min(
    config.debtPayPerPaycheckB,
    Math.max(0, afterGroceries)
  );
  const payoffBPaychecks =
    debtMode && estimatedDebtPayPerB > 0
      ? Math.ceil(debtRemaining / estimatedDebtPayPerB)
      : 0;
  const payoffWeeks = payoffBPaychecks * 2;
  const payoffDate = payoffBPaychecks
    ? addDays(nextPaycheckDate, (payoffBPaychecks - 1) * PAYCHECK_INTERVAL_DAYS)
    : null;
  const debtProgressPct =
    debtBaseline > 0
      ? Math.max(
          0,
          Math.min(100, ((debtBaseline - debtRemaining) / debtBaseline) * 100)
        )
      : 100;

  return {
    gasPerPaycheck,
    debtRemaining,
    debtMode,
    a: {
      fixed: aFixed,
      leftover: aLeftover,
      safeToSpend: Math.max(0, aLeftover)
    },
    b: {
      fixed: bFixed,
      afterFixed,
      afterGroceries,
      debtPayment,
      savings,
      investing,
      fun,
      buffer,
      safeToSpend
    },
    payoffBPaychecks,
    payoffWeeks,
    payoffDate,
    debtProgressPct,
    nextPaycheckDate,
    upcomingPaycheckDates
  };
}

export function applyDebtPayment(config: BudgetConfig, amount: number): BudgetConfig {
  if (amount <= 0) return config;

  let pay = amount;
  let scotia = config.debtScotia;
  let amex = config.debtAmex;

  if (config.debtPriority === "scotia-first") {
    const payScotia = Math.min(pay, scotia);
    scotia -= payScotia;
    pay -= payScotia;
    const payAmex = Math.min(pay, amex);
    amex -= payAmex;
  } else {
    const payAmex = Math.min(pay, amex);
    amex -= payAmex;
    pay -= payAmex;
    const payScotia = Math.min(pay, scotia);
    scotia -= payScotia;
  }

  return {
    ...config,
    debtScotia: Math.max(0, scotia),
    debtAmex: Math.max(0, amex)
  };
}

export function projectDebtTrend(config: BudgetConfig, points = 6): number[] {
  const trend: number[] = [];
  let sim = { ...config };
  for (let i = 0; i < points; i += 1) {
    const result = calculateBudget(sim, sim.debtScotia + sim.debtAmex);
    trend.push(result.debtRemaining);
    if (!result.debtMode || result.b.debtPayment <= 0) {
      continue;
    }
    sim = applyDebtPayment(sim, result.b.debtPayment);
  }
  return trend;
}
