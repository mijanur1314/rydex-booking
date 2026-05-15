export const KYC_STATUS = {
  pending: {
    label: "Pending",
    pill: "bg-amber-50 text-amber-800 border border-amber-200",
    dot: "bg-amber-500",
  },
  in_progress: {
    label: "In Progress",
    pill: "bg-blue-50 text-blue-800 border border-blue-200",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Completed",
    pill: "bg-green-50 text-green-800 border border-green-200",
    dot: "bg-green-500",
  },
} as const;

export const AVATAR_COLORS = [
  "bg-purple-100 text-purple-800",
  "bg-teal-100 text-teal-800",
  "bg-blue-100 text-blue-800",
  "bg-pink-100 text-pink-800",
];

export const KPI_CONFIG = {
  totalVendors: {
    iconBg: "bg-purple-50",
    iconColor: "text-purple-700",
    cardHover: "hover:shadow-purple-100/60",
  },
  approved: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-800",
    cardHover: "hover:shadow-blue-100/60",
  },
  pending: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-800",
    cardHover: "hover:shadow-amber-100/60",
  },
  rejected: {
    iconBg: "bg-red-50",
    iconColor: "text-red-800",
    cardHover: "hover:shadow-red-100/60",
  },
} as const;
