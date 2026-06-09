"use client";

import { useMemo, useState } from "react";

const navigation = [
  { name: "Dashboard", icon: GridIcon, active: true },
  { name: "Serviços", icon: ToolIcon },
  { name: "Técnicos", icon: UsersIcon },
  { name: "Produção", icon: SignalIcon },
  { name: "Financeiro", icon: DollarIcon },
  { name: "Relatórios", icon: ChartIcon },
  { name: "Configurações", icon: SettingsIcon },
];

const metrics = [
  {
    label: "Faturamento Previsto",
    value: "R$ 125.400,00",
    change: "+12.5%",
    helper: "vs. mês anterior",
    icon: DollarIcon,
    positive: true,
  },
  {
    label: "Lucro Total",
    value: "R$ 78.340,00",
    change: "+8.2%",
    helper: "vs. mês anterior",
    icon: TrendIcon,
    positive: true,
  },
  {
    label: "Lucro Projetado",
    value: "R$ 47.340,00",
    change: "-2.1%",
    helper: "vs. mês anterior",
    icon: DollarIcon,
    positive: false,
  },
  {
    label: "Pontos Totais",
    value: "1.250",
    change: "+15.3%",
    helper: "pontos de produção",
    icon: SignalIcon,
    positive: true,
  },
];

const teams = [
  { name: "Equipe Norte", value: "382 pts", percent: 86 },
  { name: "Equipe Centro", value: "296 pts", percent: 67 },
  { name: "Equipe Sul", value: "248 pts", percent: 58 },
];

const statuses = [
  { label: "Validados", value: "842", border: "border-emerald-500/30" },
  { label: "Pendentes", value: "127", border: "border-yellow-500/30" },
  { label: "Com erro", value: "18", border: "border-red-500/30" },
];

type Message = {
  type: "success" | "error";
  text: string;
};

type IconProps = {
  className?: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const updatedAt = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const isExcelFile = /\.(xlsx|xls)$/i.test(selectedFile.name);

    if (!isExcelFile) {
      setFile(null);
      setMessage({ type: "error", text: "Selecione um arquivo Excel válido (.xlsx ou .xls)." });
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setMessage(null);
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (response.ok) {
        setMessage({ type: "success", text: "Sucesso! Dados integrados na planilha." });
        setFile(null);
      } else {
        setMessage({
          type: "error",
          text: data?.error || "Não foi possível enviar o arquivo. Verifique a planilha e tente novamente.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Erro de conexão com o servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 border-r border-yellow-950/70 bg-zinc-950 lg:flex lg:flex-col">
          <div className="flex h-[60px] items-center gap-3 border-b border-yellow-950/70 px-4">
            <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-700 text-black">
              <SignalIcon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold leading-none text-yellow-400">AYRONEX</p>
              <p className="mt-1.5 text-[10px] tracking-[0.18em] text-slate-400">TELECOM & FIELD</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  className={`flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition ${
                    item.active
                      ? "border border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  }`}
                >
                  <Icon className="size-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <button className="mx-3 mb-4 flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-slate-100">
            <LogoutIcon className="size-5" />
            Sair
          </button>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex min-h-[60px] flex-col gap-3 border-b border-yellow-950/70 bg-black/90 px-4 py-3 backdrop-blur-xl md:flex-row md:items-center md:justify-between lg:px-6">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-700 text-black">
                <SignalIcon className="size-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold leading-none text-yellow-400">AYRONEX</p>
                <p className="mt-1 text-[10px] tracking-[0.18em] text-slate-400">TELECOM & FIELD</p>
              </div>
            </div>

            <label className="flex h-10 w-full items-center gap-3 rounded-lg border border-white/10 bg-zinc-950 px-3 text-slate-500 md:max-w-sm">
              <SearchIcon className="size-5" />
              <input
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="Buscar serviços, técnicos..."
                type="search"
              />
            </label>

            <div className="flex items-center justify-between gap-4 md:justify-end">
              <button className="relative grid size-9 place-items-center rounded-full text-slate-400 hover:bg-white/5 hover:text-slate-100">
                <BellIcon className="size-5" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-yellow-400" />
              </button>
              <div className="hidden border-l border-white/10 pl-5 text-right sm:block">
                <p className="text-sm font-bold">Administrador</p>
                <p className="mt-1 text-xs text-slate-400">admin@ayronex.com</p>
              </div>
              <div className="grid size-10 place-items-center rounded-full bg-yellow-500/10 text-yellow-400">
                <UsersIcon className="size-5" />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-4 px-4 py-6 lg:px-6">
            <section className="col-span-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Dashboard Gerencial</h1>
                <p className="mt-2 max-w-2xl text-slate-400">
                  Visão completa e atualizada da operação em um único painel
                </p>
              </div>
              <p className="text-sm text-slate-400">
                Última atualização: <strong className="text-white">Hoje, {updatedAt}</strong>
              </p>
            </section>

            <section className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <article
                    className="rounded-xl border border-yellow-950/70 bg-zinc-950 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                    key={metric.label}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-slate-400">{metric.label}</p>
                      <div className="grid size-10 place-items-center rounded-lg bg-yellow-500/10 text-yellow-400">
                        <Icon className="size-5" />
                      </div>
                    </div>
                    <p className="mt-9 text-2xl font-extrabold tracking-tight">{metric.value}</p>
                    <p className={`mt-2 text-sm ${metric.positive ? "text-emerald-400" : "text-red-400"}`}>
                      {metric.positive ? "↗" : "↘"} {metric.change}
                      <span className="text-slate-400"> {metric.helper}</span>
                    </p>
                  </article>
                );
              })}
            </section>

            <section className="col-span-12 rounded-xl border border-yellow-950/70 bg-zinc-950 p-6 xl:col-span-8">
              <h2 className="text-lg font-bold">Faturamento Mensal</h2>
              <AreaChart />
            </section>

            <section className="col-span-12 rounded-xl border border-yellow-950/70 bg-zinc-950 p-6 xl:col-span-4">
              <h2 className="text-lg font-bold">Produção por Tipo</h2>
              <div className="grid min-h-72 place-items-center">
                <div
                  className="size-44 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at center, #09090b 0 48%, transparent 49%), conic-gradient(#d8b23d 0deg 126deg, #09090b 126deg 132deg, #f59e0b 132deg 205deg, #09090b 205deg 211deg, #3b82f6 211deg 286deg, #09090b 286deg 292deg, #22c55e 292deg 360deg)",
                  }}
                />
                <div className="flex max-w-64 flex-wrap justify-center gap-x-3 gap-y-2 text-sm text-slate-300">
                  <LegendItem color="bg-yellow-400" label="Barramento" />
                  <LegendItem color="bg-emerald-500" label="FTTA" />
                  <LegendItem color="bg-blue-500" label="Fusão" />
                  <LegendItem color="bg-orange-500" label="Manutenção" />
                </div>
              </div>
            </section>

            <section className="col-span-12 rounded-xl border border-yellow-950/70 bg-zinc-950 p-6 xl:col-span-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">Importação de Planilha</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Envie a base de funcionários para atualizar o Google Sheets.
                  </p>
                </div>
                <div className="grid size-10 place-items-center rounded-lg bg-yellow-500/10 text-yellow-400">
                  <UploadIcon className="size-5" />
                </div>
              </div>

              <form className="mt-5 grid gap-4" onSubmit={handleUpload}>
                <label className="relative grid min-h-40 cursor-pointer place-items-center rounded-xl border border-dashed border-yellow-700/50 bg-black p-6 text-center transition hover:border-yellow-400 hover:bg-yellow-500/5">
                  <input
                    accept=".xlsx, .xls"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={handleFileChange}
                    type="file"
                  />
                  <UploadIcon className="size-9 text-yellow-400" />
                  <strong className="mt-3 max-w-full break-words text-sm text-slate-100">
                    {file ? file.name : "Clique ou arraste o arquivo Excel aqui"}
                  </strong>
                  <span className="mt-1 text-xs text-slate-500">Apenas arquivos .xlsx ou .xls</span>
                </label>

                <button
                  className="h-12 rounded-lg bg-gradient-to-r from-yellow-300 to-yellow-700 font-extrabold text-black transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!file || loading}
                  type="submit"
                >
                  {loading ? "Processando..." : "Iniciar Upload para o Sheets"}
                </button>
              </form>

              {message && (
                <div
                  className={`mt-4 rounded-lg border px-4 py-3 text-sm font-bold ${
                    message.type === "success"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-red-500/40 bg-red-500/10 text-red-300"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </section>

            <section className="col-span-12 rounded-xl border border-yellow-950/70 bg-zinc-950 p-6 xl:col-span-6">
              <h2 className="text-lg font-bold">Produção por Equipe</h2>
              <div className="mt-6 grid gap-5">
                {teams.map((team) => (
                  <div className="grid gap-2" key={team.name}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <strong>{team.name}</strong>
                      <span className="text-slate-400">{team.value}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-yellow-400 to-emerald-500"
                        style={{ width: `${team.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="col-span-12 rounded-xl border border-yellow-950/70 bg-zinc-950 p-6">
              <h2 className="text-lg font-bold">Status de Lançamentos</h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {statuses.map((status) => (
                  <div className={`rounded-xl border bg-black p-5 ${status.border}`} key={status.label}>
                    <p className="text-sm text-slate-400">{status.label}</p>
                    <strong className="mt-4 block text-3xl">{status.value}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function AreaChart() {
  return (
    <svg className="mt-5 h-72 w-full" role="img" aria-label="Faturamento mensal" viewBox="0 0 760 260">
      <defs>
        <linearGradient id="goldArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d8b23d" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#d8b23d" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="greenArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[42, 91, 140, 189].map((y) => (
        <line className="stroke-slate-500/20" key={y} strokeDasharray="3 5" x1="50" x2="740" y1={y} y2={y} />
      ))}
      {[50, 188, 326, 464, 602, 740].map((x) => (
        <line className="stroke-slate-500/20" key={x} strokeDasharray="3 5" x1={x} x2={x} y1="28" y2="224" />
      ))}
      <path
        d="M50 105 C130 92 185 84 244 99 C310 117 330 128 390 100 C448 74 498 66 560 56 C630 45 692 39 740 32 L740 224 L50 224 Z"
        fill="url(#goldArea)"
      />
      <path
        d="M50 166 C128 154 186 150 244 157 C306 180 334 178 390 160 C464 136 520 138 602 124 C658 112 696 103 740 92 L740 224 L50 224 Z"
        fill="url(#greenArea)"
      />
      <path
        className="fill-none stroke-yellow-400"
        d="M50 105 C130 92 185 84 244 99 C310 117 330 128 390 100 C448 74 498 66 560 56 C630 45 692 39 740 32"
      />
      <path
        className="fill-none stroke-emerald-500"
        d="M50 166 C128 154 186 150 244 157 C306 180 334 178 390 160 C464 136 520 138 602 124 C658 112 696 103 740 92"
      />
      <line className="stroke-slate-500/40" x1="50" x2="740" y1="224" y2="224" />
      <line className="stroke-slate-500/40" x1="50" x2="50" y1="28" y2="224" />
      {["0k", "35k", "70k", "105k", "140k"].map((label, index) => (
        <text className="fill-slate-500 text-xs" key={label} x="20" y={229 - index * 49}>
          {label}
        </text>
      ))}
      {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"].map((label, index) => (
        <text className="fill-slate-500 text-xs" key={label} x={50 + index * 138} y="244">
          {label}
        </text>
      ))}
    </svg>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i className={`size-3.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function BaseIcon({ children, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

function GridIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </BaseIcon>
  );
}

function ToolIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M14.7 6.3a4.6 4.6 0 0 0-5.4 5.4L3.8 17.2a2.1 2.1 0 1 0 3 3l5.5-5.5a4.6 4.6 0 0 0 5.4-5.4l-3.1 3.1-3-3 3.1-3.1Z" />
    </BaseIcon>
  );
}

function UsersIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.85" />
      <path d="M16 3.15a4 4 0 0 1 0 7.7" />
    </BaseIcon>
  );
}

function SignalIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 13a10 10 0 0 1 14 0" />
      <path d="M8.5 16.5a5 5 0 0 1 7 0" />
      <path d="M12 20h.01" />
    </BaseIcon>
  );
}

function DollarIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
    </BaseIcon>
  );
}

function ChartIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 15v2" />
      <path d="M12 10v7" />
      <path d="M17 6v11" />
    </BaseIcon>
  );
}

function SettingsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.7 0 1.3.4 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" />
    </BaseIcon>
  );
}

function TrendIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m4 16 5-5 4 4 7-7" />
      <path d="M15 8h5v5" />
    </BaseIcon>
  );
}

function BellIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </BaseIcon>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </BaseIcon>
  );
}

function LogoutIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </BaseIcon>
  );
}

function UploadIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5" />
      <path d="M12 3v12" />
    </BaseIcon>
  );
}
