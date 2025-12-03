import { z } from 'zod';

export const jobCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  movie_id: z.string().optional(),
  assignment_mode: z.enum(['direct', 'open'], {
    required_error: 'Please select assignment mode',
  }),
  assigned_to: z.string().optional(),
  payment_type: z.enum(['fixed', 'per_shot', 'per_frame'], {
    required_error: 'Please select payment type',
  }),
  currency: z.string().default('INR'),
  min_budget: z.number().min(0).optional(),
  max_budget: z.number().min(0).optional(),
  total_shots: z.number().min(1).optional(),
  total_frames: z.number().min(1).optional(),
  resolution: z.string().optional(),
  frame_rate: z.number().min(1).optional(),
  shot_breakdown: z.array(z.object({
    name: z.string().min(1, 'Shot name is required'),
    shot_code: z.string().optional(),
    frame_in: z.number().min(0).optional(),
    frame_out: z.number().min(0).optional(),
    complexity: z.enum(['low', 'medium', 'high']).default('medium'),
  })).optional(),
  required_skills: z.array(z.string()).min(1, 'At least one skill is required'),
  software_preferences: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).min(1, 'At least one deliverable is required'),
  bid_deadline: z.string().min(1, 'Bid deadline is required'),
  expected_start_date: z.string().optional(),
  final_delivery_date: z.string().min(1, 'Final delivery date is required'),
  notes_for_bidders: z.string().optional(),
}).refine((data) => {
  // If assignment_mode is 'direct', assigned_to is required
  if (data.assignment_mode === 'direct' && !data.assigned_to) {
    return false;
  }
  return true;
}, {
  message: "Assigned user is required for direct assignment",
  path: ["assigned_to"],
}).refine((data) => {
  // If assignment_mode is 'open', bid_deadline is required
  if (data.assignment_mode === 'open' && !data.bid_deadline) {
    return false;
  }
  return true;
}, {
  message: "Bid deadline is required for open bidding",
  path: ["bid_deadline"],
}).refine((data) => {
  // min_budget should be less than or equal to max_budget
  if (data.min_budget && data.max_budget && data.min_budget > data.max_budget) {
    return false;
  }
  return true;
}, {
  message: "Minimum budget cannot be greater than maximum budget",
  path: ["min_budget"],
});

export const bidCreateSchema = z.object({
  job_id: z.string(),
  amount_total: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().default('INR'),
  breakdown: z.array(z.object({
    label: z.string().min(1, 'Label is required'),
    amount: z.number().min(0, 'Amount must be non-negative'),
  })).optional(),
  estimated_duration_days: z.number().min(1).optional(),
  start_available_from: z.string().optional(),
  notes: z.string().optional(),
  included_services: z.array(z.string()).optional(),
}).refine((data) => {
  // If breakdown is provided, amounts should sum to total
  if (data.breakdown && data.breakdown.length > 0) {
    const breakdownTotal = data.breakdown.reduce((sum, item) => sum + item.amount, 0);
    return Math.abs(breakdownTotal - data.amount_total) < 0.01; // Allow for small floating point differences
  }
  return true;
}, {
  message: "Breakdown amounts must sum to total amount",
  path: ["breakdown"],
});

export const bidStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'shortlisted', 'accepted', 'rejected'], {
    required_error: 'Please select a valid status',
  }),
  notes: z.string().optional(),
});

export type JobCreateFormData = z.infer<typeof jobCreateSchema>;
export type BidCreateFormData = z.infer<typeof bidCreateSchema>;
export type BidStatusUpdateFormData = z.infer<typeof bidStatusUpdateSchema>;
