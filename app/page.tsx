"use client";

import { useMemo, useState } from "react";

type HeavyPaycheck = "A" | "B";
type DebtPriority = "scotia-first" | "amex-first";

const DEFAULTS = {
  paycheckAmount: 1690.47,
  gasWeeklyAvg: 90,
  groceriesPerPaycheckB: 300,
  debtPayPerPaycheckB: 524.42,
  rentMonthly: 952,
  carInsuranceMonthly: 290,
  carPaymentBiweekly: 221,
  gymBiweekly: 33.29,
  mobileMonthly: 96.3,
  wifiMonthlyHalf: 46.67,
  hydroMonthlyHalf: 11.89,
  gasUtilityMonthlyHalf: 26.9,
  debtScotia: 1001.57,
  debtAmex: 1007.18
};

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function numberInput(
  setValue: (next: number) => void,
  min?: number,
  max?: number
) {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value);
    if (Number.isNaN(parsed)) return;
    const limited =
      typeof min === "number" && parsed < min
        ? min
        : typeof max === "number" && parsed > max
          ? max
          : parsed;
    setValue(limited);
  };
}

export default function Home() {
  const [paycheckAmount, setPaycheckAmount] = useState(DEFAULTS.paycheckAmount);
  const [gasWeeklyAvg, setGasWeeklyAvg] = useState(DEFAULTS.gasWeeklyAvg);
  const [groceriesPerPaycheckB, setGroceriesPerPaycheckB] = useState(
    DEFAULTS.groceriesPerPaycheckB
  );
  const [debtPayPerPaycheckB, setDebtPayPerPaycheckB] = useState(
    DEFAULTS.debtPayPerPaycheckB
  );
  const [heavyPaycheck, setHeavyPaycheck] = useState<HeavyPaycheck>("A");
  const [investingEnabled, setInvestingEnabled] = useState(true);
  const [debtPriority, setDebtPriority] = useState<DebtPriority>("scotia-first");

  const [rentMonthly, setRentMonthly] = useState(DEFAULTS.rentMonthly);
  const [carInsuranceMonthly, setCarInsuranceMonthly] = useState(
    DEFAULTS.carInsuranceMonthly
  );
  const [carPaymentBiweekly, setCarPaymentBiweekly] = useState(
    DEFAULTS.carPaymentBiweekly
  );
  const [gymBiweekly, setGymBiweekly] = useState(DEFAULTS.gymBiweekly);
  const [mobileMonthly, setMobileMonthly] = useState(DEFAULTS.mobileMonthly);
  const [wifiMonthlyHalf, setWifiMonthlyHalf] = useState(DEFAULTS.wifiMonthlyHalf);
  const [hydroMonthlyHalf, setHydroMonthlyHalf] = useState(
    DEFAULTS.hydroMonthlyHalf
  );
  const [gasUtilityMonthlyHalf, setGasUtilityMonthlyHalf] = useState(
    DEFAULTS.gasUtilityMonthlyHalf
  );

  const [debtScotia, setDebtScotia] = useState(DEFAULTS.debtScotia);
  const [debtAmex, setDebtAmex] = useState(DEFAULTS.debtAmex);
  const [debtBaseline, setDebtBaseline] = useState(
    DEFAULTS.debtScotia + DEFAULTS.debtAmex
  );

  const gasPerPaycheck = gasWeeklyAvg * 2;
  const debtRemaining = debtScotia + debtAmex;
  const debtMode = debtRemaining > 0.009;

  const aBudget = useMemo(() => {
    const rentAndInsurance =
      heavyPaycheck === "A" ? rentMonthly + carInsuranceMonthly : 0;

    const fixed = carPaymentBiweekly + gymBiweekly + gasPerPaycheck + rentAndInsurance;
    const leftover = paycheckAmount - fixed;

    return {
      fixed,
      leftover,
      safeToSpend: Math.max(0, leftover)
    };
  }, [
    heavyPaycheck,
    rentMonthly,
    carInsuranceMonthly,
    carPaymentBiweekly,
    gymBiweekly,
    gasPerPaycheck,
    paycheckAmount
  ]);

  const bBudget = useMemo(() => {
    const rentAndInsurance =
      heavyPaycheck === "B" ? rentMonthly + carInsuranceMonthly : 0;

    const fixed =
      carPaymentBiweekly +
      gymBiweekly +
      mobileMonthly +
      wifiMonthlyHalf +
      hydroMonthlyHalf +
      gasUtilityMonthlyHalf +
      gasPerPaycheck +
      rentAndInsurance;

    const afterFixed = paycheckAmount - fixed;
    const afterGroceries = afterFixed - groceriesPerPaycheckB;

    let remaining = afterGroceries;
    let debtPayment = 0;
    let savings = 0;
    let investing = 0;
    let fun = 0;

    if (debtMode) {
      debtPayment = Math.min(
        debtPayPerPaycheckB,
        debtRemaining,
        Math.max(0, afterGroceries)
      );
      remaining -= debtPayment;
    } else {
      savings = Math.min(400, Math.max(0, remaining));
      remaining -= savings;

      if (investingEnabled) {
        investing = Math.min(200, Math.max(0, remaining));
        remaining -= investing;
      }

      fun = Math.min(150, Math.max(0, remaining));
      remaining -= fun;
    }

    const buffer = remaining;
    const safeToSpend = debtMode
      ? Math.max(0, buffer)
      : Math.max(0, fun + buffer);

    return {
      fixed,
      afterFixed,
      afterGroceries,
      debtPayment,
      savings,
      investing,
      fun,
      buffer,
      safeToSpend
    };
  }, [
    heavyPaycheck,
    rentMonthly,
    carInsuranceMonthly,
    carPaymentBiweekly,
    gymBiweekly,
    mobileMonthly,
    wifiMonthlyHalf,
    hydroMonthlyHalf,
    gasUtilityMonthlyHalf,
    gasPerPaycheck,
    paycheckAmount,
    groceriesPerPaycheckB,
    debtMode,
    debtPayPerPaycheckB,
    debtRemaining,
    investingEnabled
  ]);

  const estimatedDebtPayPerB = Math.min(
    debtPayPerPaycheckB,
    Math.max(0, bBudget.afterGroceries)
  );
  const targetDebtPaymentRange = useMemo(() => {
    const spendMin = 100;
    const spendMax = 200;
    const base = Math.max(0, bBudget.afterGroceries);

    return {
      minPayment: Math.max(0, base - spendMax),
      maxPayment: Math.max(0, base - spendMin)
    };
  }, [bBudget.afterGroceries]);
  const payoffBPaychecks =
    debtMode && estimatedDebtPayPerB > 0
      ? Math.ceil(debtRemaining / estimatedDebtPayPerB)
      : 0;
  const payoffWeeks = payoffBPaychecks * 2;
  const payoffDate = new Date();
  payoffDate.setDate(payoffDate.getDate() + payoffWeeks * 7);

  const debtProgressPct =
    debtBaseline > 0
      ? Math.max(0, Math.min(100, ((debtBaseline - debtRemaining) / debtBaseline) * 100))
      : 100;
  const aFixedPct = Math.max(0, Math.min(100, (aBudget.fixed / paycheckAmount) * 100));
  const bFixedPct = Math.max(0, Math.min(100, (bBudget.fixed / paycheckAmount) * 100));
  const bGroceriesPct = Math.max(
    0,
    Math.min(100, (groceriesPerPaycheckB / paycheckAmount) * 100)
  );
  const bDebtPct = Math.max(
    0,
    Math.min(100, (bBudget.debtPayment / paycheckAmount) * 100)
  );
  const bSafePct = Math.max(
    0,
    Math.min(100, (bBudget.safeToSpend / paycheckAmount) * 100)
  );
  const targetSafeSpend = 250;
  const safeSpendDelta = bBudget.safeToSpend - targetSafeSpend;

  function setDebtBalances(nextScotia: number, nextAmex: number) {
    setDebtScotia(Math.max(0, nextScotia));
    setDebtAmex(Math.max(0, nextAmex));
    setDebtBaseline(Math.max(0.01, nextScotia + nextAmex));
  }

  function applyDebtPayment() {
    const amount = bBudget.debtPayment;
    if (amount <= 0) return;

    let pay = amount;
    let nextScotia = debtScotia;
    let nextAmex = debtAmex;

    if (debtPriority === "scotia-first") {
      const payScotia = Math.min(pay, nextScotia);
      nextScotia -= payScotia;
      pay -= payScotia;

      const payAmex = Math.min(pay, nextAmex);
      nextAmex -= payAmex;
    } else {
      const payAmex = Math.min(pay, nextAmex);
      nextAmex -= payAmex;
      pay -= payAmex;

      const payScotia = Math.min(pay, nextScotia);
      nextScotia -= payScotia;
    }

    setDebtScotia(nextScotia);
    setDebtAmex(nextAmex);
  }

  function resetAll() {
    setPaycheckAmount(DEFAULTS.paycheckAmount);
    setGasWeeklyAvg(DEFAULTS.gasWeeklyAvg);
    setGroceriesPerPaycheckB(DEFAULTS.groceriesPerPaycheckB);
    setDebtPayPerPaycheckB(DEFAULTS.debtPayPerPaycheckB);
    setHeavyPaycheck("A");
    setInvestingEnabled(true);
    setDebtPriority("scotia-first");
    setRentMonthly(DEFAULTS.rentMonthly);
    setCarInsuranceMonthly(DEFAULTS.carInsuranceMonthly);
    setCarPaymentBiweekly(DEFAULTS.carPaymentBiweekly);
    setGymBiweekly(DEFAULTS.gymBiweekly);
    setMobileMonthly(DEFAULTS.mobileMonthly);
    setWifiMonthlyHalf(DEFAULTS.wifiMonthlyHalf);
    setHydroMonthlyHalf(DEFAULTS.hydroMonthlyHalf);
    setGasUtilityMonthlyHalf(DEFAULTS.gasUtilityMonthlyHalf);
    setDebtScotia(DEFAULTS.debtScotia);
    setDebtAmex(DEFAULTS.debtAmex);
    setDebtBaseline(DEFAULTS.debtScotia + DEFAULTS.debtAmex);
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Biweekly Budget Planner</p>
        <h1>Paycheck A/B Control Panel</h1>
        <p>
          Model paycheck-by-paycheck cash flow, enforce debt mode guardrails, and see
          exactly what is safe to spend.
        </p>
      </section>

      <section className="quick-stats">
        <article className="stat-card">
          <p className="stat-label">Paycheck B Safe To Spend</p>
          <p className="stat-value">{money(bBudget.safeToSpend)}</p>
          <p
            className={`stat-note ${
              Math.abs(safeSpendDelta) < 0.01 ? "match" : safeSpendDelta > 0 ? "high" : "low"
            }`}
          >
            Target {money(targetSafeSpend)} ({safeSpendDelta >= 0 ? "+" : ""}
            {money(safeSpendDelta)})
          </p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Debt Remaining</p>
          <p className="stat-value">{money(debtRemaining)}</p>
          <p className="stat-note">{debtMode ? "Debt mode active" : "Debt free"}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Payoff Pace</p>
          <p className="stat-value">
            {debtMode && estimatedDebtPayPerB > 0 ? `${payoffWeeks} weeks` : "--"}
          </p>
          <p className="stat-note">
            {debtMode && estimatedDebtPayPerB > 0
              ? `${payoffBPaychecks} paycheck B cycles`
              : "Not in debt payoff"}
          </p>
        </article>
      </section>

      <section className="card-grid inputs">
        <article className="panel">
          <h2>Core Inputs</h2>
          <div className="field-grid">
            <label>
              Paycheck Amount
              <input
                type="number"
                step="0.01"
                min="0"
                value={paycheckAmount}
                onChange={numberInput(setPaycheckAmount, 0)}
              />
            </label>
            <label>
              Cadence
              <input type="text" value="Biweekly" disabled />
            </label>
            <label>
              Gas / Week (84-96)
              <input
                type="number"
                step="1"
                min="84"
                max="96"
                value={gasWeeklyAvg}
                onChange={numberInput(setGasWeeklyAvg, 84, 96)}
              />
            </label>
            <label>
              Groceries / Paycheck B
              <input
                type="number"
                step="1"
                min="0"
                value={groceriesPerPaycheckB}
                onChange={numberInput(setGroceriesPerPaycheckB, 0)}
              />
            </label>
            <label>
              Debt Payment / Paycheck B
              <input
                type="number"
                step="0.01"
                min="0"
                value={debtPayPerPaycheckB}
                onChange={numberInput(setDebtPayPerPaycheckB, 0)}
              />
              <small className="input-help">
                Target debt payment for about $100-$200 safe-to-spend:{" "}
                {money(targetDebtPaymentRange.minPayment)} -{" "}
                {money(targetDebtPaymentRange.maxPayment)}
              </small>
            </label>
            <label>
              Heavy Bills On
              <select
                value={heavyPaycheck}
                onChange={(event) =>
                  setHeavyPaycheck(event.target.value as HeavyPaycheck)
                }
              >
                <option value="A">Paycheck A (default)</option>
                <option value="B">Paycheck B</option>
              </select>
            </label>
          </div>
        </article>

        <article className="panel">
          <h2>Fixed Bills</h2>
          <div className="field-grid">
            <label>
              Rent (Monthly)
              <input
                type="number"
                step="0.01"
                min="0"
                value={rentMonthly}
                onChange={numberInput(setRentMonthly, 0)}
              />
            </label>
            <label>
              Car Insurance (Monthly)
              <input
                type="number"
                step="0.01"
                min="0"
                value={carInsuranceMonthly}
                onChange={numberInput(setCarInsuranceMonthly, 0)}
              />
            </label>
            <label>
              Car Payment (Biweekly)
              <input
                type="number"
                step="0.01"
                min="0"
                value={carPaymentBiweekly}
                onChange={numberInput(setCarPaymentBiweekly, 0)}
              />
            </label>
            <label>
              Gym (Biweekly)
              <input
                type="number"
                step="0.01"
                min="0"
                value={gymBiweekly}
                onChange={numberInput(setGymBiweekly, 0)}
              />
            </label>
            <label>
              Mobile (Monthly)
              <input
                type="number"
                step="0.01"
                min="0"
                value={mobileMonthly}
                onChange={numberInput(setMobileMonthly, 0)}
              />
            </label>
            <label>
              WiFi (Monthly Half)
              <input
                type="number"
                step="0.01"
                min="0"
                value={wifiMonthlyHalf}
                onChange={numberInput(setWifiMonthlyHalf, 0)}
              />
            </label>
            <label>
              Hydro (Monthly Half)
              <input
                type="number"
                step="0.01"
                min="0"
                value={hydroMonthlyHalf}
                onChange={numberInput(setHydroMonthlyHalf, 0)}
              />
            </label>
            <label>
              Gas Utility (Monthly Half)
              <input
                type="number"
                step="0.01"
                min="0"
                value={gasUtilityMonthlyHalf}
                onChange={numberInput(setGasUtilityMonthlyHalf, 0)}
              />
            </label>
          </div>
        </article>
      </section>

      <section className="card-grid cards-2">
        <article className="panel paycheck">
          <div className="card-title-row">
            <h2>Paycheck A</h2>
            {heavyPaycheck === "A" ? <span className="badge">HEAVY BILLS</span> : null}
          </div>
          <div className="viz-wrap">
            <div className="viz-row">
              <span>Fixed</span>
              <span>{aFixedPct.toFixed(0)}%</span>
            </div>
            <div className="viz-bar">
              <div className="viz-fill fixed" style={{ width: `${aFixedPct}%` }} />
            </div>
            <div className="viz-row">
              <span>Safe</span>
              <span>{money(aBudget.safeToSpend)}</span>
            </div>
          </div>
          <ul>
            <li>
              <span>Car Payment</span>
              <strong>{money(carPaymentBiweekly)}</strong>
            </li>
            <li>
              <span>Gym</span>
              <strong>{money(gymBiweekly)}</strong>
            </li>
            <li>
              <span>Car Gas (2 weeks)</span>
              <strong>{money(gasPerPaycheck)}</strong>
            </li>
            {heavyPaycheck === "A" ? (
              <>
                <li>
                  <span>Rent</span>
                  <strong>{money(rentMonthly)}</strong>
                </li>
                <li>
                  <span>Car Insurance</span>
                  <strong>{money(carInsuranceMonthly)}</strong>
                </li>
              </>
            ) : null}
            <li className="total">
              <span>Total</span>
              <strong>{money(aBudget.fixed)}</strong>
            </li>
            <li className="total">
              <span>Leftover</span>
              <strong>{money(aBudget.leftover)}</strong>
            </li>
            <li className="safe">
              <span>Safe To Spend</span>
              <strong>{money(aBudget.safeToSpend)}</strong>
            </li>
          </ul>
          {aBudget.leftover < 0 ? (
            <p className="warning">
              You are overspent on this paycheck. Reduce gas/groceries or move a bill.
            </p>
          ) : null}
        </article>

        <article className="panel paycheck">
          <div className="card-title-row">
            <h2>Paycheck B</h2>
            <span className={`badge ${debtMode ? "debt" : "wealth"}`}>
              {debtMode ? "DEBT MODE" : "WEALTH MODE"}
            </span>
          </div>
          <div className="viz-wrap">
            <div className="viz-row">
              <span>Fixed</span>
              <span>{bFixedPct.toFixed(0)}%</span>
            </div>
            <div className="viz-bar">
              <div className="viz-fill fixed" style={{ width: `${bFixedPct}%` }} />
            </div>
            <div className="viz-row">
              <span>Groceries</span>
              <span>{bGroceriesPct.toFixed(0)}%</span>
            </div>
            <div className="viz-bar">
              <div className="viz-fill groceries" style={{ width: `${bGroceriesPct}%` }} />
            </div>
            {debtMode ? (
              <>
                <div className="viz-row">
                  <span>Debt</span>
                  <span>{bDebtPct.toFixed(0)}%</span>
                </div>
                <div className="viz-bar">
                  <div className="viz-fill debt" style={{ width: `${bDebtPct}%` }} />
                </div>
              </>
            ) : null}
            <div className="viz-row">
              <span>Safe</span>
              <span>{bSafePct.toFixed(0)}%</span>
            </div>
            <div className="viz-bar">
              <div className="viz-fill safe" style={{ width: `${bSafePct}%` }} />
            </div>
          </div>
          <ul>
            <li>
              <span>Fixed Bills</span>
              <strong>{money(bBudget.fixed)}</strong>
            </li>
            <li>
              <span>After Fixed</span>
              <strong>{money(bBudget.afterFixed)}</strong>
            </li>
            <li>
              <span>Groceries</span>
              <strong>{money(groceriesPerPaycheckB)}</strong>
            </li>
            <li>
              <span>After Groceries</span>
              <strong>{money(bBudget.afterGroceries)}</strong>
            </li>
            {debtMode ? (
              <li>
                <span>Debt Payment</span>
                <strong>{money(bBudget.debtPayment)}</strong>
              </li>
            ) : (
              <>
                <li>
                  <span>Savings</span>
                  <strong>{money(bBudget.savings)}</strong>
                </li>
                <li>
                  <span>Investing</span>
                  <strong>{money(bBudget.investing)}</strong>
                </li>
                <li>
                  <span>Fun</span>
                  <strong>{money(bBudget.fun)}</strong>
                </li>
              </>
            )}
            <li className="total">
              <span>Buffer</span>
              <strong>{money(bBudget.buffer)}</strong>
            </li>
            <li className="safe">
              <span>Safe To Spend</span>
              <strong>{money(bBudget.safeToSpend)}</strong>
            </li>
          </ul>
          {debtMode ? (
            <p className="warning">
              Spending above the buffer is not recommended and slows debt payoff.
            </p>
          ) : (
            <p className="ok">Savings and investing are treated as locked allocations.</p>
          )}
          {bBudget.buffer < 50 ? (
            <p className="warning">Low cushion warning: buffer is under $50.</p>
          ) : null}
        </article>
      </section>

      <section className="card-grid cards-2">
        <article className="panel">
          <h2>Debt Progress</h2>
          <div className="field-grid">
            <label>
              Scotia Balance
              <input
                type="number"
                step="0.01"
                min="0"
                value={debtScotia}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (Number.isNaN(next)) return;
                  setDebtBalances(next, debtAmex);
                }}
              />
            </label>
            <label>
              Amex Balance
              <input
                type="number"
                step="0.01"
                min="0"
                value={debtAmex}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (Number.isNaN(next)) return;
                  setDebtBalances(debtScotia, next);
                }}
              />
            </label>
            <label>
              Debt Priority
              <select
                value={debtPriority}
                onChange={(event) =>
                  setDebtPriority(event.target.value as DebtPriority)
                }
              >
                <option value="scotia-first">Scotia First</option>
                <option value="amex-first">Amex First</option>
              </select>
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={investingEnabled}
                onChange={(event) => setInvestingEnabled(event.target.checked)}
              />
              Enable investing allocation after debt payoff
            </label>
          </div>

          <div className="progress-wrap">
            <div className="progress-label-row">
              <span>Total Debt Baseline: {money(debtBaseline)}</span>
              <span>Remaining: {money(debtRemaining)}</span>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${debtProgressPct}%` }} />
            </div>
          </div>

          {debtMode && estimatedDebtPayPerB > 0 ? (
            <p>
              Estimated payoff: <strong>{payoffBPaychecks} Paycheck B cycles</strong> (
              {payoffWeeks} weeks), around{" "}
              <strong>
                {payoffDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </strong>
              .
            </p>
          ) : debtMode ? (
            <p className="warning">
              Debt cannot be paid down with current settings. Increase paycheck B
              margin.
            </p>
          ) : (
            <p className="ok">Debt-free mode active. Shift cash flow to wealth building.</p>
          )}

          <div className="button-row">
            <button
              className="apply-button"
              onClick={applyDebtPayment}
              disabled={!debtMode || bBudget.debtPayment <= 0}
            >
              Apply This Paycheck B Debt Payment
            </button>
            <button className="ghost" onClick={resetAll}>
              Reset Defaults
            </button>
          </div>
        </article>

        <article className="panel recommendations">
          <h2>Recommendations</h2>
          {debtMode ? (
            <>
              <p>You are in debt payoff mode. Keep spending inside the paycheck B buffer.</p>
              <p>
                Priority order: fixed bills, groceries, then debt payment of{" "}
                <strong>{money(bBudget.debtPayment)}</strong>.
              </p>
            </>
          ) : (
            <>
              <p>Debt-free mode active: allocate to savings, investing, and fun.</p>
              <p>
                Safe to spend includes <strong>Fun + Buffer</strong> while savings and
                investing stay locked.
              </p>
            </>
          )}
          <p>Monthly reference income: {money((paycheckAmount * 26) / 12)}</p>
          <p>Car gas monthly reference: {money((gasWeeklyAvg * 52) / 12)}</p>
        </article>
      </section>

      <section className="mobile-safebar" aria-label="Safe to spend summary">
        <div>
          <p>Paycheck B Safe To Spend</p>
          <strong>{money(bBudget.safeToSpend)}</strong>
        </div>
        <span className={`badge ${debtMode ? "debt" : "wealth"}`}>
          {debtMode ? "DEBT MODE" : "WEALTH MODE"}
        </span>
      </section>
    </main>
  );
}
