export interface SkillGapItem {
  id: string;
  name: string;
  category: "Languages" | "Frameworks" | "Databases" | "Cloud/DevOps" | "Architecture";
  status: "Matched" | "Missing" | "Partial";
  matchPercentage: number;
}

export interface KeywordDensityItem {
  keyword: string;
  requiredCount: number;
  resumeCount: number;
  status: "Optimal" | "Low" | "Missing";
}

export interface AIRewriteItem {
  id: string;
  section: string;
  originalText: string;
  suggestedText: string;
  impactScore: string;
}

export interface MatchReport {
  id: string;
  candidateName: string;
  targetRole: string;
  companyName: string;
  overallScore: number;
  verdict: string;
  highPriorityAdvice: string;
  skills: SkillGapItem[];
  keywords: KeywordDensityItem[];
  rewrites: AIRewriteItem[];
}
