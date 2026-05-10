export const categoryMap: Record<string, string> = {
  water_supply_issue: "water",
  water: "water",

  garbage: "sanitation",
  garbage_issue: "sanitation",
  sanitation: "sanitation",

  electricity_issue: "electricity",
  electricity: "electricity",
  power: "electricity",

  road_issue: "roads",
  pothole: "roads",
  roads: "roads",

  streetlight_issue: "streetlight",
  streetlight: "streetlight",

  noise_complaint: "noise",
};
export function mapCategory(category: string | null | undefined) {
  if (!category) {
    return "other";
  }
  return categoryMap[category] || "other";
}
