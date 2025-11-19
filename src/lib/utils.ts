import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AnalysisResult } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertAnalysisResultToCSV = (
  analysisResult: AnalysisResult
): string => {
  const headers = [
    "Check Type",
    "Status",
    "Expected Value",
    "Actual Value",
    "Sources Compared",
    "Notes",
    "Job ID",
    "Overall Status",
    "Created At",
  ];

  const rows = analysisResult.checks.map((check) => [
    check.check_type,
    check.status.toUpperCase(),
    check.expected,
    check.actual,
    check.sources_compared.join(" vs "),
    check.notes || "",
    analysisResult.job_id,
    analysisResult.overall_status,
    new Date(analysisResult.created_at)
      .toISOString()
      .slice(0, 19)
      .replace("T", " "),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
