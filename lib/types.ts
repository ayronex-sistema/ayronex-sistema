export type ProductionStatus = "OK" | "Pendente" | "Refazer";

export type ConectaCode = {
  id: string;
  description: string;
  code: string;
  points: number;
  value: number;
};

export type ProductionRecord = {
  id: string;
  date: string;
  sp: string;
  cabo: string;
  local: string;
  status: ProductionStatus;
  equipe: string;
  materiais: string[];
  conectaCodeId: string;
  conectaCode: string;
  points: number;
  value: number;
  launchedConecta: boolean;
  rawMessage: string;
};

export type FinanceEntry = {
  id: string;
  date: string;
  description: string;
  type: "Entrada" | "Saída";
  category: string;
  amount: number;
  paid: boolean;
};

export type VrRecord = {
  id: string;
  equipe: string;
  diasTrabalhados: number;
  sabados: number;
  amount: number;
};

export type ErpData = {
  conectaCodes: ConectaCode[];
  production: ProductionRecord[];
  finance: FinanceEntry[];
  vr: VrRecord[];
};
