import type { Company, Employee, EpiItem } from "@/types/checklist";

export const COMPANIES: Company[] = [
  { id: "tci", name: "TCI TELECOM", cnpj: "62.968.663/0001-51", color: "amber" },
  { id: "dcf", name: "DCF TELECOM", cnpj: "62.648.872/0001-18", color: "blue" },
  { id: "new-telecom", name: "NEW TELECOM", cnpj: "19.429.134/0001-50", color: "emerald" }
];

export const EMPLOYEES: Employee[] = [
  { id: "tci-1", companyId: "tci", name: "Roberval Aparecido Silva - Bola", role: "Coordenador", registration: "TCI-001" },
  { id: "tci-2", companyId: "tci", name: "Celso Aparecido Aldevino", role: "Supervisor", registration: "TCI-002" },
  { id: "dcf-1", companyId: "dcf", name: "Amanda Souza", role: "Técnica de Campo", registration: "DCF-014" },
  { id: "dcf-2", companyId: "dcf", name: "Marcos Vinícius", role: "Fiscal", registration: "DCF-015" },
  { id: "new-1", companyId: "new-telecom", name: "Juliana Martins", role: "Líder de Operação", registration: "NEW-021" },
  { id: "new-2", companyId: "new-telecom", name: "Rafael Oliveira", role: "Instalador", registration: "NEW-022" }
];

export const EPI_CATALOG: EpiItem[] = [
  { id: "capacete", name: "Capacete", ca: "CA-1001", unit: "un", defaultQuantity: 1 },
  { id: "luva", name: "Luva de proteção", ca: "CA-1002", unit: "par", defaultQuantity: 1 },
  { id: "botina", name: "Botina", ca: "CA-1003", unit: "par", defaultQuantity: 1 },
  { id: "oculos", name: "Óculos de proteção", ca: "CA-1004", unit: "un", defaultQuantity: 1 },
  { id: "cinto", name: "Cinto de segurança", ca: "CA-1005", unit: "un", defaultQuantity: 1 },
  { id: "colete", name: "Colete refletivo", ca: "CA-1006", unit: "un", defaultQuantity: 1 }
];

export function getCompanyById(companyId: string) {
  return COMPANIES.find((company) => company.id === companyId) ?? null;
}

export function getEmployeeById(employeeId: string) {
  return EMPLOYEES.find((employee) => employee.id === employeeId) ?? null;
}

export function getEmployeesByCompany(companyId: string) {
  return EMPLOYEES.filter((employee) => employee.companyId === companyId);
}

export function getEpiById(epiId: string) {
  return EPI_CATALOG.find((item) => item.id === epiId) ?? null;
}
