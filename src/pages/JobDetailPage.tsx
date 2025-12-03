import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  Clock,
  FileText,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import React, { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

import { useBidsForJob, useCreateBid, useCurrentUser, useJob, useUpdateBidStatus } from '@/lib/api-hooks';
import { bidCreateSchema, type BidCreateFormData } from '@/lib/validations/jobs';
import { type Bid, type CurrentUser } from '@/types/jobs';

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: currentUser } = useCurrentUser() as { data: CurrentUser | undefined };
  const { data: job, isLoading: jobLoading, error: jobError } = useJob(id!);
  const { data: bids, isLoading: bidsLoading } = useBidsForJob(id!);
  const createBidMutation = useCreateBid();
  const updateBidStatusMutation = useUpdateBidStatus();


  const [bidDialogOpen, setBidDialogOpen] = useState(false);

  const {
    register: bidRegister,
    control: bidControl,
    handleSubmit: handleBidFormSubmit,
    reset: resetBidForm,
    setValue: setBidValue,
    formState: { errors: bidErrors, isSubmitting: bidSubmitting }
  } = useForm<BidCreateFormData>({
    resolver: zodResolver(bidCreateSchema),
    defaultValues: {
      job_id: id || '',
      currency: 'INR',
      breakdown: [],
      included_services: []
    }
  });

  // Set job_id when id becomes available
  React.useEffect(() => {
    if (id) {
      setBidValue('job_id', id);
    }
  }, [id, setBidValue]);

  const {
    fields: bidBreakdownFields,
    append: appendBidBreakdown,
    remove: removeBidBreakdown
  } = useFieldArray({
    control: bidControl,
    name: 'breakdown'
  });

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'shortlisted': return 'default';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'withdrawn': return 'outline';
      default: return 'outline';
    }
  };

  const canUserBid = () => {
    if (!currentUser || !currentUser.user || !currentUser.user.roles || !job) return false;
    return (currentUser.user.roles.includes('artist') || currentUser.user.roles.includes('studio')) &&
           job.status === 'open' &&
           job.assignment_mode === 'open' &&
           job.created_by._id !== currentUser.user.id;
  };

  const isJobOwner = () => {
    if (!currentUser || !currentUser.user || !job) return false;
    return job.created_by._id === currentUser.user.id;
  };

  const handleBidSubmit = async (data: BidCreateFormData) => {
    try {
      // Ensure required fields are present
      const bidData = {
        job_id: data.job_id || id || '',
        amount_total: data.amount_total,
        currency: data.currency,
        breakdown: data.breakdown?.map(item => ({
          label: item.label || '',
          amount: item.amount || 0
        })),
        estimated_duration_days: data.estimated_duration_days,
        start_available_from: data.start_available_from,
        notes: data.notes,
        included_services: data.included_services
      };

      await createBidMutation.mutateAsync(bidData);
      toast.success('Bid submitted successfully!');
      setBidDialogOpen(false);
      resetBidForm();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit bid');
    }
  };

  const handleBidStatusUpdate = async (bidId: string, status: 'pending' | 'shortlisted' | 'accepted' | 'rejected') => {
    try {
      await updateBidStatusMutation.mutateAsync({
        id: bidId,
        data: { status }
      });
      toast.success(`Bid ${status} successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update bid status');
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
            The job you're looking for doesn't exist or has been removed.
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
      {/* Job Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>Posted by {job.created_by.email}</span>
              <Badge variant={getStatusBadgeVariant(job.status)}>
                {job.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            {canUserBid() && (
              <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Place Bid</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Submit Bid for "{job.title}"</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleBidFormSubmit(handleBidSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount_total">Total Amount *</Label>
                        <Input
                          id="amount_total"
                          type="number"
                          {...bidRegister('amount_total', { valueAsNumber: true })}
                        />
                        {bidErrors.amount_total && (
                          <p className="text-sm text-destructive mt-1">{bidErrors.amount_total.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Input
                          id="currency"
                          {...bidRegister('currency')}
                          defaultValue="INR"
                        />
                      </div>
                    </div>

                    {/* Bid Breakdown */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label>Price Breakdown</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendBidBreakdown({ label: '', amount: 0 })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {bidBreakdownFields.map((field, index) => (
                          <div key={field.id} className="flex gap-2">
                            <Input
                              {...bidRegister(`breakdown.${index}.label`)}
                              placeholder="Item description"
                            />
                            <Input
                              type="number"
                              {...bidRegister(`breakdown.${index}.amount`, { valueAsNumber: true })}
                              placeholder="Amount"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeBidBreakdown(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="estimated_duration_days">Estimated Duration (days)</Label>
                        <Input
                          id="estimated_duration_days"
                          type="number"
                          {...bidRegister('estimated_duration_days', { valueAsNumber: true })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="start_available_from">Available to Start</Label>
                        <Input
                          id="start_available_from"
                          type="datetime-local"
                          {...bidRegister('start_available_from')}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Proposal Notes</Label>
                      <Textarea
                        id="notes"
                        {...bidRegister('notes')}
                        placeholder="Describe your approach, experience, and why you're the right fit..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="included_services">Included Services</Label>
                      <Textarea
                        id="included_services"
                        {...bidRegister('included_services.0')}
                        placeholder="Additional services included (comma-separated)"
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setBidDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={bidSubmitting}>
                        {bidSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Submit Bid
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            <Button variant="outline" onClick={() => navigate('/jobs')}>
              Back to Jobs
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground">{job.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* VFX Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>VFX Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {job.resolution && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Resolution</Label>
                    <p className="font-medium">{job.resolution}</p>
                  </div>
                )}

                {job.frame_rate && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Frame Rate</Label>
                    <p className="font-medium">{job.frame_rate} fps</p>
                  </div>
                )}

                {job.total_shots && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Total Shots</Label>
                    <p className="font-medium">{job.total_shots}</p>
                  </div>
                )}

                {job.total_frames && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Total Frames</Label>
                    <p className="font-medium">{job.total_frames}</p>
                  </div>
                )}
              </div>

              {/* Shot Breakdown */}
              {job.shot_breakdown && job.shot_breakdown.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Shot Breakdown</Label>
                  <div className="space-y-2">
                    {job.shot_breakdown.map((shot, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{shot.name}</p>
                          {shot.shot_code && (
                            <p className="text-sm text-muted-foreground">{shot.shot_code}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{shot.complexity}</Badge>
                          {shot.frame_in !== undefined && shot.frame_out !== undefined && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Frames {shot.frame_in}-{shot.frame_out}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Required Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.required_skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              {job.software_preferences && job.software_preferences.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Software Preferences</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.software_preferences.map((software, index) => (
                      <Badge key={index} variant="outline">{software}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm text-muted-foreground">Deliverables</Label>
                <ul className="mt-2 space-y-1">
                  {job.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget & Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Budget & Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Payment Type</Label>
                <p className="font-medium capitalize">{job.payment_type.replace('_', ' ')}</p>
              </div>

              {(job.min_budget || job.max_budget) && (
                <div>
                  <Label className="text-sm text-muted-foreground">Budget Range</Label>
                  <p className="font-medium">
                    {job.min_budget && job.max_budget
                      ? `${formatCurrency(job.min_budget, job.currency)} - ${formatCurrency(job.max_budget, job.currency)}`
                      : job.min_budget
                        ? `From ${formatCurrency(job.min_budget, job.currency)}`
                        : `Up to ${formatCurrency(job.max_budget!, job.currency)}`
                    }
                  </p>
                </div>
              )}

              {job.bid_deadline && job.status === 'open' && (
                <div>
                  <Label className="text-sm text-muted-foreground">Bid Deadline</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatDate(job.bid_deadline)}
                  </p>
                </div>
              )}

              {job.final_delivery_date && (
                <div>
                  <Label className="text-sm text-muted-foreground">Final Delivery</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(job.final_delivery_date)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bids Management (for job owner) */}
          {isJobOwner() && job.status === 'open' && bids && bids.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bid Management</CardTitle>
              </CardHeader>
              <CardContent>
                {bidsLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <div className="space-y-3">
                    {bids.map((bid: Bid) => (
                      <div key={bid._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{bid.bidder_id.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(bid.amount_total, bid.currency)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(bid.status)}>
                            {bid.status}
                          </Badge>
                          <div className="flex gap-1">
                            {bid.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBidStatusUpdate(bid._id, 'shortlisted')}
                                  disabled={updateBidStatusMutation.isPending}
                                >
                                  Shortlist
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleBidStatusUpdate(bid._id, 'accepted')}
                                  disabled={updateBidStatusMutation.isPending}
                                >
                                  Accept
                                </Button>
                              </>
                            )}
                            {bid.status === 'shortlisted' && (
                              <Button
                                size="sm"
                                onClick={() => handleBidStatusUpdate(bid._id, 'accepted')}
                                disabled={updateBidStatusMutation.isPending}
                              >
                                Accept
                              </Button>
                            )}
                            {(bid.status === 'pending' || bid.status === 'shortlisted') && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleBidStatusUpdate(bid._id, 'rejected')}
                                disabled={updateBidStatusMutation.isPending}
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
