'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import axios from 'axios';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSession } from 'next-auth/react';
import { useEnrolledCourses, useUnenrollCourse } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BookOpen, Globe, CheckCircle2, XCircle, PlayCircle, Award } from 'lucide-react';
import showToast from '@/utils/showToast';

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
  
  const queryClient = useQueryClient();
  const userId = session?.user?.id || '';

  const { enrollCourse, isPending: isEnrollPending, isSuccess } = useEnrolledCourses(userId);
  const { exitCourse } = useUnenrollCourse(userId);

  const { data: enrollmentsData } = useQuery({
    queryKey: ['enrollments', userId],
    queryFn: async () => {
      if (!userId) return { data: [] };
      const response = await axios.get(`/api/enrollments`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 30000,
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
    staleTime: 30000,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleEnroll = async(courseId: string) => {
    if (!session?.user?.id) {
      showToast('Please login to enroll in courses', 'error');
      return;
    }

    setEnrollingId(courseId);

    await enrollCourse(courseId, {
        
      onSuccess: () => {
        showToast('Successfully enrolled in the course!', 'success');
        setTimeout(() => {
          setEnrollingId(null);
        }, 500);
      },
      onError: (error) => {
        showToast('Failed to enroll in the course', 'error');
        setEnrollingId(null); 
      }
    });
  };

  const handleUnenroll = async (courseId: string) => {
    if (!session) {
      showToast('Please login first', 'error');
      return;
    }
    
    if (!confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }
    
    setUnenrollingId(courseId);
    try {
      await exitCourse(courseId);
      showToast('Successfully unenrolled from course', 'success');
    } catch (error) {
      console.error('Unenrollment failed:', error);
      showToast('Failed to unenroll from course', 'error');
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
        totalModules: enrollment.totalModules || enrollment.total_modules || 0
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
      // totalModules: enrollmentData?.totalModules || course.moduleCount
    };
  });

  const filteredCourses = allCourses.filter(course => {
    if (filter.category && course.category !== filter.category) return false;
    if (filter.level && course.level !== filter.level) return false;
    if (filter.language && course.language !== filter.language) return false;
    return true;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <Card className="mb-10 border-2 shadow-lg">
            <CardContent className="pt-8 pb-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <Select value={filter.category || "all"} onValueChange={(value) => setFilter({...filter, category: value === "all" ? "" : value})}>
                  <SelectTrigger className="w-[220px] h-12 border-2 font-medium">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Crop Production">🌾 Crop Production</SelectItem>
                    <SelectItem value="Livestock">🐄 Livestock</SelectItem>
                    <SelectItem value="Sustainable Agriculture">🌱 Sustainable Agriculture</SelectItem>
                    <SelectItem value="Agribusiness">💼 Agribusiness</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filter.level || "all"} onValueChange={(value) => setFilter({...filter, level: value === "all" ? "" : value})}>
                  <SelectTrigger className="w-[200px] h-12 border-2 font-medium">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">📚 Beginner</SelectItem>
                    <SelectItem value="Intermediate">📖 Intermediate</SelectItem>
                    <SelectItem value="Advanced">🎓 Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                 onClick={() => setFilter({ category: '', level: '', language: '' })}
                 variant="outline"
                 className="bg-green-600 text-white hover:bg-green-700 hover:text-white border-2 border-green-600 font-semibold"

                > Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 9 }).map((_, index) => (
                <CourseSkeleton key={index} />
              ))
            ) : isError ? (
              <div className="col-span-full text-center py-20">
                <p className="text-red-600 text-xl font-semibold">Error loading courses. Please try again.</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500 text-xl">No courses found matching your filters.</p>
              </div>
            ) : (
              filteredCourses.map((course) => {
                const isThisCourseEnrolling = enrollingId === course.id;
                const isThisCourseUnenrolling = unenrollingId === course.id;
                
                return (
                  <Card key={course.id} className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-gray-300 overflow-hidden p-0">
                    <CardHeader className="bg-gray-400 text-white pb-16 pt-6">
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
                    </CardHeader>

                    <CardContent className="pt-6 px-6 pb-4">
                      <CardTitle className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 min-h-[56px]">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[60px]">
                        {course.description}
                      </CardDescription>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{course.moduleCount} modules</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{course.language}</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="px-6 pb-6 pt-2 flex gap-3">
                      {isThisCourseEnrolling ? (
                        <Button
                          disabled
                          className="w-full bg-green-600 hover:bg-green-700 font-semibold shadow-md h-11"
                        >
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Enrolling...
                        </Button>
                      ) : course.isEnrolled ? (
                        <>
                          <Button asChild className="flex-1 bg-green-600 hover:bg-green-700 font-semibold shadow-md">
                            <Link href={`/dashboard/courses/${course.id}/modules`}>
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Continue
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUnenroll(course.id)}
                            disabled={isThisCourseUnenrolling}
                            className="border-2 border-red-200 hover:bg-red-50 hover:border-red-300"
                            title="Unenroll"
                          >
                            {isThisCourseUnenrolling ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleEnroll(course.id)}
                          className="w-full bg-green-600 hover:bg-green-700 font-semibold shadow-md"
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Enroll Now
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>

          {isFetchingNextPage && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <CourseSkeleton key={`loading-${index}`} />
              ))}
            </div>
          )}

          <div ref={ref} className="h-10 mt-10" />

          {!hasNextPage && filteredCourses.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg font-medium">You've reached the end of all courses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;