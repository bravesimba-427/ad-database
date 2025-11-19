import React, { useRef, useState } from "react";
import {
  FileText,
  Image,
  FileSpreadsheet,
  Play,
  X,
  Loader2,
  Upload,
} from "lucide-react";
import { UploadedFile } from "../lib/types";

interface FileUploadSectionProps {
  uploadedFiles: UploadedFile[];
  uploadFile: (file: File, type: UploadedFile["type"]) => Promise<void>;
  removeFile: (fileId: string) => void;
  startAnalysis: () => Promise<void>;
  analysisStatus: string;
  isLoading: boolean;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  uploadedFiles,
  uploadFile,
  removeFile,
  startAnalysis,
  analysisStatus,
  isLoading,
}) => {
  const bomInputRef = useRef<HTMLInputElement>(null);
  const MAX_BOM_FILES = 4;

  // Drag and drop states
  const [dragStates, setDragStates] = useState({
    traveler: false,
    image: false,
    bom: false,
  });

  const handleBomUpload = (files: FileList | null) => {
    if (files) {
      const bomFiles = uploadedFiles.filter((file) => file.type === "bom");
      const remainingSlots = MAX_BOM_FILES - bomFiles.length;

      if (remainingSlots <= 0) return;

      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      filesToUpload.forEach((file) => {
        uploadFile(file, "bom");
      });
    }
  };

  const getFilesByType = (type: UploadedFile["type"]) => {
    return uploadedFiles.filter((file) => file.type === type);
  };

  const bomFiles = getFilesByType("bom");
  const canUploadMoreBom = bomFiles.length < MAX_BOM_FILES;

  // Check if traveler and image files are already uploaded
  const hasTraveler = getFilesByType("traveler").length > 0;
  const hasImage = getFilesByType("image").length > 0;

  // Drag and drop handlers
  const handleDragOver = (
    e: React.DragEvent,
    type: keyof typeof dragStates
  ) => {
    e.preventDefault();
    setDragStates((prev) => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (
    e: React.DragEvent,
    type: keyof typeof dragStates
  ) => {
    e.preventDefault();
    setDragStates((prev) => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e: React.DragEvent, type: UploadedFile["type"]) => {
    e.preventDefault();
    setDragStates((prev) => ({ ...prev, [type]: false }));

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (type === "bom") {
        handleBomUpload(files);
      } else {
        uploadFile(files[0], type);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">File Upload</h2>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Uploading file...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Traveler PDF Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
              hasTraveler
                ? "border-gray-200 bg-gray-50"
                : dragStates.traveler
                  ? "border-blue-500 bg-blue-50 scale-105"
                  : "border-gray-300 hover:border-blue-400"
            }`}
            onDragOver={(e) => !hasTraveler && handleDragOver(e, "traveler")}
            onDragLeave={(e) => !hasTraveler && handleDragLeave(e, "traveler")}
            onDrop={(e) => !hasTraveler && handleDrop(e, "traveler")}
          >
            {dragStates.traveler && !hasTraveler ? (
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            ) : (
              <FileText
                className={`w-12 h-12 mx-auto mb-4 ${hasTraveler ? "text-gray-300" : "text-gray-400"}`}
              />
            )}
            <h3 className="font-medium mb-2">Traveler PDF</h3>
            <p className="text-sm text-gray-500 mb-3">
              {hasTraveler
                ? "File already uploaded"
                : "Drag & drop or click to upload"}
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                e.target.files?.[0] && uploadFile(e.target.files[0], "traveler")
              }
              className="hidden"
              id="traveler-upload"
              disabled={isLoading || hasTraveler}
            />
            <label
              htmlFor="traveler-upload"
              className={`cursor-pointer ${
                isLoading || hasTraveler
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              {isLoading
                ? "Uploading..."
                : hasTraveler
                  ? "File uploaded"
                  : "Click to upload"}
            </label>
          </div>

          {/* Product Image Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
              hasImage
                ? "border-gray-200 bg-gray-50"
                : dragStates.image
                  ? "border-blue-500 bg-blue-50 scale-105"
                  : "border-gray-300 hover:border-blue-400"
            }`}
            onDragOver={(e) => !hasImage && handleDragOver(e, "image")}
            onDragLeave={(e) => !hasImage && handleDragLeave(e, "image")}
            onDrop={(e) => !hasImage && handleDrop(e, "image")}
          >
            {dragStates.image && !hasImage ? (
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            ) : (
              <Image
                className={`w-12 h-12 mx-auto mb-4 ${hasImage ? "text-gray-300" : "text-gray-400"}`}
              />
            )}
            <h3 className="font-medium mb-2">Product Image</h3>
            <p className="text-sm text-gray-500 mb-3">
              {hasImage
                ? "File already uploaded"
                : "Drag & drop or click to upload"}
            </p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) =>
                e.target.files?.[0] && uploadFile(e.target.files[0], "image")
              }
              className="hidden"
              id="image-upload"
              disabled={isLoading || hasImage}
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer ${
                isLoading || hasImage
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              {isLoading
                ? "Uploading..."
                : hasImage
                  ? "File uploaded"
                  : "Click to upload"}
            </label>
          </div>

          {/* BOM Excel Upload - Multiple Files with Max Limit */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
              dragStates.bom
                ? "border-blue-500 bg-blue-50 scale-105"
                : canUploadMoreBom
                  ? "border-gray-300 hover:border-blue-400"
                  : "border-gray-200 bg-gray-50"
            }`}
            onDragOver={(e) => handleDragOver(e, "bom")}
            onDragLeave={(e) => handleDragLeave(e, "bom")}
            onDrop={(e) => handleDrop(e, "bom")}
          >
            <div className="text-center mb-4">
              {dragStates.bom ? (
                <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              ) : (
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              )}
              <h3 className="font-medium mb-2">Excel BOM</h3>
              <p className="text-sm text-gray-500 mb-3">
                {bomFiles.length} of {MAX_BOM_FILES} files uploaded
              </p>
              <p className="text-sm text-gray-500">
                Drag & drop or click to upload
              </p>
            </div>

            <input
              ref={bomInputRef}
              type="file"
              accept=".xlsx,.xlsm"
              multiple
              onChange={(e) => handleBomUpload(e.target.files)}
              className="hidden"
              id="bom-upload"
              disabled={!canUploadMoreBom || isLoading}
            />

            <label
              htmlFor="bom-upload"
              className={`block text-center cursor-pointer ${
                canUploadMoreBom && !isLoading
                  ? "text-blue-600 hover:text-blue-700"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading
                ? "Uploading..."
                : canUploadMoreBom
                  ? "Click to upload"
                  : "Maximum files reached"}
            </label>
          </div>
        </div>
        {/* Start Analysis Button */}
        <div className="text-center mt-4">
          <button
            onClick={startAnalysis}
            disabled={
              uploadedFiles.length === 0 ||
              analysisStatus === "processing" ||
              isLoading
            }
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            <Play className="w-5 h-5" />
            <span>
              {analysisStatus === "processing"
                ? "Analyzing..."
                : "Start Analysis"}
            </span>
          </button>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {file.type === "traveler" && (
                    <FileText className="w-5 h-5 text-blue-500" />
                  )}
                  {file.type === "image" && (
                    <Image className="w-5 h-5 text-green-500" />
                  )}
                  {file.type === "bom" && (
                    <FileSpreadsheet className="w-5 h-5 text-orange-500" />
                  )}
                  <span className="font-medium">{file.filename}</span>
                  <span className="text-sm text-gray-500 capitalize">
                    ({file.type})
                  </span>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  disabled={isLoading}
                  className={`p-2 rounded-full transition-colors ${
                    isLoading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-red-500 hover:text-red-700 hover:bg-red-50"
                  }`}
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
