import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, DollarSign, Users, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { useJobs, useCurrentUser } from '@/lib/api-hooks';
import { type JobFilters, type Job } from '@/types/jobs';

const JobsBrowsePage = () => {
  const navigate = useNavigate();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  const [filters, setFilters] = useState<JobFilters>({
    status: 'open'
  });

  const { data: jobs, isLoading, error, refetch, isFetching } = useJobs(filters);

  // Check if user is authenticated
  if (userLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to browse jobs.
          </p>
          <Button onClick={() => navigate('/auth')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({ status: 'open' });
  };

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
      case 'open': return 'default';
      case 'under_review': return 'secondary';
      case 'awarded': return 'outline';
      case 'in_progress': return 'secondary';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (error) {
    console.error('❌ Jobs API Error:', error);
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Failed to load jobs</h1>
          <p className="text-muted-foreground mb-4">
            Error: {error?.message || 'Unknown error'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Check the browser console for more details.
          </p>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">VFX Jobs</h1>
        <p className="text-muted-foreground mt-2">
          Discover VFX opportunities and find your next project
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar - NO SCROLLBAR, fixed content */}
        <div className="lg:col-span-1 lg:max-h-[calc(100vh-10rem)] pr-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="awarded">Awarded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Payment Type</label>
                <Select
                  value={filters.payment_type || 'all'}
                  onValueChange={(value) => handleFilterChange('payment_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="per_shot">Per Shot</SelectItem>
                    <SelectItem value="per_frame">Per Frame</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Skills</label>
                <Input
                  placeholder="e.g., compositing, particles"
                  value={filters.skills || ''}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Software</label>
                <Input
                  placeholder="e.g., Nuke, Houdini"
                  value={filters.software || ''}
                  onChange={(e) => handleFilterChange('software', e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List - SCROLLBAR ONLY HERE */}
        <div className="lg:col-span-3 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {jobs?.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                    <p className="text-muted-foreground mb-2">
                      Try adjusting your filters or check back later for new opportunities.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                jobs?.map((job: Job) => (
                  <Card
                    key={job._id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                          <p className="text-muted-foreground line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(job.status)}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        {job.total_shots && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {job.total_shots} shots
                          </div>
                        )}

                        {(job.min_budget || job.max_budget) && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.min_budget && job.max_budget
                              ? `${formatCurrency(job.min_budget, job.currency)} - ${formatCurrency(job.max_budget, job.currency)}`
                              : job.min_budget
                                ? `From ${formatCurrency(job.min_budget, job.currency)}`
                                : `Up to ${formatCurrency(job.max_budget!, job.currency)}`
                            }
                          </div>
                        )}

                        {job.bid_deadline && job.status === 'open' && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Bids due {formatDate(job.bid_deadline)}
                          </div>
                        )}

                        {job.final_delivery_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due {formatDate(job.final_delivery_date)}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.required_skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.required_skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.required_skills.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Posted by {job.created_by.email}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsBrowsePage;
