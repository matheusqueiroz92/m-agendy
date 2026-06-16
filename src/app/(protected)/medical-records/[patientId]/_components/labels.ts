import dayjs from "dayjs";

export const diagnosisStatusLabels: Record<string, string> = {
  active: "Ativo",
  resolved: "Resolvido",
  chronic: "Crônico",
};

export const followUpStatusLabels: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const formatDate = (date?: Date | null) =>
  date ? dayjs(date).format("DD/MM/YYYY") : "—";

export const formatDateTime = (date?: Date | null) =>
  date ? dayjs(date).format("DD/MM/YYYY [às] HH:mm") : "—";
