import type { DropDownType } from "~/lib/types";

export const Roles: DropDownType[] = [
  { id: 1, name: "Master Admin" },
  { id: 2, name: "General Manager" },
  { id: 3, name: "Manager Account" },
  { id: 4, name: "Coordinator" },
  { id: 5, name: "Salesperson" },
];

export const Category: DropDownType[] = [
  { id: 1, name: "Product" },
  { id: 2, name: "Speciality" },
];

export const REGION_LABELS: Record<string, string> = {
  SOUTH: "South",
  EASTCOAST: "East Coast",
  NORTH: "North",
  CENTRAL: "Central",
};
