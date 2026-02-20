"use client";

import TrendGraph from "../components/TrendGraph";
import { useBudgetStore } from "../hooks/useBudgetStore";
import { projectDebtTrend } from "../lib/budget";
import { useRouter } from "next/navigation";

function formatMoney(value: number, hidden: boolean) {
  if (hidden) return "$••••••";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function formatDate(value: Date): string {
  return value.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function DashboardPage() {
  const { config, debtBaseline, hideNumbers, setHideNumbers, result } = useBudgetStore();
  const router = useRouter();

  const trend = projectDebtTrend(config, 6);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilNext = Math.max(
    0,
    Math.ceil((result.nextPaycheckDate.getTime() - Date.now()) / msPerDay)
  );

  return (
    <main className="page dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Raqib&apos;s Budget Tracker</p>
          <h1>Dashboard</h1>
        </div>
        <div className="hero-actions">
          <button className="ghost icon-btn" onClick={() => setHideNumbers(!hideNumbers)}>
            {hideNumbers ? "Show" : "Hide"}
          </button>
          <button className="ghost icon-link" onClick={() => router.push("/settings")}>
            Settings
          </button>
        </div>
      </section>

      <section className="balance-hero">
        <p>Paycheck B Safe To Spend</p>
        <h2>{formatMoney(result.b.safeToSpend, hideNumbers)}</h2>
        <span className={`badge ${result.debtMode ? "debt" : "wealth"}`}>
          {result.debtMode ? "DEBT MODE" : "WEALTH MODE"}
        </span>
      </section>

      <section className="quick-stats">
        <article className="stat-card">
          <p className="stat-label">Debt Remaining</p>
          <p className="stat-value">{formatMoney(result.debtRemaining, hideNumbers)}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Paycheck A Safe</p>
          <p className="stat-value">{formatMoney(result.a.safeToSpend, hideNumbers)}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Paycheck B Debt Payment</p>
          <p className="stat-value">{formatMoney(result.b.debtPayment, hideNumbers)}</p>
        </article>
      </section>

      <section className="panel paycheck-dates-panel">
        <h2>Paycheck Schedule (Every 2 Weeks)</h2>
        <p className="muted">
          Last paid: {config.lastPaycheckDate} | Next paycheck:{" "}
          <strong>{formatDate(result.nextPaycheckDate)}</strong> ({daysUntilNext} days)
        </p>
        <div className="upcoming-paychecks">
          {result.upcomingPaycheckDates.map((date, index) => (
            <article key={date.toISOString()} className="upcoming-paycheck-item">
              <p className="stat-label">Paycheck {index + 1}</p>
              <p className="stat-value">{formatDate(date)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel debt-progress-panel">
        <h2>Debt Repayment Progress</h2>
        <div className="progress-meta">
          <span>Starting Debt: {formatMoney(debtBaseline, hideNumbers)}</span>
          <span>Remaining: {formatMoney(result.debtRemaining, hideNumbers)}</span>
        </div>
        <div className="debt-progress-track" aria-hidden="true">
          <div
            className="debt-progress-fill"
            style={{ width: `${result.debtProgressPct.toFixed(2)}%` }}
          />
        </div>
        <p className="muted progress-note">
          {result.debtMode && result.payoffDate
            ? `Estimated payoff in ${result.payoffWeeks} weeks (${result.payoffBPaychecks} paycheck B cycles).`
            : "Debt is fully paid off."}
        </p>
        <div className="credit-cards-grid">
          <article className="credit-card-item">
            <p className="stat-label">Scotia</p>
            <p className="card-balance">{formatMoney(config.debtScotia, hideNumbers)}</p>
          </article>
          <article className="credit-card-item">
            <p className="stat-label">Amex</p>
            <p className="card-balance">{formatMoney(config.debtAmex, hideNumbers)}</p>
          </article>
        </div>
      </section>

      <TrendGraph points={trend} hideNumbers={hideNumbers} />

      <section className="card-grid cards-2">
        <article className="panel paycheck">
          <h2>Paycheck A</h2>
          <ul>
            <li>
              <span>Total Fixed</span>
              <strong>{formatMoney(result.a.fixed, hideNumbers)}</strong>
            </li>
            <li className="safe">
              <span>Safe To Spend</span>
              <strong>{formatMoney(result.a.safeToSpend, hideNumbers)}</strong>
            </li>
          </ul>
        </article>

        <article className="panel paycheck">
          <h2>Paycheck B</h2>
          <ul>
            <li>
              <span>After Fixed</span>
              <strong>{formatMoney(result.b.afterFixed, hideNumbers)}</strong>
            </li>
            <li>
              <span>Groceries</span>
              <strong>{formatMoney(config.groceriesPerPaycheckB, hideNumbers)}</strong>
            </li>
            <li>
              <span>Debt Payment</span>
              <strong>{formatMoney(result.b.debtPayment, hideNumbers)}</strong>
            </li>
            <li className="safe">
              <span>Safe To Spend</span>
              <strong>{formatMoney(result.b.safeToSpend, hideNumbers)}</strong>
            </li>
          </ul>
        </article>
      </section>
    </main>
  );
}
