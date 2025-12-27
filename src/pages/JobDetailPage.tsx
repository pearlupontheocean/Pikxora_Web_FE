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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

import { useBidsForJob, useCreateBid, useCurrentUser, useJob, useUpdateBidStatus, useUserProfile } from '@/lib/api-hooks';
import { bidCreateSchema, type BidCreateFormData } from '@/lib/validations/jobs';
import { type Bid, type CurrentUser } from '@/types/jobs';
import { useQuery } from '@tanstack/react-query';

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Helper function to navigate back with fallback
  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/jobs');
    }
  };

  const { data: currentUser } = useCurrentUser() as { data: CurrentUser | undefined };
  const { data: job, isLoading: jobLoading, error: jobError } = useJob(id!);
  const { data: bids, isLoading: bidsLoading } = useBidsForJob(id!);
  const createBidMutation = useCreateBid();
  const updateBidStatusMutation = useUpdateBidStatus();
  
  // Updated state for bid actions in dialog
  const [selectedBidderId, setSelectedBidderId] = useState<string | null>(null);
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);
  const [viewBidderDialogOpen, setViewBidderDialogOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [acceptedBid, setAcceptedBid] = useState<Bid | null>(null);
  const [awardedBidDetailsDialogOpen, setAwardedBidDetailsDialogOpen] = useState(false);
  
  const { data: selectedBidderProfile, isLoading: selectedBidderLoading } = useUserProfile(selectedBidderId!);

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
      included_services: [], // This is correct for an array of objects if the object shape is implicitly defined by the schema, or explicitly as { value: '' } if needed by default values
    }
  });

  React.useEffect(() => {
    if (id) {
      setBidValue('job_id', id);
    }
    // Find the accepted bid when job and bids data are available
    if (job?.status === 'awarded' && bids && bids.length > 0) {
      const foundAcceptedBid = bids.find(bid => bid.status === 'accepted');
      if (foundAcceptedBid) {
        setAcceptedBid(foundAcceptedBid);
      }
    }
  }, [id, setBidValue, job, bids]);

  const {
    fields: bidBreakdownFields,
    append: appendBidBreakdown,
    remove: removeBidBreakdown
  } = useFieldArray({
    control: bidControl,
    name: 'breakdown'
  });

  const {
    fields: includedServicesFields,
    append: appendIncludedService,
    remove: removeIncludedService
  } = useFieldArray<BidCreateFormData, 'included_services'>({ // Explicitly typing useFieldArray
    control: bidControl,
    name: 'included_services'
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
        included_services: data.included_services?.map(item => item.value),
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

  // Updated handler to pass both bidder and bid ID
  const handleViewBidder = (userId: string, bidId: string) => {
    setSelectedBidderId(userId);
    setSelectedBidId(bidId);
    setViewBidderDialogOpen(true);
  };

  if (jobLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Job not found</h1>
          <p className="text-muted-foreground mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack} className="w-full sm:w-auto">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
      {/* Job Header - Reduced spacing */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-0 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base text-muted-foreground">
              <span>Posted by {job.created_by.email}</span>
              <Badge variant={getStatusBadgeVariant(job.status)} className="text-xs sm:text-sm">
                {job.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
            {canUserBid() && (
              <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full sm:w-auto flex-1 sm:flex-none">
                    Place Bid
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 sm:p-5">
                  <DialogHeader className="px-5 pt-5 pb-3 border-b">
                    <DialogTitle className="text-xl sm:text-2xl font-bold">Submit Bid for "{job.title}"</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleBidFormSubmit(handleBidSubmit)} className="px-5 pb-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount_total" className="text-sm font-medium">Total Amount *</Label>
                        <Input
                          id="amount_total"
                          type="number"
                          className="mt-1"
                          {...bidRegister('amount_total', { valueAsNumber: true })}
                        />
                        {bidErrors.amount_total && (
                          <p className="text-sm text-destructive mt-1">{bidErrors.amount_total.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                        <Input
                          id="currency"
                          className="mt-1"
                          {...bidRegister('currency')}
                          defaultValue="INR"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium">Price Breakdown</Label>
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
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              {...bidRegister(`breakdown.${index}.amount`, { valueAsNumber: true })}
                              placeholder="Amount"
                              className="w-28"
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
                        <Label htmlFor="estimated_duration_days" className="text-sm font-medium">Estimated Duration (days)</Label>
                        <Input
                          id="estimated_duration_days"
                          type="number"
                          className="mt-1"
                          {...bidRegister('estimated_duration_days', { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="start_available_from" className="text-sm font-medium">Available to Start</Label>
                        <Input
                          id="start_available_from"
                          type="date"
                          className="mt-1"
                          {...bidRegister('start_available_from')}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-sm font-medium">Proposal Notes</Label>
                      <Textarea
                        id="notes"
                        className="mt-1"
                        {...bidRegister('notes')}
                        placeholder="Describe your approach, experience, and why you're the right fit..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium">Included Services</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendIncludedService({ value: '' })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Service
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {includedServicesFields.map((field, index) => (
                          <div key={field.id} className="flex gap-2">
                            <Input
                              {...bidRegister(`included_services.${index}.value`)}
                              placeholder="Service description (e.g., Storyboarding)"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeIncludedService(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {bidErrors.included_services && (
                          <p className="text-sm text-destructive mt-1">{bidErrors.included_services.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => setBidDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={bidSubmitting} className="w-full sm:w-auto">
                        {bidSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Submit Bid
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              className="w-full sm:w-auto flex-1 sm:flex-none"
            >
              Back to Projects
            </Button>
            {isJobOwner() && (
              <Button
                size="lg"
                onClick={() => navigate(`/jobs/${id}/edit`)}
                className="w-full sm:w-auto flex-1 sm:flex-none"
              >
                Edit project
              </Button>
            )}
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          {job.description}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        {/* Job Details - Reduced spacing */}
        <div className="lg:col-span-2 space-y-4">
          {/* VFX Specifications */}
          <Card className="w-full">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-lg font-semibold">VFX Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {job.resolution && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resolution</Label>
                    <p className="font-semibold text-base">{job.resolution}</p>
                  </div>
                )}
                {job.frame_rate && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Frame Rate</Label>
                    <p className="font-semibold text-base">{job.frame_rate} fps</p>
                  </div>
                )}
                {job.total_shots && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Shots</Label>
                    <p className="font-semibold text-base">{job.total_shots}</p>
                  </div>
                )}
                {job.total_frames && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Frames</Label>
                    <p className="font-semibold text-base">{job.total_frames}</p>
                  </div>
                )}
              </div>

              {job.shot_breakdown && job.shot_breakdown.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground mb-3 block">Shot Breakdown</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {job.shot_breakdown.map((shot, index) => (
                      <div key={index} className="flex justify-between items-start p-4 bg-muted/50 hover:bg-muted rounded-xl border transition-all">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{shot.name}</p>
                          {shot.shot_code && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{shot.shot_code}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 ml-3 flex-shrink-0">
                          <Badge variant="outline" className="text-xs px-2.5 py-0.5">{shot.complexity}</Badge>
                          {shot.frame_in !== undefined && shot.frame_out !== undefined && (
                            <p className="text-xs text-muted-foreground font-mono">
                              {shot.frame_in}-{shot.frame_out}
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
          <Card className="w-full">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-lg font-semibold">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Required Skills</Label>
                <div className="flex flex-wrap gap-1.5">
                  {job.required_skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2.5 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {job.software_preferences && job.software_preferences.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Software Preferences</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {job.software_preferences.map((software, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-2.5 py-1">
                        {software}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Deliverables</Label>
                <ul className="space-y-2 mt-2 pl-5 list-disc">
                  {job.deliverables.map((deliverable, index) => (
                    <li key={index} className="text-sm">
                      <span className="break-words">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Reduced spacing */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
          {/* Budget & Schedule */}
          <Card className="w-full">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-lg font-semibold">Budget & Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Payment Type</Label>
                <p className="font-semibold text-base capitalize">{job.payment_type.replace('_', ' ')}</p>
              </div>

              {(job.min_budget || job.max_budget) && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Budget Range</Label>
                  <p className="font-semibold text-lg break-words">
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Bid Deadline</Label>
                  <p className="font-semibold text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatDate(job.bid_deadline)}
                  </p>
                </div>
              )}

              {job.final_delivery_date && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Final Delivery</Label>
                  <p className="font-semibold text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(job.final_delivery_date)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Awarded Job Details (for job owner) */}
          {isJobOwner() && job.status === 'awarded' && (
            <Card className="w-full cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setAwardedBidDetailsDialogOpen(true)}>
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-lg font-semibold">Awarded Bid Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {acceptedBid ? (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Awarded Bidder</Label>
                      <p className="font-medium text-sm">{acceptedBid.bidder_id.name || acceptedBid.bidder_id.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Bid Amount</Label>
                      <p className="font-semibold text-lg">
                        {formatCurrency(acceptedBid.amount_total, acceptedBid.currency)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">Click to view full details</p>
                  </>
                ) : (
                  <p className="text-muted-foreground">No accepted bid found for this job.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Enhanced Bids Management - Compact list with scroll */}
          {isJobOwner() && job.status === 'open' && bids && bids.length > 0 && (
            <Card className="w-full">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  Bid Management
                  <Badge variant="secondary" className="text-xs">
                    {bids.length} bid{bids.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {bidsLoading ? (
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto pr-2">
                    <div className="divide-y divide-border">
                      {bids.map((bid: Bid) => (
                        <button
                          key={bid._id}
                          type="button"
                          onClick={() => handleViewBidder(bid.bidder_id._id, bid._id)}
                          className="w-full text-left p-3 hover:bg-muted/60 transition-colors flex items-center justify-between gap-3 group"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate group-hover:text-primary">
                              {bid.bidder_id.email}
                            </p>
                            {bid.bidder_id.name && (
                              <p className="text-xs text-muted-foreground truncate">
                                {bid.bidder_id.name}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <p className="text-base font-bold text-primary">
                              {formatCurrency(bid.amount_total, bid.currency)}
                            </p>
                            <Badge
                              variant={getStatusBadgeVariant(bid.status)}
                              className="text-[11px] px-2 py-0.5 font-medium"
                            >
                              {bid.status}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Enhanced Bidder Details Dialog with Actions */}
      <Dialog open={viewBidderDialogOpen} onOpenChange={setViewBidderDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="px-5 pt-5 pb-3 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-xl font-bold">Bidder Profile</DialogTitle>
          </DialogHeader>
          {selectedBidderId ? (selectedBidderLoading ? (
            <div className="p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : selectedBidderProfile ? (
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</Label>
                <p className="font-semibold text-base">{selectedBidderProfile.user.email}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</Label>
                <p className="font-semibold text-base capitalize">{selectedBidderProfile.user.roles?.[0] || 'N/A'}</p>
              </div>
              
              {selectedBidderProfile.profile?.name && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</Label>
                  <p className="font-semibold text-base">{selectedBidderProfile.profile.name}</p>
                </div>
              )}
              
              {selectedBidderProfile.profile?.rating !== undefined && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rating</Label>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-black text-primary">{selectedBidderProfile.profile.rating.toFixed(1)}</p>
                    <span className="text-lg font-semibold text-muted-foreground">/ 5.0</span>
                  </div>
                </div>
              )}
              
              {selectedBidderProfile.profile?.skills && selectedBidderProfile.profile.skills.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Skills</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBidderProfile.profile.skills.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs px-2.5 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedBidderProfile.profile?.wall_id && (
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Portfolio Wall</Label>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-base font-semibold justify-start text-primary hover:text-primary/90"
                    onClick={() => {
                      navigate(`/wall/${selectedBidderProfile.profile?.wall_id}`);
                      setViewBidderDialogOpen(false);
                    }}
                  >
                    View Portfolio Wall →
                  </Button>
                </div>
              )}
              
              {selectedBidderProfile.profile?.bio && (
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bio</Label>
                  <p className="text-sm leading-relaxed text-muted-foreground max-h-24 overflow-y-auto">
                    {selectedBidderProfile.profile.bio}
                  </p>
                </div>
              )}

              {/* Bid Actions - Only shown in dialog */}
              {selectedBidId && (
                <div className="pt-3 mt-4 border-t flex flex-wrap gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateBidStatusMutation.isPending}
                    onClick={() => handleBidStatusUpdate(selectedBidId, 'shortlisted')}
                    className="h-9 px-3 text-xs"
                  >
                    Shortlist
                  </Button>
                  <Button
                    size="sm"
                    disabled={updateBidStatusMutation.isPending}
                    onClick={() => handleBidStatusUpdate(selectedBidId, 'accepted')}
                    className="h-9 px-3 text-xs"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={updateBidStatusMutation.isPending}
                    onClick={() => handleBidStatusUpdate(selectedBidId, 'rejected')}
                    className="h-9 px-3 text-xs"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="text-muted-foreground text-sm">Profile details not available.</p>
            </div>
          )) : null}
        </DialogContent>
      </Dialog>

      {/* Awarded Bid Details Dialog */}
      <Dialog open={awardedBidDetailsDialogOpen} onOpenChange={setAwardedBidDetailsDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="px-5 pt-5 pb-3 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-xl font-bold">Awarded Bid Details</DialogTitle>
          </DialogHeader>
          {acceptedBid ? (
            <div className="p-5 space-y-4">
              {/* Bidder Contact Info */}
              <div className="border-b pb-4">
                <h3 className="text-md font-semibold mb-2">Awarded Bidder</h3>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</Label>
                  <p className="font-medium text-sm">{acceptedBid.bidder_id.email}</p>
                </div>
                {acceptedBid.bidder_id.name && (
                  <div className="space-y-1 mt-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</Label>
                    <p className="font-medium text-sm">{acceptedBid.bidder_id.name}</p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Bid Amount</Label>
                <p className="font-semibold text-lg">
                  {formatCurrency(acceptedBid.amount_total, acceptedBid.currency)}
                </p>
              </div>

              {acceptedBid.breakdown && acceptedBid.breakdown.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Price Breakdown</Label>
                  <div className="space-y-2 mt-2">
                    {acceptedBid.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-muted p-3 rounded-md">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-sm font-medium">{formatCurrency(item.amount, acceptedBid.currency)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Estimated Duration</Label>
                <p className="font-medium">{acceptedBid.estimated_duration_days} days</p>
              </div>

              {acceptedBid.start_available_from && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Available to Start</Label>
                  <p className="font-medium">{formatDate(acceptedBid.start_available_from)}</p>
                </div>
              )}

              {acceptedBid.included_services && acceptedBid.included_services.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Included Services</Label>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    {acceptedBid.included_services.map((service, index) => (
                      <li key={index} className="text-sm text-foreground/90 break-words">
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {acceptedBid.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Proposal Notes</Label>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {acceptedBid.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="text-muted-foreground text-sm">No accepted bid found for this job.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDetailPage;
