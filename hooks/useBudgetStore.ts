"use client";

import { useEffect, useMemo, useState } from "react";
import { BudgetConfig, DEFAULT_BUDGET_CONFIG, calculateBudget } from "../lib/budget";

const CONFIG_KEY = "raqib-budget-config-v1";
const BASELINE_KEY = "raqib-budget-baseline-v1";
const HIDE_KEY = "raqib-budget-hide-v1";

export function useBudgetStore() {
  const [config, setConfig] = useState<BudgetConfig>(DEFAULT_BUDGET_CONFIG);
  const [debtBaseline, setDebtBaseline] = useState(
    DEFAULT_BUDGET_CONFIG.debtScotia + DEFAULT_BUDGET_CONFIG.debtAmex
  );
  const [hideNumbers, setHideNumbers] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(CONFIG_KEY);
    const rawBaseline = localStorage.getItem(BASELINE_KEY);
    const rawHide = localStorage.getItem(HIDE_KEY);
    if (raw) {
      try {
        setConfig({ ...DEFAULT_BUDGET_CONFIG, ...(JSON.parse(raw) as BudgetConfig) });
      } catch {}
    }
    if (rawBaseline) {
      const parsed = Number(rawBaseline);
      if (!Number.isNaN(parsed) && parsed > 0) setDebtBaseline(parsed);
    }
    if (rawHide) {
      setHideNumbers(rawHide === "1");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(BASELINE_KEY, String(debtBaseline));
  }, [debtBaseline, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(HIDE_KEY, hideNumbers ? "1" : "0");
  }, [hideNumbers, loaded]);

  const result = useMemo(() => calculateBudget(config, debtBaseline), [config, debtBaseline]);

  return {
    loaded,
    config,
    setConfig,
    debtBaseline,
    setDebtBaseline,
    hideNumbers,
    setHideNumbers,
    result
  };
}
