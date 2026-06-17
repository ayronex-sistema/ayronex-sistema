export type Company = {
  id: string;
  name: string;
  cnpj: string;
  color: string;
};

export type Employee = {
  id: string;
  companyId: string;
  name: string;
  role: string;
  registration: string;
};

export type EpiItem = {
  id: string;
  name: string;
  ca: string;
  unit: string;
  defaultQuantity: number;
};

export type SelectedEpi = {
  epiId: string;
  quantity: number;
};

export type ChecklistSubmission = {
  deliveryId: string;
  companyId: string;
  employeeId: string;
  inspectorName: string;
  observations?: string;
  signature: string;
  selectedItems: SelectedEpi[];
  submittedAt: string;
  declarationAccept: boolean;
};
