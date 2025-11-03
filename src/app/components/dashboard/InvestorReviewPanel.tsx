'use client'
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  DollarSign, 
  Calendar,
  User,
  Building2,
  Eye,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import showToast from '@/utils/showToast';

interface Application {
  id: string;
  userId: string;
  applicantName?: string;
  applicantEmail?: string;
  projectTitle: string;
  organization?: string;
  projectDescription: string;
  projectGoals: string;
  budgetAmount: number;
  duration: string;
  expectedImpact: string;
  certificates: string[];
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvestorReviewPanel: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ['allDonationApplications'],
    queryFn: async () => {
      const response = await axios.get('/api/donations/apply/investor');
      return response.data.data;
    },
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: async ({
      applicationId,
      status,
      notes,
    }: {
      applicationId: string;
      status: 'approved' | 'rejected';
      notes: string;
    }) => {
      const response = await axios.patch(`/api/donations/apply/investor/${applicationId}`, {
        status,
        reviewNotes: notes,
      });
      return response.data;
    },
    onSuccess: () => {
      showToast("Review Submitted Successfully", "success");
      queryClient.invalidateQueries({ queryKey: ['allDonationApplications'] });
      setIsDialogOpen(false);
      setSelectedApp(null);
      setReviewNotes('');
      setReviewAction(null);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message, "error")
    },
  });

  const openReviewDialog = (app: Application, action: 'approve' | 'reject') => {
    setSelectedApp(app);
    setReviewAction(action);
    setReviewNotes('');
    setIsDialogOpen(true);
  };

  const handleReviewSubmit = () => {
    if (!selectedApp || !reviewAction) return;

    if (!reviewNotes.trim()) {
      showToast("Review notes required", "error")
      return;
    }

    reviewMutation.mutate({
      applicationId: selectedApp.id,
      status: reviewAction === "approve" ? "approved" : "rejected",
      notes: reviewNotes,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const filteredApplications = (status: string) => {
    return applications?.filter(app => app.status === status) || [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Donation Applications</h1>
          <p className="text-gray-600">Review and manage funding applications</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="pending">
              Pending ({filteredApplications('pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({filteredApplications('approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({filteredApplications('rejected').length})
            </TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'rejected'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {filteredApplications(status).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">No {status} applications</p>
                  </CardContent>
                </Card>
              ) : (
                filteredApplications(status).map((app) => (
                  <Card key={app.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{app.projectTitle}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {app.applicantName || 'Applicant'}
                              </span>
                              {app.organization && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {app.organization}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </CardDescription>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium">Budget:</span>
                            <span>${app.budgetAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">Duration:</span>
                            <span>{app.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">Documents:</span>
                            <span>{app.certificates.length} file(s)</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Description:</span>
                            <span className="block mt-1 line-clamp-3">{app.projectDescription}</span>
                          </p>
                        </div>
                      </div>

                      {app.reviewNotes && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-1">Review Notes:</p>
                          <p className="text-sm text-blue-800">{app.reviewNotes}</p>
                          {app.reviewedAt && (
                            <p className="text-xs text-blue-600 mt-2">
                              Reviewed {formatDistanceToNow(new Date(app.reviewedAt), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>

                        {app.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => openReviewDialog(app, 'approve')}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openReviewDialog(app, 'reject')}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approve' ? 'Approve' : 'Reject'} Application
              </DialogTitle>
              <DialogDescription>
                Provide feedback for: {selectedApp?.projectTitle}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes *
                </label>
                <Textarea
                  placeholder={
                    reviewAction === 'approve'
                      ? 'Congratulations! Your application has been approved because...'
                      : 'Thank you for your application. Unfortunately, we cannot approve it at this time because...'
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="min-h-[150px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  These notes will be sent to the applicant via email
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={reviewMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReviewSubmit}
                disabled={reviewMutation.isPending}
                className={
                  reviewAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {reviewMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                  </>
                ) : (
                  <>
                    {reviewAction === 'approve' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Application
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Application
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default InvestorReviewPanel;
