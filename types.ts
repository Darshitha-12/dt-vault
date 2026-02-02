
export interface PasswordEntry {
  id: string;
  site: string;
  username: string;
  passwordHash: string; // For the demo, we store the "password" but UI masks it
  category: string;
  createdAt: number;
  strength: 'weak' | 'medium' | 'strong' | 'ultra';
}

export interface SecurityAuditResult {
  score: number;
  vulnerabilities: string[];
  recommendations: string[];
}

export enum SecurityLevel {
  ALPHA = 'ALPHA',
  BETA = 'BETA',
  GAMMA = 'GAMMA',
  DELTA = 'DELTA'
}
