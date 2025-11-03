"use client";
import { Button } from "@/components/ui/button";
import { useCourseModule, useCourse } from "@/hooks/useCourses";
import { useUpdateModules } from "@/hooks/useModules";
import { useParams, useRouter } from "next/navigation";

export default function ModulePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
    const moduleId = Array.isArray(params.ids) ? params.ids[0] : params.ids;
    
    const { data, isPending, isError } = useCourseModule(courseId!, moduleId!);
    const { data: courseData } = useCourse(courseId!);
    const { mutate: updateModule, isPending: isUpdating } = useUpdateModules();
    
    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading module...</p>
                </div>
            </div>
        );
    }

    if (isError || !data?.data) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error loading module</p>
                    <Button 
                        onClick={() => router.push(`/dashboard/courses/${courseId}`)}
                        variant="outline"
                    >
                        Back to Course
                    </Button>
                </div>
            </div>
        );
    }

    const module = data.data;
    const modules = courseData?.data?.modules || [];
    const currentModuleIndex = modules.findIndex((m: any) => m.id === moduleId);
    const nextModule = modules[currentModuleIndex + 1];
    const hasNextModule = currentModuleIndex !== -1 && nextModule;

    const handleMarkAsComplete = () => {
        updateModule({
            id: courseId!,
            ids: moduleId!,
            data: {
                isCompleted: true,
            }
        });
    };

    const handleNextModule = () => {
        if (hasNextModule) {
            router.push(`/dashboard/courses/${courseId}/modules/${nextModule.id}`);
        } else {
            router.push(`/dashboard/courses/${courseId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <Button
                    onClick={() => router.push(`/dashboard/courses/${courseId}`)}
                    variant="ghost"
                    className="mb-6"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Course
                </Button>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                            {module.isCompleted && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Completed
                                </span>
                            )}
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {module.durationTime}
                            </span>
                        </div>
                        
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{module.title}</h1>
                        <p className="text-gray-600 leading-relaxed text-lg">{module.content}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
                    <div className="p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Module Content</h2>
                        
                        <div className="prose max-w-none">
                            <p className="text-gray-600">
                                This is where your module learning content will appear. You can add:
                            </p>
                            <ul className="text-gray-600 space-y-2 mt-4">
                                <li>Video lessons</li>
                                <li>Reading materials</li>
                                <li>Interactive exercises</li>
                                <li>Quizzes and assessments</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {!module.isCompleted ? (
                                <Button 
                                    className="bg-gray-900 hover:bg-gray-800 text-white"
                                    onClick={handleMarkAsComplete}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? "Updating..." : "Mark as Complete"}
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2 text-green-700">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">Module Completed</span>
                                </div>
                            )}
                        </div>
                        
                        <Button 
                            variant="outline"
                            onClick={handleNextModule}
                        >
                            {hasNextModule ? "Next Module" : "Back to Course"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}