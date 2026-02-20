"use client";

import type { ChangeEvent } from "react";
import { useBudgetStore } from "../../hooks/useBudgetStore";
import {
  DEFAULT_BUDGET_CONFIG,
  BudgetConfig,
  HeavyPaycheck,
  DebtPriority,
  applyDebtPayment
} from "../../lib/budget";
import { useRouter } from "next/navigation";

function numberField(
  config: BudgetConfig,
  setConfig: (next: BudgetConfig) => void,
  key: keyof BudgetConfig,
  min = 0,
  max?: number
) {
  return (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value);
    if (Number.isNaN(parsed)) return;
    const clamped =
      typeof max === "number"
        ? Math.min(max, Math.max(min, parsed))
        : Math.max(min, parsed);
    setConfig({ ...config, [key]: clamped });
  };
}

export default function SettingsPage() {
  const {
    config,
    setConfig,
    debtBaseline,
    setDebtBaseline,
    hideNumbers,
    setHideNumbers,
    result
  } = useBudgetStore();
  const router = useRouter();

  function onResetDefaults() {
    setConfig(DEFAULT_BUDGET_CONFIG);
    setDebtBaseline(DEFAULT_BUDGET_CONFIG.debtScotia + DEFAULT_BUDGET_CONFIG.debtAmex);
  }

  function onApplyDebtPayment() {
    if (!result.debtMode || result.b.debtPayment <= 0) return;
    const next = applyDebtPayment(config, result.b.debtPayment);
    setConfig(next);
    const nextDebt = next.debtScotia + next.debtAmex;
    if (nextDebt > debtBaseline) setDebtBaseline(nextDebt);
  }

  return (
    <main className="page settings-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Raqib&apos;s Budget Tracker</p>
          <h1>Settings</h1>
        </div>
        <div className="hero-actions">
          <button className="ghost icon-btn" onClick={() => setHideNumbers(!hideNumbers)}>
            {hideNumbers ? "Show" : "Hide"}
          </button>
          <button className="ghost icon-link" onClick={() => router.push("/")}>
            Dashboard
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Core Inputs</h2>
        <div className="field-grid">
          <label>
            Paycheck Amount
            <input
              type="number"
              step="0.01"
              value={config.paycheckAmount}
              onChange={numberField(config, setConfig, "paycheckAmount", 0)}
            />
          </label>
          <label>
            Gas / Week (84-96)
            <input
              type="number"
              step="1"
              value={config.gasWeeklyAvg}
              onChange={numberField(config, setConfig, "gasWeeklyAvg", 84, 96)}
            />
          </label>
          <label>
            Groceries / Paycheck B
            <input
              type="number"
              step="1"
              value={config.groceriesPerPaycheckB}
              onChange={numberField(config, setConfig, "groceriesPerPaycheckB", 0)}
            />
          </label>
          <label>
            Debt Payment / Paycheck B
            <input
              type="number"
              step="0.01"
              value={config.debtPayPerPaycheckB}
              onChange={numberField(config, setConfig, "debtPayPerPaycheckB", 0)}
            />
          </label>
          <label>
            Heavy Bills On
            <select
              value={config.heavyPaycheck}
              onChange={(e) =>
                setConfig({ ...config, heavyPaycheck: e.target.value as HeavyPaycheck })
              }
            >
              <option value="A">Paycheck A</option>
              <option value="B">Paycheck B</option>
            </select>
          </label>
          <label>
            Debt Priority
            <select
              value={config.debtPriority}
              onChange={(e) =>
                setConfig({ ...config, debtPriority: e.target.value as DebtPriority })
              }
            >
              <option value="scotia-first">Scotia First</option>
              <option value="amex-first">Amex First</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel">
        <h2>Bills</h2>
        <div className="field-grid">
          <label>
            Rent (Monthly)
            <input
              type="number"
              step="0.01"
              value={config.rentMonthly}
              onChange={numberField(config, setConfig, "rentMonthly", 0)}
            />
          </label>
          <label>
            Car Insurance (Monthly)
            <input
              type="number"
              step="0.01"
              value={config.carInsuranceMonthly}
              onChange={numberField(config, setConfig, "carInsuranceMonthly", 0)}
            />
          </label>
          <label>
            Car Payment (Biweekly)
            <input
              type="number"
              step="0.01"
              value={config.carPaymentBiweekly}
              onChange={numberField(config, setConfig, "carPaymentBiweekly", 0)}
            />
          </label>
          <label>
            Gym (Biweekly)
            <input
              type="number"
              step="0.01"
              value={config.gymBiweekly}
              onChange={numberField(config, setConfig, "gymBiweekly", 0)}
            />
          </label>
          <label>
            Mobile (Monthly)
            <input
              type="number"
              step="0.01"
              value={config.mobileMonthly}
              onChange={numberField(config, setConfig, "mobileMonthly", 0)}
            />
          </label>
          <label>
            WiFi (Half)
            <input
              type="number"
              step="0.01"
              value={config.wifiMonthlyHalf}
              onChange={numberField(config, setConfig, "wifiMonthlyHalf", 0)}
            />
          </label>
          <label>
            Hydro (Half)
            <input
              type="number"
              step="0.01"
              value={config.hydroMonthlyHalf}
              onChange={numberField(config, setConfig, "hydroMonthlyHalf", 0)}
            />
          </label>
          <label>
            Gas Utility (Half)
            <input
              type="number"
              step="0.01"
              value={config.gasUtilityMonthlyHalf}
              onChange={numberField(config, setConfig, "gasUtilityMonthlyHalf", 0)}
            />
          </label>
        </div>
      </section>

      <section className="panel">
        <h2>Debt Balances</h2>
        <div className="field-grid">
          <label>
            Scotia
            <input
              type="number"
              step="0.01"
              value={config.debtScotia}
              onChange={numberField(config, setConfig, "debtScotia", 0)}
            />
          </label>
          <label>
            Amex
            <input
              type="number"
              step="0.01"
              value={config.debtAmex}
              onChange={numberField(config, setConfig, "debtAmex", 0)}
            />
          </label>
        </div>
        <p className="muted">
          Safe to spend now: {hideNumbers ? "$••••••" : `$${result.b.safeToSpend.toFixed(2)}`}
        </p>
      </section>

      <section className="panel">
        <div className="button-row">
          <button
            className="apply-button"
            onClick={onApplyDebtPayment}
            disabled={!result.debtMode || result.b.debtPayment <= 0}
          >
            Apply This Paycheck B Debt Payment
          </button>
          <button className="ghost" onClick={onResetDefaults}>
            Reset Defaults
          </button>
        </div>
      </section>
    </main>
  );
}
