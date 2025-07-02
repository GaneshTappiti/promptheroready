
export type InvestorStatus = 'interested' | 'follow-up' | 'to-contact' | 'rejected' | 'committed';

export interface Investor {
  id: number;
  name: string;
  focus: string;
  portfolio: number;
  stage: string;
  lastMeeting: string;
  status: InvestorStatus;
  logo?: string;
  contacts?: Contact[];
  notes?: string;
}

export interface Contact {
  id: number;
  date: string;
  type: 'call' | 'email' | 'meeting' | 'other';
  notes: string;
  outcome: string;
}

export interface FundingRound {
  id: number;
  name: string;
  target: string;
  raised: string;
  progress: number;
  investors: number;
  status: 'active' | 'planned' | 'completed';
  timeline?: string;
}

// Form input types for new entries (without id)
export interface InvestorInput extends Omit<Investor, 'id'> {}
export interface FundingRoundInput extends Omit<FundingRound, 'id'> {}
