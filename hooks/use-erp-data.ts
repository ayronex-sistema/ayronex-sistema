"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultErpData } from "@/lib/defaults";
import type { ConectaCode, Employee, ErpData, FinanceEntry, ProductionRecord, VrRecord } from "@/lib/types";

const STORAGE_KEY = "ayronex-erp-v1";

export function useErpData() {
  const [data, setData] = useState<ErpData>(() => {
    if (typeof window === "undefined") {
      return defaultErpData;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultErpData, ...JSON.parse(stored) } : defaultErpData;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const addProduction = useCallback((record: ProductionRecord) => {
    setData((current) => ({ ...current, production: [record, ...current.production] }));
  }, []);

  const updateProduction = useCallback((record: ProductionRecord) => {
    setData((current) => ({
      ...current,
      production: current.production.map((item) => (item.id === record.id ? record : item)),
    }));
  }, []);

  const addConectaCode = useCallback((code: ConectaCode) => {
    setData((current) => ({ ...current, conectaCodes: [code, ...current.conectaCodes] }));
  }, []);

  const addFinanceEntry = useCallback((entry: FinanceEntry) => {
    setData((current) => ({ ...current, finance: [entry, ...current.finance] }));
  }, []);

  const updateFinanceEntry = useCallback((entry: FinanceEntry) => {
    setData((current) => ({
      ...current,
      finance: current.finance.map((item) => (item.id === entry.id ? entry : item)),
    }));
  }, []);

  const addVrRecord = useCallback((record: VrRecord) => {
    setData((current) => ({ ...current, vr: [record, ...current.vr] }));
  }, []);

  const addEmployee = useCallback((employee: Employee) => {
    setData((current) => ({ ...current, employees: [employee, ...current.employees] }));
  }, []);

  const updateEmployee = useCallback((employee: Employee) => {
    setData((current) => ({
      ...current,
      employees: current.employees.map((item) => (item.id === employee.id ? employee : item)),
    }));
  }, []);

  return useMemo(
    () => ({
      data,
      addProduction,
      updateProduction,
      addConectaCode,
      addFinanceEntry,
      updateFinanceEntry,
      addVrRecord,
      addEmployee,
      updateEmployee,
    }),
    [
      addConectaCode,
      addEmployee,
      addFinanceEntry,
      addProduction,
      addVrRecord,
      data,
      updateEmployee,
      updateFinanceEntry,
      updateProduction,
    ],
  );
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
