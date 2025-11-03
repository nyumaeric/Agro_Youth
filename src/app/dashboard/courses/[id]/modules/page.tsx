"use client";
import { Button } from "@/components/ui/button";
import { Course, useCourse } from "@/hooks/useCourses";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

export default function CoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
    const { data, isPending, isError } = useCourse(courseId!);
    
    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading course...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error loading course</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const course = data?.data || [] as Course[];

    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-gray-600">Course not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                {/* Course Header */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
                    <div className="p-8 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {course.level}
                            </span>
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {course.category}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
                        <p className="text-gray-600 leading-relaxed">{course.description}</p>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                                <p className="text-gray-900 font-medium">{course.timeToComplete}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Language</p>
                                <p className="text-gray-900 font-medium">{course.language}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Modules</p>
                                <p className="text-gray-900 font-medium">{course.moduleCount || 0} modules</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Modules */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-8 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Course Content
                            </h2>
                            {course.modules && course.modules.length > 0 && (
                                <span className="text-sm text-gray-500">
                                    {course.modules.filter((m: { isCompleted: boolean; }) => m.isCompleted).length} of {course.modules.length} completed
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {!course.modules || course.modules.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <p className="text-gray-500 mb-1">No modules available yet</p>
                                <p className="text-sm text-gray-400">Check back later for course content</p>
                            </div>
                        ) : (
                            course.modules.map((module: { id: Key | null | undefined; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; content: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; durationTime: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; isCompleted: any; }, index: number) => (
                                <div
                                    key={module.id}
                                    className="p-6 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 mb-2">
                                                {module.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                                {module.content}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{module.durationTime}</span>
                                                </div>
                                                {module.isCompleted && (
                                                    <div className="flex items-center gap-1.5 text-gray-700">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="font-medium">Completed</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Link 
                                            href={`/dashboard/courses/${courseId}/modules/${module.id}`}
                                            prefetch={false}
                                            scroll={true}
                                            className="flex-shrink-0 text-sm font-medium transition-colors duration-150 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer inline-block text-center"
                                        >
                                            {module.isCompleted ? 'Review' : 'Start'}
                                        </Link>

                              
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}