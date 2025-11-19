"use client";

import { useState, useEffect } from "react";
import { Upload, CheckCircle, History, AlertCircle } from "lucide-react";

import { UploadedFile, AnalysisResult, Session } from "@/lib/types";
import {
  fetchSessions,
  createSession,
  uploadFileApi,
  startAnalysisApi,
  getAnalysisStatusApi,
  getAnalysisResultsApi,
} from "@/lib/api";

import FileUploadSection from "@/components/FileUploadSection";
import ResultsDisplay from "@/components/ResultsDisplay";
import HistoryView from "@/components/HistoryView";

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string>("idle"); // idle, processing, completed, failed
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "results" | "history">(
    "upload"
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (analysisJobId && analysisStatus === "processing") {
      interval = setInterval(async () => {
        try {
          const data = await getAnalysisStatusApi(analysisJobId);
          if (data.status === "completed") {
            setAnalysisStatus("completed");
            loadAnalysisResults();
            clearInterval(interval);
          } else if (data.status === "failed") {
            setAnalysisStatus("failed");
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Error checking analysis status:", error);
          setAnalysisStatus("failed");
          setError(
            error instanceof Error
              ? error.message
              : "Failed to check analysis status"
          );
          clearInterval(interval);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [analysisJobId, analysisStatus]);

  const loadSessions = async () => {
    try {
      setError(null);
      const data = await fetchSessions();
      setSessions(data);
    } catch (error) {
      console.error("Error loading sessions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load sessions"
      );
    }
  };

  const handleCreateSession = async () => {
    try {
      setError(null);
      const data = await createSession(
        `Session ${new Date().toISOString().slice(0, 19).replace("T", " ")}`
      );
      setCurrentSession(data.session_id);
      loadSessions();
      return data.session_id;
    } catch (error) {
      console.error("Error creating session:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create session"
      );
      return null;
    }
  };

  const handleUploadFile = async (file: File, type: UploadedFile["type"]) => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await uploadFileApi(file, type);
      setUploadedFiles((prev) => [
        ...prev,
        {
          id: data.file_id,
          filename: file.name,
          type,
        },
      ]);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleStartAnalysis = async () => {
    let sessionId = currentSession;
    setAnalysisResult(null);
    if (!sessionId) {
      sessionId = await handleCreateSession();
      if (!sessionId) return; // Failed to create session
    }

    if (uploadedFiles.length === 0) {
      console.warn("No files uploaded for analysis.");
      return;
    }

    try {
      setError(null);
      setAnalysisStatus("processing");
      setActiveTab("results");
      const data = await startAnalysisApi(
        sessionId,
        uploadedFiles.map((f) => f.id)
      );
      setAnalysisJobId(data.job_id);
    } catch (error) {
      console.error("Error starting analysis:", error);
      setAnalysisStatus("failed");
      setError(
        error instanceof Error ? error.message : "Failed to start analysis"
      );
    }
  };

  const loadAnalysisResults = async () => {
    if (!analysisJobId) return;

    try {
      setError(null);
      const data = await getAnalysisResultsApi(analysisJobId);
      setAnalysisResult(data);
      loadSessions();
    } catch (error) {
      console.error("Error loading analysis results:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load analysis results"
      );
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <header>
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-foreground">
              Manufacturing QC Cross-Check System
            </h1>
            <p className="text-muted-foreground mt-2">
              Automated validation pipeline for manufacturing documents and
              images
            </p>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: "upload", label: "Upload & Analyze", icon: Upload },
            { id: "results", label: "Results", icon: CheckCircle },
            { id: "history", label: "History", icon: History },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() =>
                setActiveTab(id as "upload" | "results" | "history")
              }
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "upload" && (
          <FileUploadSection
            uploadedFiles={uploadedFiles}
            uploadFile={handleUploadFile}
            removeFile={handleRemoveFile}
            startAnalysis={handleStartAnalysis}
            analysisStatus={analysisStatus}
            isLoading={isLoading}
          />
        )}

        {activeTab === "results" && (
          <ResultsDisplay
            analysisResult={analysisResult}
            analysisStatus={analysisStatus}
          />
        )}

        {activeTab === "history" && <HistoryView sessions={sessions} />}
      </div>
    </div>
  );
}
