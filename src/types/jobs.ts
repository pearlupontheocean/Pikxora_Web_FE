// Job-related TypeScript types matching the backend API contracts

export interface CurrentUser {
  user: {
    id: string;
    email: string;
    roles: string[];
    profile_picture?: string;
  };
  profile: {
    _id: string;
    name: string;
    email: string;
    verification_status: string;
    rating?: number;
    bio?: string;
    location?: string;
    avatar_url?: string;
    tagline?: string;
    brand_colors?: string[];
    social_links?: {
      linkedin?: string;
      twitter?: string;
      instagram?: string;
      website?: string;
      portfolio?: string;
    };
    skills?: string[];
    wall_id?: string;
  };
}

export interface User {
  _id: string;
  email: string;
  name?: string;
  profile_picture?: string;
}

export interface Movie {
  _id: string;
  title: string;
  production_year?: number;
  genre?: string;
}

export interface ShotBreakdown {
  name: string;
  shot_code?: string;
  frame_in?: number;
  frame_out?: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  movie_id?: Movie;
  job_type: 'job' | 'freelance';
  package_per_year?: number; // For Studio Jobs
  assignment_mode?: 'direct' | 'open'; // Required only for Freelance Jobs
  assigned_to?: User | User[]; // Can be single user (backward compatibility) or array of users
  payment_type: 'fixed' | 'per_shot' | 'per_frame' | 'hourly';
  currency: string;
  min_budget?: number;
  max_budget?: number;
  hourly_rate?: number;
  estimated_hours?: number;
  total_shots?: number;
  total_frames?: number;
  resolution?: string;
  frame_rate?: number;
  shot_breakdown?: ShotBreakdown[];
  required_skills: string[];
  software_preferences: string[];
  deliverables: string[];
  bid_deadline: string;
  expected_start_date?: string;
  final_delivery_date: string;
  status: 'draft' | 'open' | 'under_review' | 'awarded' | 'in_progress' | 'completed' | 'cancelled';
  notes_for_bidders?: string;
  created_by: User;
  view_count: number;
  createdAt: string;
  updatedAt: string;
}

export interface BidBreakdown {
  label: string;
  amount: number;
}

export interface Bid {
  _id: string;
  job_id: string;
  bidder_id: User;
  bidder_type: 'artist' | 'studio';
  amount_total: number;
  currency: string;
  breakdown?: BidBreakdown[];
  estimated_duration_days?: number;
  start_available_from?: string;
  notes?: string;
  included_services?: string[];
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  submitted_at: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractSummary {
  _id: string;
  job_id: {
    _id: string;
    title: string;
    status: string;
  };
  client_id: User;
  vendor_id: User;
  total_amount: number;
  currency: string;
  status: 'active' | 'completed' | 'terminated' | 'disputed';
  start_date: string;
  end_date: string;
}

export interface JobFilters {
  status?: string;
  job_type?: 'job' | 'freelance';
  assignment_mode?: string;
  payment_type?: string;
  min_budget?: number;
  max_budget?: number;
  skills?: string;
  software?: string;
  movie_id?: string;
  created_by_me?: boolean;
  assigned_to_me?: boolean;
}

export interface DiscoverProfile {
  _id: string;
  name: string;
  role: string;
  location?: string;
  verification_status: string;
  wall_id?: string;
  skills?: string[];
  avatar_url?: string;
}

export interface Profile {
  _id: string;
  name: string;
  email: string;
  role: string;
  location?: string;
  wall_id?: string;
  verification_status?: string;
}

export interface JobCreateData {
  title: string;
  description: string;
  movie_id?: string;
  job_type: 'job' | 'freelance';
  package_per_year?: number; // For Studio Jobs
  assignment_mode?: 'direct' | 'open'; // Required only for Freelance Jobs
  assigned_to?: string | string[]; // Can be single user ID or array of user IDs
  payment_type: 'fixed' | 'per_shot' | 'per_frame' | 'hourly';
  currency: string;
  min_budget?: number;
  max_budget?: number;
  hourly_rate?: number;
  estimated_hours?: number;
  total_shots?: number;
  total_frames?: number;
  resolution?: string;
  frame_rate?: number;
  shot_breakdown?: ShotBreakdown[];
  required_skills: string[];
  software_preferences: string[];
  deliverables: string[];
  bid_deadline: string;
  expected_start_date?: string;
  final_delivery_date: string;
  notes_for_bidders?: string;
}

export interface BidCreateData {
  job_id: string;
  amount_total: number;
  currency: string;
  breakdown?: BidBreakdown[];
  estimated_duration_days?: number;
  start_available_from?: string;
  notes?: string;
  included_services?: string[];
}

export interface BidStatusUpdate {
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  notes?: string;
}

// Job Application types for Studio Jobs
export interface JobApplication {
  _id: string;
  job_id: Job | string;
  applicant_id: User;
  applicant_profile?: {
    _id: string;
    name: string;
    title?: string;
    location?: string;
    skills?: string[];
    experience?: string;
    rating?: number;
    avatar_url?: string;
    user_id: string;
  };
  applicant_email: string;
  applicant_phone: string;
  cover_letter?: string;
  expected_salary?: number;
  currency: string;
  notice_period: 'immediate' | '15_days' | '30_days' | '60_days' | '90_days';
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationCreateData {
  job_id: string;
  applicant_email: string;
  applicant_phone: string;
  cover_letter?: string;
  expected_salary?: number;
  currency?: string;
  notice_period?: 'immediate' | '15_days' | '30_days' | '60_days' | '90_days';
}

export interface JobApplicationStatusUpdate {
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  notes?: string;
}
