import { z } from 'zod';

export const jobCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  movie_id: z.string().optional(),
  job_type: z.enum(['job', 'freelance'], {
    required_error: 'Please select job type',
  }).default('job'),
  package_per_year: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional()
  ), // For Studio Jobs
  assignment_mode: z.enum(['direct', 'open']).optional(), // Required only for freelance jobs
  assigned_to: z.array(z.string()).optional(),
  payment_type: z.enum(['fixed', 'per_shot', 'per_frame', 'hourly']).optional(), // Only for freelance
  currency: z.string().default('INR'),
  min_budget: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  max_budget: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  hourly_rate: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  estimated_hours: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  total_shots: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(1).optional()
  ),
  total_frames: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(1).optional()
  ),
  resolution: z.string().optional(),
  frame_rate: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(1).optional()
  ),
  shot_breakdown: z.array(z.object({
    name: z.string().min(1, 'Shot name is required'),
    shot_code: z.string().optional(),
    frame_in: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
    frame_out: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
    complexity: z.enum(['low', 'medium', 'high']).default('medium'),
  })).optional(),
  required_skills: z.array(z.string()).min(1, 'At least one skill is required'),
  software_preferences: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).min(1, 'At least one deliverable is required'),
  bid_deadline: z.string().optional(),
  expected_start_date: z.string().optional(),
  final_delivery_date: z.string().optional(), // Only required for freelance
  notes_for_bidders: z.string().optional(),
  status: z.enum(['draft', 'open', 'under_review', 'awarded', 'in_progress', 'completed', 'cancelled']).default('draft'),
}).refine((data) => {
  // For freelance jobs, assignment_mode is required
  if (data.job_type === 'freelance' && !data.assignment_mode) {
    return false;
  }
  return true;
}, {
  message: "Assignment mode is required for freelance jobs",
  path: ["assignment_mode"],
}).refine((data) => {
  // For studio jobs, package_per_year is required
  if (data.job_type === 'job' && !data.package_per_year) {
    return false;
  }
  return true;
}, {
  message: "Package per year is required for studio jobs",
  path: ["package_per_year"],
}).refine((data) => {
  // If assignment_mode is 'direct', assigned_to is required and must have at least one user
  if (data.assignment_mode === 'direct' && (!data.assigned_to || data.assigned_to.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "At least one association member is required for direct assignment",
  path: ["assigned_to"],
}).refine((data) => {
  // For freelance jobs, payment_type is required
  if (data.job_type === 'freelance' && !data.payment_type) {
    return false;
  }
  return true;
}, {
  message: "Payment type is required for freelance jobs",
  path: ["payment_type"],
}).refine((data) => {
  // For freelance jobs, final_delivery_date is required
  if (data.job_type === 'freelance' && !data.final_delivery_date) {
    return false;
  }
  return true;
}, {
  message: "Final delivery date is required for freelance jobs",
  path: ["final_delivery_date"],
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
}).refine((data) => {
  // For freelance jobs with hourly payment, hourly_rate and estimated_hours should be provided
  if (data.job_type === 'freelance' && data.payment_type === 'hourly') {
    if (!data.hourly_rate || !data.estimated_hours) {
      return false;
    }
  }
  return true;
}, {
  message: "Hourly rate and estimated hours are required for hourly freelance jobs",
  path: ["hourly_rate"],
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
  included_services: z.array(z.object({
    value: z.string().min(1, 'Service description is required'),
  })).optional(),
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
