import React from "react";
import { Download } from "lucide-react";
import { Session, AnalysisResult } from "@/lib/types";
import { convertAnalysisResultToCSV, downloadCSV } from "@/lib/utils";

interface HistoryViewProps {
  sessions: Session[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PASS":
      return "text-green-600 bg-green-100";
    case "WARNING":
      return "text-yellow-600 bg-yellow-100";
    case "FAIL":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const handleDownloadCSV = (analysisResult: AnalysisResult) => {
  const csvContent = convertAnalysisResultToCSV(analysisResult);
  const filename = `analysis_results_${analysisResult.job_id}_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(csvContent, filename);
};

const HistoryView: React.FC<HistoryViewProps> = ({ sessions }) => {
  return (
    <div className="rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4">Session History</h2>
      {sessions.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No sessions found</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">
                  {session.name || `Session ${session.id.slice(0, 8)}`}
                </h3>
                <span className="text-sm text-gray-500">
                  {new Date(session.created_at)
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " ")}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {session.analysis_jobs.length} analysis job(s)
              </div>
              {session.analysis_jobs.map((job) => (
                <div
                  key={job.job_id}
                  className="mt-2 p-3 bg-gray-50 rounded text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span>Job {job.job_id.slice(0, 8)}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStatusColor(job.overall_status)}`}
                      >
                        {job.overall_status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownloadCSV(job)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                      title="Download CSV Report"
                    >
                      <Download className="w-3 h-3" />
                      CSV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
