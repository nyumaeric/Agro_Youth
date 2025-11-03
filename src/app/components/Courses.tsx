'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import axios from 'axios';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSession } from 'next-auth/react';



interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  moduleCount: number;
  timeToComplete: string;
  language: string;
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

interface Enrollment {
  enrollment_id: string;
  course_id: string;
  course_title: string;
  completed: boolean;
  progress: any[];
  total_modules: number;
}

// Skeleton Component
const CourseSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
    <Skeleton height={160} />
    <div className="p-5">
      <Skeleton height={20} className="mb-2" />
      <Skeleton height={20} width="80%" className="mb-4" />
      <Skeleton count={3} height={15} className="mb-4" />
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={80} height={15} />
        <Skeleton width={80} height={15} />
      </div>
      <Skeleton height={40} />
    </div>
  </div>
);

const Courses: React.FC = () => {
  const { ref, inView } = useInView();
  const [token, setToken] = useState<string | null>(null);
  const [myCourses, setMyCourses] = useState<Enrollment[]>([]);
  const [filter, setFilter] = useState({
    category: '',
    level: '',
    language: ''
  });

  const { data: session} = useSession();
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
        `/api/courses?page=${pageParam}&limit=8`
      );
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    setToken(localStorage.getItem('access_token'));
    loadMyCourses();
  }, []);

  const loadMyCourses = () => {
    const enrolledCourses = localStorage.getItem('enrolled_courses');
    if (enrolledCourses) {
      setMyCourses(JSON.parse(enrolledCourses));
    }
  };

  const handleEnroll = (courseId: string, courseTitle: string) => {
    if (!session) {
      alert('Please login to enroll in courses');
      return;
    }

    const newEnrollment: Enrollment = {
      enrollment_id: `enroll_${Date.now()}`,
      course_id: courseId,
      course_title: courseTitle,
      completed: false,
      progress: [],
      total_modules: 3
    };

    const updatedEnrollments = [...myCourses, newEnrollment];
    setMyCourses(updatedEnrollments);
    localStorage.setItem('enrolled_courses', JSON.stringify(updatedEnrollments));
    alert('Successfully enrolled in course!');
  };

  const isEnrolled = (courseId: string) => {
    return myCourses.some(course => course.course_id === courseId);
  };

  // Flatten all courses from all pages
  const allCourses = data?.pages.flatMap(page => page.data) || [];

  // Apply filters
  const filteredCourses = allCourses.filter(course => {
    if (filter.category && course.category !== filter.category) return false;
    if (filter.level && course.level !== filter.level) return false;
    if (filter.language && course.language !== filter.language) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Agricultural Courses
          </h1>
          <p className="text-lg text-green-600 max-w-2xl mx-auto">
            Enhance your farming skills with our comprehensive courses and earn certificates upon completion
          </p>
        </div>

        {/* My Courses Section */}
        {myCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-green-800 mb-6">My Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myCourses.map((enrollment) => (
                <div
                  key={enrollment.enrollment_id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  <div className="h-32 bg-linear-to-br from-green-500 to-green-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div className="absolute top-3 left-3">
                      {enrollment.completed ? (
                        <span className="bg-white bg-opacity-90 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="bg-white bg-opacity-90 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                          In Progress
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                          <circle cx="18" cy="18" r="16" fill="none" stroke="white" strokeWidth="2" strokeDasharray={`${(enrollment.progress.length / enrollment.total_modules) * 100}, 100`} className="transition-all duration-300" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {Math.round((enrollment.progress.length / enrollment.total_modules) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {enrollment.course_title}
                    </h3>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Progress</span>
                        <span className="text-sm text-gray-500">
                          {enrollment.progress.length} of {enrollment.total_modules} modules
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-linear-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(enrollment.progress.length / enrollment.total_modules) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {enrollment.completed ? (
                        <Link
                          href={`/certificate/${enrollment.enrollment_id}`}
                          className="flex-1 bg-linear-to-r from-yellow-500 to-yellow-600 text-white text-center py-2.5 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium text-sm flex items-center justify-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h5a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h5a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                          </svg>
                          <span>Certificate</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/dashboard/courses/${enrollment.course_id}/modules`}
                          className="w-full bg-linear-to-r from-green-600 to-green-700 text-white text-center py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium text-sm flex items-center justify-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Continue Learning</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Courses Section */}
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Available Courses</h2>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <select
                value={filter.category}
                onChange={(e) => setFilter({...filter, category: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white min-w-[180px]"
              >
                <option value="">All Categories</option>
                <option value="Crop Production">🌾 Crop Production</option>
                <option value="Livestock">🐄 Livestock</option>
                <option value="Sustainable Agriculture">🌱 Sustainable Agriculture</option>
                <option value="Agribusiness">💼 Agribusiness</option>
              </select>

              <select
                value={filter.level}
                onChange={(e) => setFilter({...filter, level: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white min-w-[150px]"
              >
                <option value="">All Levels</option>
                <option value="Beginner">📚 Beginner</option>
                <option value="Intermediate">📖 Intermediate</option>
                <option value="Advanced">🎓 Advanced</option>
              </select>

              <button
                onClick={() => setFilter({ category: '', level: '', language: '' })}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Clear Filters</span>
              </button>
            </div>

            {/* Course Count */}
            <div className="text-gray-600 text-sm mb-4">
              Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              // Show skeletons while loading
              Array.from({ length: 8 }).map((_, index) => (
                <CourseSkeleton key={index} />
              ))
            ) : isError ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-600 text-lg">Error loading courses. Please try again.</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 text-lg">No courses found matching your filters.</p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  {/* Course Header with Image Placeholder */}
                  <div className="h-40 bg-linear-to-r from-green-500 to-green-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute top-3 left-3">
                      <span className="bg-white bg-opacity-90 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {course.level}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        {course.timeToComplete}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="bg-white bg-opacity-90 text-green-800 text-xs font-medium px-2 py-1 rounded-full inline-block">
                        📚 {course.category}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-14">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-16">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{course.moduleCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>{course.language}</span>
                      </div>
                    </div>

                    {/* Enrollment Status Indicator */}
                    {isEnrolled(course.id) && (
                      <div className="mb-3">
                        <div className="flex items-center space-x-1 text-green-600 text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">Enrolled</span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleEnroll(course.id, course.title)}
                      disabled={isEnrolled(course.id)}
                      className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                        isEnrolled(course.id)
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                          : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transform hover:scale-105'
                      }`}
                    >
                      {isEnrolled(course.id) ? (
                        <span className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Continue Learning</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          <span>Enroll Now</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Loading More Indicator */}
          {isFetchingNextPage && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <CourseSkeleton key={`loading-${index}`} />
              ))}
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={ref} className="h-10 mt-8" />

          {/* No More Courses Message */}
          {!hasNextPage && filteredCourses.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">You've reached the end of the courses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;