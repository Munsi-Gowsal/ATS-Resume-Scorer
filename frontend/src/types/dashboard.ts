export interface ResumeScanMetric {
  id: string;
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  iconName: "FileText" | "Target" | "Award" | "Zap";
}

export interface MatchScorePoint {
  date: string;
  score: number;
  benchmark: number;
}

export interface SkillFrequencyPoint {
  skill: string;
  count: number;
  missingCount: number;
}

export interface RecentScanItem {
  id: string;
  candidateName: string;
  targetRole: string;
  company: string;
  matchScore: number;
  atsStatus: "Passed" | "Warning" | "Failed";
  date: string;
  missingSkillsCount: number;
}
