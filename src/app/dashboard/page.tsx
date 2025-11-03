'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  TrendingUp,
  FileText,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Activity,
  DollarSign,
  Target,
  Users,
  PlayCircle,
} from 'lucide-react';
import Link from 'next/link';

const Dashboard: React.FC = () => {
  const { data: session } = useSession();

  // Dummy data
  const stats = {
    totalCourses: 12,
    completedCourses: 5,
    inProgressCourses: 4,
    totalApplications: 8,
    pendingApplications: 2,
    approvedApplications: 5,
    rejectedApplications: 1,
  };

  const recentCourses = [
    {
      id: '1',
      title: 'Modern Crop Production Techniques',
      progress: 75,
      category: 'Crop Production',
      modules: 12,
      completedModules: 9,
    },
    {
      id: '2',
      title: 'Sustainable Livestock Management',
      progress: 45,
      category: 'Livestock',
      modules: 10,
      completedModules: 4,
    },
    {
      id: '3',
      title: 'Organic Farming Basics',
      progress: 90,
      category: 'Sustainable Agriculture',
      modules: 8,
      completedModules: 7,
    },
  ];

  const recentApplications = [
    {
      id: '1',
      projectTitle: 'Community Irrigation Project',
      status: 'approved',
      budgetAmount: 50000,
      submittedDate: '2 days ago',
    },
    {
      id: '2',
      projectTitle: 'Greenhouse Initiative',
      status: 'pending',
      budgetAmount: 35000,
      submittedDate: '5 days ago',
    },
    {
      id: '3',
      projectTitle: 'Agricultural Training Center',
      status: 'rejected',
      budgetAmount: 80000,
      submittedDate: '1 week ago',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="bg-slate-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                {getGreeting()}, {session?.user?.fullName || 'Farmer'}! 👋
              </h1>
              <p className="text-green-100 text-sm md:text-base">
                Welcome back to your agricultural learning dashboard
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/courses">
                <Button className="bg-white text-green-700 hover:bg-green-50">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
              <Link href="/apply-donation">
                <Button variant="outline" className="border-white text-white hover:bg-green-600">
                  <FileText className="w-4 h-4 mr-2" />
                  Apply for Funding
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Courses */}
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Courses
                </CardTitle>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalCourses}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.inProgressCourses} in progress
              </p>
            </CardContent>
          </Card>

          {/* Completed Courses */}
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completed
                </CardTitle>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.completedCourses}</div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((stats.completedCourses / stats.totalCourses) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>

          {/* Total Applications */}
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Applications
                </CardTitle>
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalApplications}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.pendingApplications} pending review
              </p>
            </CardContent>
          </Card>

          {/* Approved Applications */}
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Approved
                </CardTitle>
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.approvedApplications}</div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((stats.approvedApplications / stats.totalApplications) * 100)}% success rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Courses - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      Continue Learning
                    </CardTitle>
                    <CardDescription>Your active courses</CardDescription>
                  </div>
                  <Link href="/my-courses">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-all border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant="outline" className="text-xs">
                            {course.category}
                          </Badge>
                          <span className="text-xs">
                            {course.completedModules}/{course.modules} modules
                          </span>
                        </div>
                      </div>
                      <Link href={`/courses/${course.id}`}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Continue
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-green-600">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Applications */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/courses">
                  <Button variant="outline" className="w-full justify-start hover:bg-green-50">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explore Courses
                  </Button>
                </Link>
                <Link href="/my-courses">
                  <Button variant="outline" className="w-full justify-start hover:bg-blue-50">
                    <Activity className="w-4 h-4 mr-2" />
                    My Learning
                  </Button>
                </Link>
                <Link href="/apply-donation">
                  <Button variant="outline" className="w-full justify-start hover:bg-purple-50">
                    <FileText className="w-4 h-4 mr-2" />
                    New Application
                  </Button>
                </Link>
                <Link href="/dashboard/my-applications">
                  <Button variant="outline" className="w-full justify-start hover:bg-yellow-50">
                    <Award className="w-4 h-4 mr-2" />
                    My Applications
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Course Completed</p>
                    <p className="text-xs text-gray-600">Organic Farming Basics</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New Enrollment</p>
                    <p className="text-xs text-gray-600">Sustainable Livestock</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                    <p className="text-xs text-gray-600">Irrigation Project</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Applications */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Recent Applications
                </CardTitle>
                <CardDescription>Track your funding requests</CardDescription>
              </div>
              <Link href="/dashboard/my-applications">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all bg-white"
                >
                  <div className="flex-1 mb-3 md:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{app.projectTitle}</h4>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${app.budgetAmount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {app.submittedDate}
                      </span>
                    </div>
                  </div>
                  <Link href={`/dashboard/my-applications`}>
                    <Button variant="outline" size="sm">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;