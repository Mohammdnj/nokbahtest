"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { api } from "@/lib/api";
import type { ContractFormData } from "@/lib/contract-schema";

interface ContractContextType {
  contractId: number | null;
  contractNumber: string | null;
  currentStep: number;
  data: ContractFormData;
  isLoading: boolean;
  error: string | null;
  setStep: (step: number) => void;
  updateData: (patch: Partial<ContractFormData>) => void;
  createDraft: () => Promise<void>;
  saveStep: (step: number, stepData: Record<string, unknown>) => Promise<void>;
  loadDraft: (id: number) => Promise<void>;
  submitContract: () => Promise<{ contract_number: string; total_fees: number }>;
  reset: () => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function ContractProvider({ children }: { children: ReactNode }) {
  const [contractId, setContractId] = useState<number | null>(null);
  const [contractNumber, setContractNumber] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ContractFormData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateData = useCallback((patch: Partial<ContractFormData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const createDraft = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post("contracts/commercial/create", {});
      const body = res.data ?? res;
      setContractId(body.contract_id);
      setContractNumber(body.contract_number);
      setCurrentStep(body.current_step ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إنشاء العقد");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveStep = useCallback(
    async (step: number, stepData: Record<string, unknown>) => {
      if (!contractId) throw new Error("No contract draft");
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.put("contracts/commercial/save-step", {
          contract_id: contractId,
          step,
          data: stepData,
        });
        const body = res.data ?? res;
        setCurrentStep(body.current_step);
        updateData(stepData as Partial<ContractFormData>);
      } catch (err) {
        setError(err instanceof Error ? err.message : "فشل الحفظ");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [contractId, updateData]
  );

  const loadDraft = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`contracts/commercial/get?contract_id=${id}`);
      const body = res.data ?? res;
      setContractId(body.id);
      setContractNumber(body.contract_number);
      setCurrentStep(body.current_step);
      setData(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحميل العقد");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitContract = useCallback(async () => {
    if (!contractId) throw new Error("No contract draft");
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post("contracts/commercial/submit", { contract_id: contractId });
      const body = res.data ?? res;
      return { contract_number: body.contract_number, total_fees: body.total_fees };
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إرسال العقد");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  const reset = useCallback(() => {
    setContractId(null);
    setContractNumber(null);
    setCurrentStep(1);
    setData({});
    setError(null);
  }, []);

  return (
    <ContractContext.Provider
      value={{
        contractId,
        contractNumber,
        currentStep,
        data,
        isLoading,
        error,
        setStep: setCurrentStep,
        updateData,
        createDraft,
        saveStep,
        loadDraft,
        submitContract,
        reset,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}

export function useContract() {
  const ctx = useContext(ContractContext);
  if (!ctx) throw new Error("useContract must be used inside ContractProvider");
  return ctx;
}
