"use client";

import { createContext, ReactNode, useContext } from "react";

type FormStateValue = {
  activeStep: number;
  setActiveStep: (index: number) => void;
  isMultiStep: boolean;
  setIsMultiStep: (value: boolean) => void;
};

const FormStateContext = createContext<FormStateValue | undefined>(undefined);

export function FormStateProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: FormStateValue;
}) {
  return <FormStateContext.Provider value={value}>{children}</FormStateContext.Provider>;
}

export function useFormState() {
  const context = useContext(FormStateContext);
  if (!context) {
    throw new Error("useFormState must be used within a FormStateProvider");
  }
  return context;
}
