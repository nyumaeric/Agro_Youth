"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Video, TrendingUp } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface PopularPost {
  id: string;
  title: string;
  content?: string;
}

interface CreateSessionDialogProps {
  popularPosts?: PopularPost[];
  isLoadingPosts?: boolean;
}

export default function CreateSessionDialog({ popularPosts = [], isLoadingPosts = false }: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    durationMinutes: "",
  });
  const queryClient = useQueryClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      
      updateDescriptionWithPosts(newSet);
      return newSet;
    });
  };

  const updateDescriptionWithPosts = (selectedPostIds: Set<string>) => {
    let baseDescription = formData.description;
    
    const topicsMarker = '\n\n📌 Topics to discuss:';
    const topicsIndex = baseDescription.indexOf(topicsMarker);
    if (topicsIndex !== -1) {
      baseDescription = baseDescription.substring(0, topicsIndex);
    }
    
    let newDescription = baseDescription;
    if (selectedPostIds.size > 0) {
      const selectedPostTitles = popularPosts
        .filter(post => selectedPostIds.has(post.id))
        .map(post => post.title);
      
      if (selectedPostTitles.length > 0) {
        newDescription += `\n\n📌 Topics to discuss:\n${selectedPostTitles.map((title, i) => `${i + 1}. ${title}`).join('\n')}`;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      description: newDescription
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/livesessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
          durationMinutes: parseInt(formData.durationMinutes),
          isActive: false,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setOpen(false);
        setFormData({
          title: "",
          description: "",
          scheduledAt: "",
          durationMinutes: "",
        });
        setSelectedPosts(new Set());
        queryClient.invalidateQueries({ queryKey: ['livesessions'] });
      } else {
        alert(data.message || "Failed to create session");
      }
    } catch (error) {
      alert("An error occurred while creating the session");
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">Create Live Session</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Video className="w-6 h-6 text-blue-600" />
            Create Live Session
          </DialogTitle>
          <DialogDescription>
            Schedule a new live session with Google Meet integration
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Session Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Q1 Investment Review"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide details about the session..."
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full resize-none"
            />
            <p className="text-xs text-gray-500">Selected topics will appear here automatically</p>
          </div>

          {popularPosts && popularPosts.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Include Popular Posts (Optional)
              </Label>
              <div className="border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto space-y-2">
                {isLoadingPosts ? (
                  <>
                    <Skeleton height={40} className="mb-2" />
                    <Skeleton height={40} className="mb-2" />
                    <Skeleton height={40} />
                  </>
                ) : (
                  <>
                    {popularPosts.slice(0, 5).map((post) => (
                      <div
                        key={post.id}
                        onClick={() => togglePostSelection(post.id)}
                        className={`p-3 rounded-md border cursor-pointer transition-all ${
                          selectedPosts.has(post.id)
                            ? 'bg-blue-50 border-blue-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedPosts.has(post.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedPosts.has(post.id) && (
                              <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{post.title}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              {selectedPosts.size > 0 && (
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <span className="font-medium">{selectedPosts.size}</span> post{selectedPosts.size !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="scheduledAt" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Scheduled Date & Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={handleInputChange}
              min={getMinDateTime()}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationMinutes" className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Duration (minutes) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              placeholder="e.g., 60"
              value={formData.durationMinutes}
              onChange={handleInputChange}
              min="15"
              max="480"
              step="15"
              required
              className="w-full"
            />
            <p className="text-xs text-gray-500">Between 15 and 480 minutes</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Session"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}