import { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

import { useCreateJob, usePublishJob, useMyAssociations, useCurrentUser } from '@/lib/api-hooks';
import { jobCreateSchema, type JobCreateFormData } from '@/lib/validations/jobs';

const JobCreatePage = () => {
  const navigate = useNavigate();
  const createJobMutation = useCreateJob();
  const publishJobMutation = usePublishJob();
  const { data: currentUserData } = useCurrentUser();
  const { data: associations, isLoading: associationsLoading } = useMyAssociations();

  const [workType, setWorkType] = useState<string>('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<JobCreateFormData>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      currency: 'INR',
      assignment_mode: 'open',
      payment_type: 'fixed',
      required_skills: [],
      software_preferences: [],
      deliverables: [],
      shot_breakdown: [],
      assigned_to: []
    }
  });

  const assignmentMode = watch('assignment_mode');
  const currentUserId = currentUserData?.user?.id;

  // Extract association members (other users, not the current user)
  const associationMembers = useMemo(() => {
    if (!associations || !currentUserId) return [];

    const membersMap = new Map<string, { id: string; name: string; email: string }>();

    associations.forEach((association) => {
      // Get the other user (not the current user)
      const otherUser = 
        association.requester._id === currentUserId 
          ? association.recipient 
          : association.requester;

      // Use name if available, otherwise use email
      const displayName = 
        otherUser.name || 
        otherUser.email || 
        'Unknown User';

      // Avoid duplicates
      if (!membersMap.has(otherUser._id)) {
        membersMap.set(otherUser._id, {
          id: otherUser._id,
          name: displayName,
          email: otherUser.email || ''
        });
      }
    });

    return Array.from(membersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [associations, currentUserId]);

  const {
    fields: shotFields,
    append: appendShot,
    remove: removeShot
  } = useFieldArray({
    control,
    name: 'shot_breakdown'
  });

  const {
    fields: deliverableFields,
    append: appendDeliverable,
    remove: removeDeliverable
  } = useFieldArray({
    control,
    name: 'deliverables'
  });

  const onSubmit = async (data: JobCreateFormData) => {
    try {
      console.log('Form data submitted:', data);
      
      // Convert comma-separated strings to arrays
      const processedData = {
        ...data,
        required_skills: data.required_skills?.length
          ? data.required_skills[0]?.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        software_preferences: data.software_preferences?.length
          ? data.software_preferences[0]?.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };

      console.log('Processed data:', processedData);
      const result = await createJobMutation.mutateAsync(processedData);

      // Auto-publish jobs that are ready
      const shouldAutoPublish =
        result.job.assignment_mode === 'open' && result.job.bid_deadline;

      if (shouldAutoPublish) {
        try {
          await publishJobMutation.mutateAsync(result.job._id);
          toast.success('project created and published successfully!');
        } catch (publishError) {
          console.warn('project created but failed to auto-publish:', publishError);
          toast.success('project created successfully! You can publish it from the job details.');
        }
      } else {
        toast.success('project created successfully!');
      }

      navigate(`/jobs/${result.job._id}`);
    } catch (error: any) {
      console.error('Error creating job:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create job';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create VFX Job</h1>
        <p className="text-muted-foreground mt-2">
          Post a new VFX project for studios and artists to bid on
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.error('Form validation errors:', errors);
        // Show first error to user
        const firstError = Object.values(errors)[0];
        if (firstError?.message) {
          toast.error(firstError.message);
        } else {
          toast.error('Please fill in all required fields');
        }
      })} className="space-y-8">
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

            <div>
              <Label htmlFor="workType">Work Type</Label>
              <Select value={workType} onValueChange={setWorkType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vfx">VFX</SelectItem>
                  <SelectItem value="animation">Animation</SelectItem>
                  <SelectItem value="motion_graphics">Motion Graphics</SelectItem>
                  <SelectItem value="compositing">Compositing</SelectItem>
                  <SelectItem value="modeling">3D Modeling</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="assignment_mode">Assignment Mode *</Label>
              <Select
                value={assignmentMode}
                onValueChange={(value) => {
                  setValue('assignment_mode', value as 'direct' | 'open');
                  // Clear assigned_to when switching to open mode
                  if (value === 'open') {
                    setValue('assigned_to', []);
                  }
                }}
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

            {assignmentMode === 'direct' && (
              <div>
                <Label htmlFor="assigned_to">Assign to Association Members *</Label>
                {associationsLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading association members...</span>
                  </div>
                ) : associationMembers.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2">
                    No association members found. You need to have accepted associations to assign jobs directly.
                  </div>
                ) : (
                  <div className="space-y-3 border rounded-md p-4 max-h-60 overflow-y-auto">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id="select-all"
                        checked={watch('assigned_to')?.length === associationMembers.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setValue('assigned_to', associationMembers.map(m => m.id));
                          } else {
                            setValue('assigned_to', []);
                          }
                        }}
                      />
                      <Label
                        htmlFor="select-all"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Select All
                      </Label>
                    </div>
                    <Separator />
                    {associationMembers.map((member) => {
                      const assignedTo = watch('assigned_to') || [];
                      const isChecked = assignedTo.includes(member.id);
                      return (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const current = watch('assigned_to') || [];
                              if (checked) {
                                setValue('assigned_to', [...current, member.id]);
                              } else {
                                setValue('assigned_to', current.filter(id => id !== member.id));
                              }
                            }}
                          />
                          <Label
                            htmlFor={`member-${member.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {member.name} {member.email && <span className="text-muted-foreground">({member.email})</span>}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}
                {errors.assigned_to && (
                  <p className="text-sm text-destructive mt-1">{errors.assigned_to.message}</p>
                )}
                {watch('assigned_to')?.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {watch('assigned_to')?.length} member{watch('assigned_to')?.length !== 1 ? 's' : ''} selected
                  </p>
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
              {  (
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

        <Separator />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/jobs')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create project
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobCreatePage;
