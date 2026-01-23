import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, DollarSign, Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

import { useJobs, useMyBids, useMyJobApplications, useCurrentUser } from '@/lib/api-hooks';
import { type Job, type Bid, type JobApplication } from '@/types/jobs';
import { Briefcase } from 'lucide-react';

const StudioJobsDashboard = () => {
  const navigate = useNavigate();

  const { data: currentUser } = useCurrentUser();
  const { data: postedJobs, isLoading: jobsLoading } = useJobs({ created_by_me: true });
  const { data: assignedJobs, isLoading: assignedJobsLoading } = useJobs({ assigned_to_me: true });
  const { data: myBids, isLoading: bidsLoading } = useMyBids();
  const { data: myApplications, isLoading: applicationsLoading } = useMyJobApplications();

  // Check if user can create jobs (only studios and admins)
  const canCreateJob = currentUser?.user?.roles?.includes('studio') || currentUser?.user?.roles?.includes('admin');

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

  const getJobStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'open': return 'default';
      case 'under_review': return 'secondary';
      case 'awarded': return 'outline';
      case 'in_progress': return 'secondary';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getBidStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'shortlisted': return 'default';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'withdrawn': return 'outline';
      default: return 'outline';
    }
  };

  const getBidStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'shortlisted': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default: return null;
    }
  };

  const getApplicationStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'outline';
      case 'shortlisted': return 'default';
      case 'rejected': return 'destructive';
      case 'hired': return 'default';
      default: return 'outline';
    }
  };

  const getApplicationStatusIcon = (status: string) => {
    switch (status) {
      case 'hired': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'reviewed': return <Eye className="h-4 w-4 text-blue-600" />;
      case 'shortlisted': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your posted projects and track your bids
          </p>
        </div>
        {canCreateJob && (
          <Button onClick={() => navigate('/jobs/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        )}
      </div>

      <Tabs defaultValue="posted" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posted">Posted Projects</TabsTrigger>
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
          <TabsTrigger value="bids">My Bids</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        {/* Posted Jobs Tab */}
        <TabsContent value="posted" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projects You've Posted</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : postedJobs?.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects posted yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first VFX project to start receiving bids from talented artists and studios.
                  </p>
                  <Button onClick={() => navigate('/jobs/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First project
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>project Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Shots</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {postedJobs?.map((job: Job) => (
                      <TableRow key={job._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{job.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {job.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getJobStatusBadgeVariant(job.status)}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{job.total_shots || '-'}</TableCell>
                        <TableCell>
                          {job.min_budget || job.max_budget ? (
                            <div className="text-sm">
                              {job.min_budget && job.max_budget
                                ? `${formatCurrency(job.min_budget, job.currency)} - ${formatCurrency(job.max_budget, job.currency)}`
                                : job.min_budget
                                  ? `From ${formatCurrency(job.min_budget, job.currency)}`
                                  : `Up to ${formatCurrency(job.max_budget!, job.currency)}`
                              }
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {job.final_delivery_date ? formatDate(job.final_delivery_date) : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/jobs/${job._id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assigned to Me Tab */}
        <TabsContent value="assigned" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projects Assigned to Me</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedJobsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : assignedJobs?.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects assigned to you yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Projects that are directly assigned to you will appear here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>project Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Shots</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedJobs?.map((job: Job) => (
                      <TableRow key={job._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{job.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {job.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getJobStatusBadgeVariant(job.status)}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{job.total_shots || '-'}</TableCell>
                        <TableCell>
                          {job.min_budget || job.max_budget ? (
                            <div className="text-sm">
                              {job.min_budget && job.max_budget
                                ? `${formatCurrency(job.min_budget, job.currency)} - ${formatCurrency(job.max_budget, job.currency)}`
                                : job.min_budget
                                  ? `From ${formatCurrency(job.min_budget, job.currency)}`
                                  : `Up to ${formatCurrency(job.max_budget!, job.currency)}`
                              }
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {job.final_delivery_date ? formatDate(job.final_delivery_date) : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/jobs/${job._id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Bids Tab */}
        <TabsContent value="bids" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Bids</CardTitle>
            </CardHeader>
            <CardContent>
              {bidsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : myBids?.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bids submitted yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Browse available projects and submit competitive bids to win VFX projects.
                  </p>
                  <Button onClick={() => navigate('/jobs')}>
                    Browse projects
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>project Title</TableHead>
                      <TableHead>Your Bid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myBids?.map((bid: Bid) => (
                      <TableRow key={bid._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{bid.job_id.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {bid.job_id.created_by.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(bid.amount_total, bid.currency)}
                          </div>
                          {bid.estimated_duration_days && (
                            <div className="text-sm text-muted-foreground">
                              {bid.estimated_duration_days} days
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getBidStatusIcon(bid.status)}
                            <Badge variant={getBidStatusBadgeVariant(bid.status)}>
                              {bid.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(bid.submitted_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/jobs/${bid.job_id._id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View project
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Applications Tab - For Studio Jobs */}
        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Jobs You've Applied To
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : myApplications?.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Browse available studio jobs and apply for positions that match your skills.
                  </p>
                  <Button onClick={() => navigate('/jobs')}>
                    Browse Studio Jobs
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Expected Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myApplications?.map((application: JobApplication) => (
                      <TableRow key={application._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {typeof application.job_id === 'object' ? application.job_id.title : 'Job'}
                            </p>
                            {application.cover_letter && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {application.cover_letter}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {typeof application.job_id === 'object' && application.job_id.created_by ? (
                            <span className="text-sm">
                              {typeof application.job_id.created_by === 'object' 
                                ? application.job_id.created_by.email 
                                : application.job_id.created_by}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {application.expected_salary ? (
                            <div className="font-medium">
                              {formatCurrency(application.expected_salary, application.currency)}
                              <span className="text-xs text-muted-foreground">/year</span>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getApplicationStatusIcon(application.status)}
                            <Badge variant={getApplicationStatusBadgeVariant(application.status) as any}>
                              {application.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(application.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/jobs/${typeof application.job_id === 'object' ? application.job_id._id : application.job_id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Job
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudioJobsDashboard;
