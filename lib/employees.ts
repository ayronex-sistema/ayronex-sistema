import type { Employee, EmployeeStatus } from "./types";

export const EMPLOYEE_SHEET_ID = "1yjjLP0A3EhmA5XAnyP4Wu8F1uX9K0tV4vPKd58Spv1E";
export const EMPLOYEE_SHEET_GID = "1028005950";
export const EMPLOYEE_SHEET_NAME = "CADASTRO FUNCIONARIOS-2026";

export const employeeColumns = [
  { key: "re", label: "RE" },
  { key: "situacao", label: "Situação" },
  { key: "funcionario", label: "Funcionário" },
  { key: "cargo", label: "Cargo" },
  { key: "seguimento", label: "Seguimento" },
  { key: "equipe", label: "Equipe" },
  { key: "projeto", label: "Projeto" },
  { key: "vrDia", label: "R$ VR Dia" },
  { key: "vt", label: "R$ VT" },
  { key: "salario", label: "Salário" },
  { key: "clt", label: "CLT" },
  { key: "carro", label: "Carro" },
  { key: "placa", label: "Placa" },
  { key: "admissao", label: "Admissão" },
  { key: "vencimentoContrato45", label: "Contrato 45 dias" },
  { key: "vencimentoContrato90", label: "Contrato 90 dias" },
  { key: "eSocial", label: "E-social" },
  { key: "cracha", label: "Crachá" },
  { key: "cartaoVrVa", label: "Cartão VR/VA" },
  { key: "cpf", label: "CPF" },
  { key: "rg", label: "RG" },
  { key: "nomeMae", label: "Nome mãe" },
  { key: "nomePai", label: "Nome pai" },
  { key: "dataNascimento", label: "Nascimento" },
  { key: "enderecoCompleto", label: "Endereço completo" },
  { key: "nrs1035", label: "NRS 10/35" },
  { key: "vencimentoNrs", label: "Vencimento NRS" },
  { key: "possuiNrs", label: "Possui NRS?" },
  { key: "nrsVencido", label: "NRS vencido?" },
  { key: "feriasVencidas", label: "Férias vencidas?" },
  { key: "podeTirarFerias", label: "Pode tirar férias?" },
] as const;

export function parseEmployeeSheetRows(rows: string[][]): Employee[] {
  return rows
    .slice(1)
    .filter((row) => row.some(Boolean))
    .map((row, index) => normalizeEmployeeRow(row, index))
    .filter((employee) => employee.funcionario);
}

export function normalizeEmployee(employee: Partial<Employee>, index = 0): Employee {
  const funcionario = clean(employee.funcionario ?? employee.nome);
  const legacyStatus = (employee as Partial<Employee> & { status?: string }).status;
  const situacao = normalizeStatus(employee.situacao ?? legacyStatus);

  return {
    id: clean(employee.id) || `emp-${clean(employee.re) || index + 1}`,
    re: clean(employee.re),
    situacao,
    nome: funcionario,
    funcionario,
    cargo: clean(employee.cargo),
    seguimento: clean(employee.seguimento),
    equipe: clean(employee.equipe) || "SEM EQUIPE",
    projeto: clean(employee.projeto),
    vrDia: clean(employee.vrDia),
    vt: clean(employee.vt),
    salario: clean(employee.salario),
    clt: clean(employee.clt),
    carro: clean(employee.carro),
    placa: clean(employee.placa),
    admissao: clean(employee.admissao ?? employee.dataAdmissao),
    dataAdmissao: clean(employee.dataAdmissao ?? employee.admissao),
    vencimentoContrato45: clean(employee.vencimentoContrato45),
    vencimentoContrato90: clean(employee.vencimentoContrato90),
    eSocial: clean(employee.eSocial),
    cracha: clean(employee.cracha),
    cartaoVrVa: clean(employee.cartaoVrVa),
    cpf: clean(employee.cpf),
    rg: clean(employee.rg),
    nomeMae: clean(employee.nomeMae),
    nomePai: clean(employee.nomePai),
    dataNascimento: clean(employee.dataNascimento),
    enderecoCompleto: clean(employee.enderecoCompleto),
    nrs1035: clean(employee.nrs1035),
    vencimentoNrs: clean(employee.vencimentoNrs),
    possuiNrs: clean(employee.possuiNrs),
    nrsVencido: clean(employee.nrsVencido),
    feriasVencidas: clean(employee.feriasVencidas),
    podeTirarFerias: clean(employee.podeTirarFerias),
  };
}

function normalizeEmployeeRow(row: string[], index: number): Employee {
  return normalizeEmployee(
    {
      re: row[0],
      situacao: normalizeStatus(row[1]),
      funcionario: row[2],
      cargo: row[3],
      seguimento: row[4],
      equipe: row[5],
      projeto: row[6],
      vrDia: row[7],
      vt: row[8],
      salario: row[9],
      clt: row[10],
      carro: row[11],
      placa: row[12],
      admissao: row[13],
      dataAdmissao: row[13],
      vencimentoContrato45: row[14],
      vencimentoContrato90: row[15],
      eSocial: row[16],
      cracha: row[17],
      cartaoVrVa: row[18],
      cpf: row[19],
      rg: row[20],
      nomeMae: row[21],
      nomePai: row[22],
      dataNascimento: row[23],
      enderecoCompleto: row[24],
      nrs1035: row[25],
      vencimentoNrs: row[26],
      possuiNrs: row[27],
      nrsVencido: row[28],
      feriasVencidas: row[29],
      podeTirarFerias: row[30],
    },
    index,
  );
}

function normalizeStatus(value?: string): EmployeeStatus {
  return clean(value).toUpperCase() === "INATIVO" ? "INATIVO" : "ATIVO";
}

function clean(value?: string) {
  return String(value ?? "").trim();
}
