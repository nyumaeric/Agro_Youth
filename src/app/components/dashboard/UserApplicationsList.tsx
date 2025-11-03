
'use client';
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  DollarSign, 
  Calendar,
  Building2,
  Eye,
  Trash2,
  Loader2,
  ExternalLink,
  AlertCircle,
  Download,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import showToast from '@/utils/showToast';

interface Application {
  id: string;
  userId: string;
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

const UserApplicationsList: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);
  const queryClient = useQueryClient();

  const { data: applications, isLoading, error } = useQuery<Application[]>({
    queryKey: ['userApplications'],
    queryFn: async () => {
      const response = await axios.get('/api/donations/apply');
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const response = await axios.delete(`/api/donations/applications/${applicationId}`);
      return response.data;
    },
    onSuccess: () => {
      showToast("Your application has been successfully deleted.", "success")
      queryClient.invalidateQueries({ queryKey: ['userApplications'] });
      setIsDeleteDialogOpen(false);
      setAppToDelete(null);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message,"error")
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="w-3 h-3 mr-1" /> Pending Review
          </Badge>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-green-200 bg-green-50';
      case 'rejected':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  const handleViewDetails = (app: Application) => {
    setSelectedApp(app);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (app: Application) => {
    setAppToDelete(app);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (appToDelete) {
      deleteMutation.mutate(appToDelete.id);
    }
  };

  const filteredApplications = (status: string) => {
    return applications?.filter(app => app.status === status) || [];
  };

  const stats = {
    total: applications?.length || 0,
    pending: filteredApplications('pending').length,
    approved: filteredApplications('approved').length,
    rejected: filteredApplications('rejected').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load applications. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">Track the status of your donation applications</p>
        </div>
        <Link href="/apply-donation">
          <Button className="bg-green-600 hover:bg-green-700">
            <FileText className="w-4 h-4 mr-2" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      {applications && applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-4">You haven't submitted any donation applications.</p>
            <Link href="/apply-donation">
              <Button className="bg-green-600 hover:bg-green-700">
                Submit Your First Application
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {applications?.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteClick}
                getStatusBadge={getStatusBadge}
                getStatusColor={getStatusColor}
              />
            ))}
          </TabsContent>

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
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    onViewDetails={handleViewDetails}
                    onDelete={handleDeleteClick}
                    getStatusBadge={getStatusBadge}
                    getStatusColor={getStatusColor}
                  />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedApp?.projectTitle}</DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              {selectedApp && getStatusBadge(selectedApp.status)}
            </div>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedApp.organization && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Organization</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedApp.organization}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Budget</label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-semibold">
                      ${selectedApp.budgetAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{selectedApp.duration}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Submitted</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      {format(new Date(selectedApp.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Project Description
                </label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-line">{selectedApp.projectDescription}</p>
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Project Goals & Objectives
                </label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-line">{selectedApp.projectGoals}</p>
                </div>
              </div>

              {/* Expected Impact */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Expected Impact
                </label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-line">{selectedApp.expectedImpact}</p>
                </div>
              </div>

              {/* Certificates */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Supporting Documents ({selectedApp.certificates.length})
                </label>
                <div className="space-y-2">
                  {selectedApp.certificates.map((cert, index) => (
                    <a
                      key={index}
                      href={cert}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-900">
                          Document {index + 1}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Review Notes */}
              {selectedApp.reviewNotes && (
                <Alert className={selectedApp.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                  <MessageSquare className="h-4 w-4" />
                  <AlertTitle className="font-semibold">
                    {selectedApp.status === 'approved' ? 'Approval Message' : 'Review Feedback'}
                  </AlertTitle>
                  <AlertDescription className="mt-2 whitespace-pre-line">
                    {selectedApp.reviewNotes}
                  </AlertDescription>
                  {selectedApp.reviewedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Reviewed {formatDistanceToNow(new Date(selectedApp.reviewedAt), { addSuffix: true })}
                    </p>
                  )}
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {appToDelete && (
            <div className="py-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-gray-900">{appToDelete.projectTitle}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Submitted {formatDistanceToNow(new Date(appToDelete.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Application Card Component
const ApplicationCard: React.FC<{
  app: Application;
  onViewDetails: (app: Application) => void;
  onDelete: (app: Application) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}> = ({ app, onViewDetails, onDelete, getStatusBadge, getStatusColor }) => {
  return (
    <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${getStatusColor(app.status)}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{app.projectTitle}</CardTitle>
              {getStatusBadge(app.status)}
            </div>
            <CardDescription>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {app.organization && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {app.organization}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Submitted {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                </span>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="font-semibold text-gray-900">${app.budgetAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="font-semibold text-gray-900">{app.duration}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Documents</p>
              <p className="font-semibold text-gray-900">{app.certificates.length} file(s)</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 line-clamp-2">{app.projectDescription}</p>
        </div>

        {app.reviewNotes && (
          <Alert className={app.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
            <MessageSquare className="h-4 w-4" />
            <AlertTitle className="text-sm font-semibold">
              {app.status === 'approved' ? 'Approval Message' : 'Review Feedback'}
            </AlertTitle>
            <AlertDescription className="text-sm line-clamp-2">
              {app.reviewNotes}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(app)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>

          {app.status === 'pending' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(app)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserApplicationsList;