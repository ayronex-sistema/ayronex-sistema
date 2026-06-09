import type { ErpData } from "./types";

export const defaultErpData: ErpData = {
  conectaCodes: [
    {
      id: "code-install",
      description: "Instalação FTTA",
      code: "CN-FTTA-001",
      points: 1,
      value: 420,
    },
    {
      id: "code-fusion",
      description: "Fusão de fibra",
      code: "CN-FUSAO-002",
      points: 0.5,
      value: 180,
    },
    {
      id: "code-maintenance",
      description: "Manutenção corretiva",
      code: "CN-MANUT-003",
      points: 0.75,
      value: 260,
    },
  ],
  production: [],
  finance: [
    {
      id: "fin-start",
      date: new Date().toISOString().slice(0, 10),
      description: "Saldo inicial",
      type: "Entrada",
      category: "Caixa",
      amount: 12000,
      paid: true,
    },
    {
      id: "fin-rent",
      date: new Date().toISOString().slice(0, 10),
      description: "Contas fixas",
      type: "Saída",
      category: "Administrativo",
      amount: 3100,
      paid: false,
    },
  ],
  vr: [],
};
