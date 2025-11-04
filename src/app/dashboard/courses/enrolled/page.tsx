'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import axios from 'axios';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSession } from 'next-auth/react';
import { useEnrolledCourses, useUnenrollCourse } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Globe, XCircle, PlayCircle, Award, CheckCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  moduleCount: number;
  timeToComplete: string;
  language: string;
  isEnrolled?: boolean;
  completionPercentage?: number;
  completedModules?: number;
  isCompleted?: boolean;
  totalModules?: number;
}

interface CourseResponse {
  data: Course[];
  count: number;
  page: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const CourseSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton height={120} />
    </CardHeader>
    <CardContent>
      <Skeleton height={24} className="mb-3" />
      <Skeleton height={16} count={2} className="mb-4" />
      <Skeleton height={20} className="mb-2" />
    </CardContent>
    <CardFooter>
      <Skeleton height={44} width="100%" />
    </CardFooter>
  </Card>
);

const CourseCard = ({ course, onUnenroll, unenrollingId, isCompleted = false }: { 
  course: Course; 
  onUnenroll: (id: string) => void; 
  unenrollingId: string | null;
  isCompleted?: boolean;
}) => (
  <Card className={`group hover:shadow-2xl transition-all duration-300 border-2 hover:border-gray-400 overflow-hidden p-0 ${isCompleted ? 'opacity-95' : ''}`}>
    <div className="relative">
      <CardHeader className={`${isCompleted ? 'bg-green-600' : 'bg-gray-400'} text-white pb-16 pt-6`}>
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className="bg-white/95 text-green-800 font-semibold">
            {course.level}
          </Badge>
          <Badge variant="secondary" className="bg-blue-600 text-white font-semibold">
            {course.timeToComplete}
          </Badge>
        </div>
        <Badge variant="secondary" className="bg-white/95 text-green-800 w-fit font-medium">
          {course.category}
        </Badge>
        {isCompleted && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-yellow-400 text-green-900 font-bold px-3 py-1 shadow-lg">
              <CheckCircle className="w-4 h-4 mr-1 inline" />
              Completed
            </Badge>
          </div>
        )}
      </CardHeader>
      <div className="absolute -bottom-10 right-6">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle cx="40" cy="40" r="36" fill="white" stroke="#e5e7eb" strokeWidth="4" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="6" />
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke={isCompleted ? "#10b981" : "#3b82f6"}
              strokeWidth="6"
              strokeDasharray={`${(course.completionPercentage || 0) * 2.01}, 201`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
              {Math.round(course.completionPercentage || 0)}
            </span>
            <span className="text-xs font-semibold text-gray-500">%</span>
          </div>
        </div>
      </div>
    </div>
    <CardContent className="pt-14 px-6 pb-4">
      <CardTitle className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 min-h-[56px]">
        {course.title}
      </CardTitle>
      <CardDescription className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[40px]">
        {course.description}
      </CardDescription>
      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-green-600" />
          <span className="font-medium">{course.moduleCount} modules</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-green-600" />
          <span className="font-medium">{course.language}</span>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-gray-700">Progress</span>
          <span className="text-xs font-medium text-gray-500">
            {course.completedModules || 0}/{course.totalModules} modules
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`${isCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'} h-2.5 rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${course.completionPercentage || 0}%` }}
          />
        </div>
      </div>
    </CardContent>
    <CardFooter className="px-6 pb-6 pt-2 flex gap-3">
      <Button asChild className={`flex-1 ${isCompleted ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'} font-semibold shadow-md`}>
        <Link href={`/dashboard/courses/${course.id}/modules`}>
          {isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Review Course
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4 mr-2" />
              Continue Learning
            </>
          )}
        </Link>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onUnenroll(course.id)}
        disabled={unenrollingId === course.id}
        className="border-2 border-red-200 hover:bg-red-50 hover:border-red-300"
        title="Unenroll from course"
      >
        {unenrollingId === course.id ? (
          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
        ) : (
          <XCircle className="w-4 h-4 text-red-600" />
        )}
      </Button>
    </CardFooter>
  </Card>
);

const Courses: React.FC = () => {
  const { ref, inView } = useInView();
  const { data: session } = useSession();
  const [filter, setFilter] = useState({
    category: '',
    level: '',
    language: ''
  });
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);

  const userId = session?.user?.id || '';
  const { enrollCourse } = useEnrolledCourses(userId);
  const { exitCourse } = useUnenrollCourse(userId);

  const { data: enrollmentsData } = useQuery({
    queryKey: ['enrollments', userId],
    queryFn: async () => {
      if (!userId) return { data: [] };
      const response = await axios.get(`/api/enrollments`);
      return response.data;
    },
    enabled: !!userId,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['courses'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get<{ data: CourseResponse }>(
        `/api/courses?page=${pageParam}&limit=9`
      );
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const handleUnenroll = async (courseId: string) => {
    if (!session) {
      alert('Please login first');
      return;
    }
    if (!confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }
    setUnenrollingId(courseId);
    try {
      await exitCourse(courseId);
      alert('Successfully unenrolled from course');
    } catch (error) {
      console.error('Unenrollment failed:', error);
    } finally {
      setUnenrollingId(null);
    }
  };

  const enrollmentMap = new Map(
    enrollmentsData?.data?.map((enrollment: any) => [
      enrollment.courseId || enrollment.course_id,
      {
        completionPercentage: enrollment.completionPercentage || enrollment.completion_percentage || 0,
        completedModules: enrollment.completedModules || enrollment.completed_modules || 0,
        totalModules: enrollment.totalModules || enrollment.total_modules || 0,
        isCompleted: enrollment.isCompleted || enrollment.is_completed || false
      }
    ]) || []
  );
  const enrolledCourseIds = new Set(enrollmentMap.keys());

  const allCourses = (data?.pages.flatMap(page => page.data) || []).map(course => {
    const enrollmentData = enrollmentMap.get(course.id);
    return {
      ...course,
      isEnrolled: enrolledCourseIds.has(course.id),
      // completionPercentage: enrollmentData?.completionPercentage || 0,
      // completedModules: enrollmentData?.completedModules || 0,
      // totalModules: enrollmentData?.totalModules || course.moduleCount,
      // isCompleted: enrollmentData?.isCompleted || false
    };
  });

  const filteredCourses = allCourses.filter(course => {
    if (filter.category && course.category !== filter.category) return false;
    if (filter.level && course.level !== filter.level) return false;
    if (filter.language && course.language !== filter.language) return false;
    return true;
  });

  const enrolledCoursesData = enrollmentsData?.data || []

  console.log(enrolledCoursesData)

  const enrolledCourses = filteredCourses.filter(course => course.isEnrolled);
  const inProgressCourses = enrolledCourses.filter(course => !course.isCompleted);
  const completedCourses = enrolledCoursesData.filter((course: Course) => course.isCompleted);
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {enrolledCoursesData.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Award className="w-8 h-8 text-green-700" />
              <h2 className="text-3xl font-bold text-green-800">My Courses</h2>
              <Badge className="bg-green-600 text-white text-sm px-3 py-1">
                {enrolledCourses.length} Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {inProgressCourses.length > 0 && (
                  <>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <PlayCircle className="w-6 h-6 text-blue-600" />
                      In Progress
                      <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">
                        {inProgressCourses.length}
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {enrolledCoursesData.map((course: Course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          onUnenroll={handleUnenroll}
                          unenrollingId={unenrollingId}
                          isCompleted={false}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Completed Courses - Right Side Sidebar */}
              <div className="lg:col-span-1 pt-10">
                {completedCourses.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 sticky top-20">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-lg">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Completed Courses
                        <Badge className="bg-white text-green-700 text-xs px-2 py-0.5 ml-auto">
                          {completedCourses.length}
                        </Badge>
                      </h3>
                    </div>
                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                      {completedCourses.map((course: Course) => (
                        <Link
                          key={course.id}
                          href={`/dashboard/courses/${course.id}/modules`}
                          className="block border-b border-gray-100 hover:bg-green-50 transition-colors duration-200"
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
                                {course.title}
                              </h4>
                              <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5 shrink-0">
                                <CheckCircle className="w-3 h-3 mr-1 inline" />
                                Done
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {course.moduleCount} modules
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {course.language}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;