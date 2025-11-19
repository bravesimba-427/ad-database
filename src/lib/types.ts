export interface UploadedFile {
  id: string;
  filename: string;
  type: 'traveler' | 'image' | 'bom';
}


export interface UploadedFile {
  id: string;
  filename: string;
  type: 'traveler' | 'image' | 'bom';
}

export interface FileCoverage {
  traveler: boolean;
  image: boolean;
  boms: number;
}

export interface ValidationCheck {
  check_type: string;
  status: 'pass' | 'warning' | 'fail';
  expected: string;
  actual: string;
  sources_compared: string[];
  notes?: string;
  is_expandable?: boolean;
  expanded_details?: {
    expected_value: string;
    actual_value: string;
  };
}

export interface AnalysisResult {
  job_id: string;
  session_id: string;
  overall_status: string;
  file_coverage: FileCoverage;
  checks: ValidationCheck[];
  created_at: string;
}

export interface Session {
  id: string;
  name?: string;
  created_at: string;
  analysis_jobs: AnalysisResult[];
}
  