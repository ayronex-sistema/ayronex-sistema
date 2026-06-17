export type CompanyOption = {
  id: "TCI" | "DCF" | "NEW_TELECOM";
  label: string;
  cnpj: string;
};

export type EmployeeOption = {
  id: string;
  companyId: CompanyOption["id"];
  label: string;
  role: string;
};

export type EpiOption = {
  id: string;
  label: string;
  ca: string;
};

export const COMPANIES: CompanyOption[] = [
  { id: "TCI", label: "TCI TELECOM", cnpj: "62.968.663/0001-51" },
  { id: "DCF", label: "DCF TELECOM", cnpj: "62.648.872/0001-18" },
  { id: "NEW_TELECOM", label: "NEW TELECOM", cnpj: "19.429.134/0001-50" }
];

export const EMPLOYEES: EmployeeOption[] = [
  { id: "tci-1", companyId: "TCI", label: "Roberval Aparecido Silva - Bola", role: "Coordenador" },
  { id: "tci-2", companyId: "TCI", label: "Celso Aparecido Aldevino", role: "Supervisor" },
  { id: "dcf-1", companyId: "DCF", label: "Amanda Souza", role: "Técnica de Campo" },
  { id: "dcf-2", companyId: "DCF", label: "Marcos Vinícius", role: "Fiscal" },
  { id: "new-1", companyId: "NEW_TELECOM", label: "Juliana Martins", role: "Líder de Operação" },
  { id: "new-2", companyId: "NEW_TELECOM", label: "Rafael Oliveira", role: "Instalador" }
];

export const EPI_OPTIONS: EpiOption[] = [
  { id: "capacete", label: "Capacete", ca: "CA-1001" },
  { id: "luva", label: "Luva de proteção", ca: "CA-1002" },
  { id: "botina", label: "Botina", ca: "CA-1003" },
  { id: "oculos", label: "Óculos de proteção", ca: "CA-1004" },
  { id: "cinto", label: "Cinto de segurança", ca: "CA-1005" },
  { id: "colete", label: "Colete refletivo", ca: "CA-1006" }
];

export function employeesByCompany(companyId: CompanyOption["id"]) {
  return EMPLOYEES.filter((employee) => employee.companyId === companyId);
}
