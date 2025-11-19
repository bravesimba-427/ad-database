import React, { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Info,
  Download,
} from "lucide-react";
import { AnalysisResult, ValidationCheck } from "@/lib/types";
import { convertAnalysisResultToCSV, downloadCSV } from "@/lib/utils";

interface ResultsDisplayProps {
  analysisResult: AnalysisResult | null;
  analysisStatus: string;
}

const getStatusBadge = (status: string) => {
  const baseClasses =
    "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2";

  switch (status) {
    case "pass":
      return (
        <span className={`${baseClasses} text-green-600 bg-green-100`}>
          <CheckCircle className="w-4 h-4" />
          Pass
        </span>
      );
    case "warning":
      return (
        <span className={`${baseClasses} text-yellow-600 bg-yellow-100`}>
          <AlertTriangle className="w-4 h-4" />
          Warning
        </span>
      );
    case "fail":
      return (
        <span className={`${baseClasses} text-red-600 bg-red-100`}>
          <XCircle className="w-4 h-4" />
          Fail
        </span>
      );
    case "info":
      return (
        <span className={`${baseClasses} text-blue-600 bg-blue-100`}>
          <Info className="w-4 h-4" />
          Info
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} text-gray-600 bg-gray-100`}>
          <Clock className="w-4 h-4" />
          Pending
        </span>
      );
  }
};

const AccordionRow: React.FC<{
  check: ValidationCheck;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ check, isExpanded, onToggle }) => {
  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b cursor-pointer hover:bg-gray-50"
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            <span className="font-medium text-gray-900">
              {check.check_type.replace(/_/g, " ")}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">{getStatusBadge(check.status)}</td>
        <td className="px-6 py-4">
          {check.sources_compared.length > 0 && (
            <span className="text-gray-700">
              {check.sources_compared.length === 1
                ? check.sources_compared[0]
                : `${check.sources_compared[0]} vs ${check.sources_compared[1]}`}
            </span>
          )}
        </td>
        <td className="px-6 py-4">
          <span className="text-gray-700">{check.notes || check.expected}</span>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-gray-50 w-full">
          <td colSpan={4} className="px-6 py-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-col gap-2 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Value
                </label>
                <div className="border border-gray-200 px-3 py-2 rounded-md text-gray-900">
                  {check.expanded_details?.expected_value || check.expected}
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Value
                </label>
                <div className="border border-gray-200 px-3 py-2 rounded-md text-gray-900">
                  {check.expanded_details?.actual_value || check.actual}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  analysisResult,
  analysisStatus,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const handleDownloadCSV = () => {
    if (analysisResult) {
      const csvContent = convertAnalysisResultToCSV(analysisResult);
      const filename = `analysis_results_${analysisResult.job_id}_${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCSV(csvContent, filename);
    }
  };

  // Mock data to demonstrate the accordion functionality

  // Use mock data for now, or analysisResult.checks if available
  const checks = analysisResult?.checks || [];

  return (
    <div className="space-y-6">
      {analysisStatus === "processing" && (
        <div className="rounded-lg shadow-sm border p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Analysis in Progress</h3>
          <p className="text-gray-600">
            Please wait while we validate your documents...
          </p>
        </div>
      )}

      {checks.length > 0 && (
        <div className="rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Validation Results
              </h3>
              {analysisResult && (
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  title="Download CSV Report"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comparision
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {checks.map((check, index) => (
                  <AccordionRow
                    key={index}
                    check={check}
                    isExpanded={expandedRows.has(index)}
                    onToggle={() => toggleRow(index)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {analysisStatus !== "processing" && checks.length === 0 && (
        <div className="rounded-lg shadow-sm border p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">No checks found</h3>
          <p className="text-gray-600">
            Please upload a document to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
