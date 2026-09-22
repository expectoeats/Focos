export const DEFAULT_CATEGORIES = [
  { name: "Job 1", icon: "briefcase", color: "#3B82F6", order: 0 },
  { name: "Job 2", icon: "briefcase", color: "#6366F1", order: 1 },
  { name: "Client Hunting", icon: "search", color: "#8B5CF6", order: 2 },
  { name: "Agency Project Development", icon: "code", color: "#A855F7", order: 3 },
  { name: "Skill Learning", icon: "book-open", color: "#EC4899", order: 4 },
  { name: "Lead Follow-up", icon: "phone", color: "#F43F5E", order: 5 },
  { name: "Break", icon: "coffee", color: "#F97316", order: 6 },
  { name: "Entertainment", icon: "tv", color: "#EAB308", order: 7 },
  { name: "Regular Tasks", icon: "list-checks", color: "#22C55E", order: 8 },
  { name: "Walking", icon: "footprints", color: "#14B8A6", order: 9 },
  { name: "Bathing", icon: "droplets", color: "#06B6D4", order: 10 },
  { name: "Brushing", icon: "sparkles", color: "#0EA5E9", order: 11 },
  { name: "Toilet", icon: "bath", color: "#64748B", order: 12 },
  { name: "Sleep", icon: "moon", color: "#1E293B", order: 13 },
  { name: "Other", icon: "more-horizontal", color: "#78716C", order: 14 },
] as const;

export const CATEGORY_ICONS = [
  "briefcase", "search", "code", "book-open", "phone", "coffee",
  "tv", "list-checks", "footprints", "droplets", "sparkles", "bath",
  "moon", "more-horizontal", "heart", "music", "gamepad-2", "dumbbell",
  "utensils", "car", "home", "graduation-cap", "users", "star",
] as const;

export const CATEGORY_COLORS = [
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#EC4899",
  "#F43F5E", "#F97316", "#EAB308", "#22C55E", "#14B8A6",
  "#06B6D4", "#0EA5E9", "#64748B", "#1E293B", "#78716C",
] as const;
