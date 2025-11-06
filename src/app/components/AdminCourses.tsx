"use client";

import { useGetAdminCourse } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Loader2,
  Plus,
  Video,
  FileText,
  Clock,
  BookOpen,
  Globe,
  BarChart,
  Trash2,
  Eye,
  Edit,
  X,
} from "lucide-react";
import showToast from "@/utils/showToast";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  description: string;
  timeToComplete: string;
  category: string;
  level: string;
  language: string;
  contentType: "text" | "video";
  contentUrl?: string;
  textContent?: string;
  isDownloadable: boolean;
  isCourseCompleted: boolean;
  createdAt: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  durationTime: string;
  contentType: "text" | "video";
  textContent?: string;
  videoFile?: File | null;
  isCompleted: boolean;
}

export default function AllAdminCourses() {
  const router = useRouter();
  const { data, isPending, refetch } = useGetAdminCourse();

  const allCourses: Course[] = Array.isArray(data?.data) ? data.data : [];

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [contentType, setContentType] = useState<"text" | "video">("text");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Module states
  const [modules, setModules] = useState<Module[]>([]);
  const [showModuleForm, setShowModuleForm] = useState(false);

  // Add new module
  const addModule = () => {
    const newModule: Module = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      durationTime: "",
      contentType: "text",
      textContent: "",
      videoFile: null,
      isCompleted: false,
    };
    setModules([...modules, newModule]);
    setShowModuleForm(true);
  };

  // Remove module
  const removeModule = (id: string) => {
    setModules(modules.filter((module) => module.id !== id));
    if (modules.length === 1) {
      setShowModuleForm(false);
    }
  };

  // Update module field
  const updateModule = (id: string, field: keyof Module, value: any) => {
    setModules(
      modules.map((module) =>
        module.id === id ? { ...module, [field]: value } : module
      )
    );
  };

  // Create Course with Modules
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Step 1: Create the course
      const courseFormData = new FormData(e.currentTarget);
      courseFormData.append("contentType", contentType);

      if (contentType === "video" && videoFile) {
        courseFormData.append("video", videoFile);
      }

      const courseResponse = await fetch("/api/courses", {
        method: "POST",
        body: courseFormData,
      });

      const courseData = await courseResponse.json();

      if (!courseResponse.ok) {
        showToast(courseData.message || "Failed to create course", "error");
        setIsSubmitting(false);
        return;
      }

      const createdCourseId = courseData.data.id;

      // Step 2: Create modules if any
      if (modules.length > 0) {
        const modulePromises = modules.map(async (module) => {
          const moduleFormData = new FormData();
          moduleFormData.append("title", module.title);
          moduleFormData.append("description", module.description);
          moduleFormData.append("durationTime", module.durationTime);
          moduleFormData.append("contentType", module.contentType);
          moduleFormData.append("isCompleted", module.isCompleted.toString());

          if (module.contentType === "text" && module.textContent) {
            moduleFormData.append("textContent", module.textContent);
          } else if (module.contentType === "video" && module.videoFile) {
            moduleFormData.append("video", module.videoFile);
          }

          return fetch(`/api/courses/${createdCourseId}/modules`, {
            method: "POST",
            body: moduleFormData,
          });
        });

        const moduleResponses = await Promise.all(modulePromises);
        
        const failedModules = moduleResponses.filter((res) => !res.ok);
        if (failedModules.length > 0) {
          showToast(
            `Course created but ${failedModules.length} module(s) failed to create`,
            "error"
          );
        } else {
          showToast(
            `Course created successfully with ${modules.length} module(s)!`,
            "success"
          );
        }
      } else {
        showToast("Course created successfully!", "success");
      }

      // Reset form
      setIsCreateDialogOpen(false);
      refetch();
      setContentType("text");
      setVideoFile(null);
      setModules([]);
      setShowModuleForm(false);
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error creating course:", error);
      showToast("An error occurred while creating the course", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Course
  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("contentType", contentType);

    if (contentType === "video" && videoFile) {
      formData.append("video", videoFile);
    }

    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "PATCH",
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        showToast(responseData.message || "Course updated successfully!", "success");
        setIsEditDialogOpen(false);
        setSelectedCourse(null);
        refetch();
        setContentType("text");
        setVideoFile(null);
      } else {
        showToast(responseData.message || "Failed to update course", "error");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      showToast("An error occurred while updating the course", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Course
  const handleDelete = async () => {
    if (!selectedCourse) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "DELETE",
      });

      const responseData = await response.json();

      if (response.ok) {
        showToast(responseData.message || "Course deleted successfully!", "success");
        setIsDeleteDialogOpen(false);
        setSelectedCourse(null);
        refetch();
      } else {
        showToast(responseData.message || "Failed to delete course", "error");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      showToast("An error occurred while deleting the course", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // View Details
  const handleViewDetails = (courseId: string) => {
    router.push(`/dashboard/courses/${courseId}/modules`);
  };

  // Open Edit Dialog
  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setContentType(course.contentType);
    setIsEditDialogOpen(true);
  };

  // Open Delete Dialog
  const openDeleteDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">Manage and create agricultural courses</p>
        </div>

        {/* Create Course Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Add a new agricultural course with optional modules
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-6 mt-4">
              {/* Course Details Section */}
              <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <h3 className="font-semibold text-lg">Course Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input className="resize-none"
                    id="title"
                    name="title"
                    placeholder="e.g., Introduction to Organic Farming"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea className="resize-none"
                    id="description"
                    name="description"
                    placeholder="Provide a detailed description of the course..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select name="level" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeToComplete">Time to Complete</Label>
                    <Input
                      id="timeToComplete"
                      name="timeToComplete"
                      placeholder="e.g., 2 hours"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cropping">Cropping</SelectItem>
                        <SelectItem value="Livestock">Livestock</SelectItem>
                        <SelectItem value="Agroforestry">Agroforestry</SelectItem>
                        <SelectItem value="Irrigation">Irrigation</SelectItem>
                        <SelectItem value="Soil Health">Soil Health</SelectItem>
                        <SelectItem value="Pest Management">Pest Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select name="language" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Kinyarwanda">Kinyarwanda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Content Type</Label>
                  <RadioGroup
                    value={contentType}
                    onValueChange={(value) => setContentType(value as "text" | "video")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id="create-text" />
                      <Label htmlFor="create-text" className="cursor-pointer">
                        Text Content
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="video" id="create-video" />
                      <Label htmlFor="create-video" className="cursor-pointer">
                        Video Upload
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {contentType === "text" ? (
                  <div className="space-y-2">
                    <Label htmlFor="textContent">Text Content</Label>
                    <Textarea className="resize-none"
                      id="textContent"
                      name="textContent"
                      placeholder="Enter the course content here..."
                      rows={6}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="video">Upload Video</Label>
                    <Input className="resize-none"
                      id="video"
                      type="file"
                      accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      required
                    />
                    {videoFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox id="isDownloadable" name="isDownloadable" />
                  <Label htmlFor="isDownloadable" className="cursor-pointer">
                    Allow content download
                  </Label>
                </div>
              </div>

              {/* Modules Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Course Modules (Optional)</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addModule}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Module
                  </Button>
                </div>

                {modules.length > 0 && (
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <div
                        key={module.id}
                        className="p-4 border rounded-lg space-y-4 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Module {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeModule(module.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Module Title</Label>
                          <Input
                          className="resize-none"
                            value={module.title}
                            onChange={(e) =>
                              updateModule(module.id, "title", e.target.value)
                            }
                            placeholder="e.g., Introduction to Soil Types"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Module Description</Label>
                          <Textarea
                          className="resize-none"
                            value={module.description}
                            onChange={(e) =>
                              updateModule(module.id, "description", e.target.value)
                            }
                            placeholder="Describe what this module covers..."
                            rows={3}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Duration</Label>
                          <Input
                          className="resize-none"
                            value={module.durationTime}
                            onChange={(e) =>
                              updateModule(module.id, "durationTime", e.target.value)
                            }
                            placeholder="e.g., 30 minutes"
                            required
                          />
                        </div>

                        <div className="space-y-3">
                          <Label>Module Content Type</Label>
                          <RadioGroup
                            value={module.contentType}
                            onValueChange={(value) =>
                              updateModule(module.id, "contentType", value as "text" | "video")
                            }
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="text" id={`module-text-${module.id}`} />
                              <Label htmlFor={`module-text-${module.id}`} className="cursor-pointer">
                                Text
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="video" id={`module-video-${module.id}`} />
                              <Label htmlFor={`module-video-${module.id}`} className="cursor-pointer">
                                Video
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {module.contentType === "text" ? (
                          <div className="space-y-2">
                            <Label>Text Content</Label>
                            <Textarea
                            className="resize-none"
                              value={module.textContent || ""}
                              onChange={(e) =>
                                updateModule(module.id, "textContent", e.target.value)
                              }
                              placeholder="Enter module content..."
                              rows={4}
                              required
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Upload Video</Label>
                            <Input
                            className="resize-none"
                              type="file"
                              accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo"
                              onChange={(e) =>
                                updateModule(module.id, "videoFile", e.target.files?.[0] || null)
                              }
                              required
                            />
                            {module.videoFile && (
                              <p className="text-sm text-muted-foreground">
                                {module.videoFile.name} (
                                {(module.videoFile.size / 1024 / 1024).toFixed(2)} MB)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setModules([]);
                    setShowModuleForm(false);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>Create Course {modules.length > 0 && `with ${modules.length} Module(s)`}</>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Course Dialog - Same as before */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course information</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEdit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Course Title</Label>
              <Input
              className="resize-none"
                id="edit-title"
                name="title"
                defaultValue={selectedCourse?.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
              className="resize-none"
                id="edit-description"
                name="description"
                defaultValue={selectedCourse?.description}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-level">Level</Label>
                <Select name="level" defaultValue={selectedCourse?.level} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-timeToComplete">Time to Complete</Label>
                <Input
                className="resize-none"
                  id="edit-timeToComplete"
                  name="timeToComplete"
                  defaultValue={selectedCourse?.timeToComplete}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select name="category" defaultValue={selectedCourse?.category} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cropping">Cropping</SelectItem>
                    <SelectItem value="Livestock">Livestock</SelectItem>
                    <SelectItem value="Agroforestry">Agroforestry</SelectItem>
                    <SelectItem value="Irrigation">Irrigation</SelectItem>
                    <SelectItem value="Soil Health">Soil Health</SelectItem>
                    <SelectItem value="Pest Management">Pest Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-language">Language</Label>
                <Select name="language" defaultValue={selectedCourse?.language} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Kinyarwanda">Kinyarwanda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Content Type</Label>
              <RadioGroup
                value={contentType}
                onValueChange={(value) => setContentType(value as "text" | "video")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="edit-text" />
                  <Label htmlFor="edit-text" className="cursor-pointer">
                    Text Content
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="edit-video" />
                  <Label htmlFor="edit-video" className="cursor-pointer">
                    Video Upload
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {contentType === "text" ? (
              <div className="space-y-2">
                <Label htmlFor="edit-textContent">Text Content</Label>
                <Textarea
                className="resize-none"
                  id="edit-textContent"
                  name="textContent"
                  defaultValue={selectedCourse?.textContent || ""}
                  rows={8}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="edit-video">Upload New Video (Optional)</Label>
                <Input
                className="resize-none"
                  id="edit-video"
                  type="file"
                  accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
                {videoFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {selectedCourse?.contentUrl && !videoFile && (
                  <p className="text-sm text-muted-foreground">
                    Current video will be kept if no new file is uploaded
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isDownloadable"
                name="isDownloadable"
                defaultChecked={selectedCourse?.isDownloadable}
              />
              <Label htmlFor="edit-isDownloadable" className="cursor-pointer">
                Allow content download
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedCourse(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Course"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course "
              {selectedCourse?.title}" and all its modules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCourse(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Courses Grid */}
      {allCourses.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-4">Create your first course to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {course.contentType === "video" ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{course.timeToComplete}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart className="w-4 h-4" />
                  <span>{course.category}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  <span>{course.language}</span>
                </div>

                {course.isDownloadable && (
                  <Badge variant="outline" className="text-xs">
                    Downloadable
                  </Badge>
                )}
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewDetails(course.id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(course)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteDialog(course)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}