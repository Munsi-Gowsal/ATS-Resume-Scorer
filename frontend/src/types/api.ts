export interface DocumentMetadata {
  title: string | null;
  author: string | null;
  creator: string | null;
  producer: string | null;
  page_count: number;
  file_size_bytes: number;
  is_encrypted: boolean;
  is_corrupted: boolean;
}

export interface ResumeBlock {
  text: string;
  page_number: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  font_name: string;
  font_size: number;
  is_bold: boolean;
  is_italic: boolean;
}

export interface ParsedDocument {
  metadata: DocumentMetadata;
  blocks: ResumeBlock[];
  raw_text: string;
  cleaned_text: string;
}

export interface EducationEntry {
  school: string | null;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  gpa: string | null;
  details: string[];
}

export interface ExperienceEntry {
  company: string | null;
  title: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  bullet_points: string[];
}

export interface ProjectEntry {
  title: string | null;
  description: string | null;
  technologies: string[];
  link: string | null;
  bullet_points: string[];
}

export interface CertificationEntry {
  name: string | null;
  issuing_organization: string | null;
  date: string | null;
  link: string | null;
}

export interface LanguageEntry {
  language: string | null;
  proficiency: string | null;
}

export interface Resume {
  name: string | null;
  emails: string[];
  phone_numbers: string[];
  linkedin_urls: string[];
  github_urls: string[];
  portfolio_urls: string[];
  location: string | null;
  summary: string | null;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
}

export interface ParsedJobDescription {
  title: string | null;
  company: string | null;
  required_skills: string[];
  preferred_skills: string[];
  required_experience_years: number;
  required_degree: string | null;
  required_field_of_study: string | null;
  required_keywords: string[];
  description: string | null;
  raw_text: string | null;
}

export interface ParseJobDescriptionTextRequest {
  raw_text: string;
}

export interface SkillMatchDetails {
  required_matched: string[];
  required_missing: string[];
  preferred_matched: string[];
  preferred_missing: string[];
  extra_skills: string[];
  score: number;
}

export interface ExperienceMatchDetails {
  required_years: number;
  available_years: number;
  title_matches: string[];
  company_matches: string[];
  recent_experience_matched: boolean;
  score: number;
}

export interface EducationMatchDetails {
  meets_minimum: boolean;
  degree_matched: boolean;
  major_matched: boolean;
  institution_matched: boolean;
  candidate_highest_degree: string | null;
  required_degree: string | null;
  score: number;
}

export interface KeywordMatchDetails {
  matched_keywords: string[];
  missing_keywords: string[];
  score: number;
}

export interface MatchResult {
  overall_score: number;
  skill_score: number;
  experience_score: number;
  education_score: number;
  keyword_score: number;
  matched_skills: string[];
  missing_skills: string[];
  matched_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skill_details: SkillMatchDetails | null;
  experience_details: ExperienceMatchDetails | null;
  education_details: EducationMatchDetails | null;
  keyword_details: KeywordMatchDetails | null;
}

export interface HealthCheck {
  status: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}