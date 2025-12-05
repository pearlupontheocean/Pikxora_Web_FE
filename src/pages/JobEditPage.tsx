import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import { useJob, useUpdateJob } from '@/lib/api-hooks';
import { jobCreateSchema, type JobCreateFormData } from '@/lib/validations/jobs';
import { type Job } from '@/types/jobs';

const JobEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Define allowed status transitions
  const getAllowedStatuses = (currentStatus: string) => {
    const transitions: Record<string, string[]> = {
      'draft': ['open', 'cancelled'],
      'open': ['under_review', 'cancelled'],
      'under_review': ['awarded', 'open', 'cancelled'],
      'awarded': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };
    return transitions[currentStatus] || [];
  };

  const { data: job, isLoading: jobLoading, error: jobError } = useJob(id!);
  const updateJobMutation = useUpdateJob();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<JobCreateFormData>({
    resolver: zodResolver(jobCreateSchema)
  });

  const assignmentMode = watch('assignment_mode');
  const currentStatus = useWatch({ control, name: 'status' });

  console.log('JobEditPage - Render: jobLoading', jobLoading, 'job?.assignment_mode:', job?.assignment_mode, 'assignmentMode (watched):', assignmentMode);

  const {
    fields: shotFields,
    append: appendShot,
    remove: removeShot,
    replace: replaceShots
  } = useFieldArray<JobCreateFormData, 'shot_breakdown'>({ // Explicitly type for shot_breakdown
    control,
    name: 'shot_breakdown'
  });

  const {
    fields: deliverableFields,
    append: appendDeliverable,
    remove: removeDeliverable,
    replace: replaceDeliverables
  } = useFieldArray<JobCreateFormData, 'deliverables'>({ // Explicitly type for deliverables
    control,
    name: 'deliverables'
  });

  // Populate form when job data loads
  useEffect(() => {
    if (job) {
      reset({
        title: job.title,
        description: job.description,
        movie_id: job.movie_id?._id || '',
        assignment_mode: job.assignment_mode,
        assigned_to: job.assigned_to?._id || '',
        payment_type: job.payment_type,
        currency: job.currency,
        min_budget: job.min_budget,
        max_budget: job.max_budget,
        total_shots: job.total_shots,
        total_frames: job.total_frames,
        resolution: job.resolution,
        frame_rate: job.frame_rate,
        required_skills: job.required_skills ? [job.required_skills.join(', ')] : [''],
        software_preferences: job.software_preferences ? [job.software_preferences.join(', ')] : [''],
        bid_deadline: job.bid_deadline ? new Date(job.bid_deadline).toISOString().slice(0, 10) : '',
        expected_start_date: job.expected_start_date ? new Date(job.expected_start_date).toISOString().slice(0, 10) : '',
        final_delivery_date: job.final_delivery_date ? new Date(job.final_delivery_date).toISOString().slice(0, 10) : '',
        notes_for_bidders: job.notes_for_bidders,
        status: job.status
      });

      // Handle arrays
      replaceShots(job.shot_breakdown || []);
      replaceDeliverables(job.deliverables || []);
    }
  }, [job, reset, replaceShots, replaceDeliverables]);

  const onSubmit = async (data: JobCreateFormData) => {
    try {
      // Convert comma-separated strings to arrays and filter out empty values
      const processedData: any = {
        ...data,
        required_skills: data.required_skills?.[0]
          ? data.required_skills[0].split(',').map(s => s.trim()).filter(Boolean)
          : [],
        software_preferences: data.software_preferences?.[0]
          ? data.software_preferences[0].split(',').map(s => s.trim()).filter(Boolean)
          : []
      };

      // Remove empty/undefined ObjectId fields to prevent casting errors
      const finalData: any = {};
      Object.keys(processedData).forEach(key => {
        const value = processedData[key];
        // Skip empty strings for ObjectId fields
        if ((key === 'movie_id' || key === 'assigned_to') && (value === '' || value === undefined)) {
          return;
        }
        // Include all other values
        finalData[key] = value;
      });

      // Ensure status is included
      if (processedData.status) {
        finalData.status = processedData.status;
      }

      console.log('🔍 JobEditPage - Original form data:', data);
      console.log('🔍 JobEditPage - Processed data:', processedData);
      console.log('🔍 JobEditPage - Final data being sent:', finalData);
      console.log('🔍 JobEditPage - Status field:', finalData.status);

      await updateJobMutation.mutateAsync({
        id: id!,
        data: finalData
      });

      toast.success('Job updated successfully!');
      navigate(`/jobs/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update job');
    }
  };

  if (jobLoading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Job not found</h1>
          <p className="text-muted-foreground mb-4">
            The job you're trying to edit doesn't exist or you don't have permission.
          </p>
          <Button onClick={() => navigate('/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Job</h1>
            <p className="text-muted-foreground mt-2">
              Update your job posting details
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/jobs/${id}`)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <form className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Sci-Fi Explosion VFX"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Detailed description of the VFX work required..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignment_mode">Assignment Mode *</Label>
                <Select
                  value={assignmentMode}
                  onValueChange={(value) => setValue('assignment_mode', value as 'direct' | 'open')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open for Bidding</SelectItem>
                    <SelectItem value="direct">Direct Assignment</SelectItem>
                  </SelectContent>
                </Select>
                {errors.assignment_mode && (
                  <p className="text-sm text-destructive mt-1">{errors.assignment_mode.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Job Status *</Label>
                <Controller
                  name="status"
                  control={control}
                  defaultValue={job?.status || 'draft'}
                  render={({ field }) => {
                    console.log('🔍 Status Controller field value:', field.value);
                    return (
                      <Select value={field.value} onValueChange={(value) => {
                        console.log('🔍 Status onChange called with:', value);
                        field.onChange(value);
                      }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllowedStatuses(field.value || job?.status || 'draft').map(status => (
                          <SelectItem key={status} value={status}>
                            {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            {status === 'open' && field.value === 'draft' && ' (Publish Job)'}
                          </SelectItem>
                        ))}
                        {/* Always include current status */}
                        {!getAllowedStatuses(field.value || job?.status || 'draft').includes(field.value || job?.status || 'draft') && (
                          <SelectItem value={field.value || job?.status || 'draft'}>
                            {(field.value || job?.status || 'draft').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    );
                  }}
                />
                {currentStatus === 'draft' && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Change to "Open" to publish this job for bidding
                  </p>
                )}
              </div>
            </div>

            {assignmentMode === 'direct' && (
              <div>
                <Label htmlFor="assigned_to">Assign to User ID *</Label>
                <Input
                  id="assigned_to"
                  {...register('assigned_to')}
                  placeholder="Enter user ID to assign directly"
                />
                {errors.assigned_to && (
                  <p className="text-sm text-destructive mt-1">{errors.assigned_to.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget & Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Budget & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="payment_type">Payment Type *</Label>
                <Select onValueChange={(value) => setValue('payment_type', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="per_shot">Per Shot</SelectItem>
                    <SelectItem value="per_frame">Per Frame</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_type && (
                  <p className="text-sm text-destructive mt-1">{errors.payment_type.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select defaultValue="INR" onValueChange={(value) => setValue('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="min_budget">Min Budget</Label>
                <Input
                  id="min_budget"
                  type="number"
                  {...register('min_budget', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.min_budget && (
                  <p className="text-sm text-destructive mt-1">{errors.min_budget.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="max_budget">Max Budget</Label>
              <Input
                id="max_budget"
                type="number"
                {...register('max_budget', { valueAsNumber: true })}
                placeholder="Enter maximum budget"
              />
              {errors.max_budget && (
                <p className="text-sm text-destructive mt-1">{errors.max_budget.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* VFX Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>VFX Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="resolution">Resolution</Label>
                <Input
                  id="resolution"
                  {...register('resolution')}
                  placeholder="e.g., 2K, 4K"
                />
              </div>

              <div>
                <Label htmlFor="frame_rate">Frame Rate</Label>
                <Input
                  id="frame_rate"
                  type="number"
                  {...register('frame_rate', { valueAsNumber: true })}
                  placeholder="24"
                />
              </div>

              <div>
                <Label htmlFor="total_shots">Total Shots</Label>
                <Input
                  id="total_shots"
                  type="number"
                  {...register('total_shots', { valueAsNumber: true })}
                  placeholder="5"
                />
              </div>

              <div>
                <Label htmlFor="total_frames">Total Frames</Label>
                <Input
                  id="total_frames"
                  type="number"
                  {...register('total_frames', { valueAsNumber: true })}
                  placeholder="300"
                />
              </div>
            </div>

            {/* Shot Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Shot Breakdown</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendShot({
                    name: '',
                    shot_code: '',
                    complexity: 'medium'
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shot
                </Button>
              </div>

              <div className="space-y-4">
                {shotFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div>
                        <Label>Shot Name *</Label>
                        <Input
                          {...register(`shot_breakdown.${index}.name`)}
                          placeholder="Explosion Main"
                        />
                      </div>

                      <div>
                        <Label>Shot Code</Label>
                        <Input
                          {...register(`shot_breakdown.${index}.shot_code`)}
                          placeholder="EXP_001"
                        />
                      </div>

                      <div>
                        <Label>Frame In</Label>
                        <Input
                          type="number"
                          {...register(`shot_breakdown.${index}.frame_in`, { valueAsNumber: true })}
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <Label>Frame Out</Label>
                        <Input
                          type="number"
                          {...register(`shot_breakdown.${index}.frame_out`, { valueAsNumber: true })}
                          placeholder="72"
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label>Complexity</Label>
                          <Select
                            onValueChange={(value) =>
                              setValue(`shot_breakdown.${index}.complexity`, value as 'low' | 'medium' | 'high')
                            }
                            defaultValue="medium"
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeShot(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements & Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements & Deliverables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="required_skills">Required Skills *</Label>
              <Textarea
                id="required_skills"
                {...register('required_skills.0')}
                placeholder="compositing, particles, roto (comma-separated)"
                rows={2}
              />
              {errors.required_skills && (
                <p className="text-sm text-destructive mt-1">{errors.required_skills.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="software_preferences">Software Preferences</Label>
              <Textarea
                id="software_preferences"
                {...register('software_preferences.0')}
                placeholder="Nuke, Houdini, After Effects (comma-separated)"
                rows={2}
              />
            </div>

            {/* Deliverables */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Deliverables *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendDeliverable('')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deliverable
                </Button>
              </div>

              <div className="space-y-2">
                {deliverableFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`deliverables.${index}`)}
                      placeholder="e.g., EXR sequences with Cryptomatte"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeDeliverable(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {errors.deliverables && (
                <p className="text-sm text-destructive mt-1">{errors.deliverables.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(assignmentMode === 'open' || job?.assignment_mode === 'open') && (
                <div>
                  <Label htmlFor="bid_deadline">Bid Deadline *</Label>
                  <Input
                    id="bid_deadline"
                    type="date"
                    {...register('bid_deadline')}
                  />
                  {errors.bid_deadline && (
                    <p className="text-sm text-destructive mt-1">{errors.bid_deadline.message}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="expected_start_date">Expected Start Date</Label>
                <Input
                  id="expected_start_date"
                  type="date"
                  {...register('expected_start_date')}
                />
              </div>

              <div>
                <Label htmlFor="final_delivery_date">Final Delivery Date *</Label>
                <Input
                  id="final_delivery_date"
                  type="date"
                  {...register('final_delivery_date')}
                />
                {errors.final_delivery_date && (
                  <p className="text-sm text-destructive mt-1">{errors.final_delivery_date.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes_for_bidders">Notes for Bidders</Label>
              <Textarea
                id="notes_for_bidders"
                {...register('notes_for_bidders')}
                placeholder="Additional information for potential bidders..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default JobEditPage;
