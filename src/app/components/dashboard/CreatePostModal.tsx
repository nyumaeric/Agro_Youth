"use client";

import React, { useState } from 'react';
import { X, Image, Link, FileText, FileAudio, Video, Loader } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreatePosts } from '@/hooks/posts/useCreatePosts';


type ContentType = 'text' | 'image' | 'video' | 'audio' | 'link';

interface ModerationData {
  riskLevel?: 'low' | 'medium' | 'high';
  emotionalImpact?: 'positive' | 'negative' | 'neutral';
  contentQuality?: 'spam' | 'low' | 'high';
  meaningfulnessScore?: number;
  concerns?: string[];
  suggestions?: string[];
  message?: string;
  savedForReview?: boolean;
  moderatedContentId?: string;
  confidence?: number;
}

interface CreatePostModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PostFormData {
  title: string;
  contentType: ContentType;
  textContent?: string;
  mediaAlt?: string;
  linkUrl?: string;
  linkDescription?: string;
  isAnonymous?: boolean;
}

interface FormErrors {
  title?: string;
  textContent?: string;
  linkUrl?: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ courseId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ContentType>('text');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [linkPreviewImageFile, setLinkPreviewImageFile] = useState<File | null>(null);
  const [linkPreviewImage, setLinkPreviewImage] = useState<string | null>(null);
  // Remove local isAnonymous state - use only formData.isAnonymous

  const { 
    formData, 
    errors, 
    moderationData,
    handleChange, 
    updateField, 
    handleSubmit, 
    isPending 
  }: {
    formData: PostFormData;  
    errors: FormErrors;
    moderationData: ModerationData | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    updateField: (field: string, value: any) => void;
    handleSubmit: (formData: FormData) => Promise<void>;  
    isPending: boolean;
  } = useCreatePosts(courseId);

  const handleTabChange = (value: string) => {
    const contentType = value as ContentType;
    setActiveTab(contentType);
    updateField('contentType', contentType);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFile(file);
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      if (event.target?.result) {
        setMediaPreview(event.target.result as string);
      }
    };
    fileReader.readAsDataURL(file);
  };

  const handleLinkPreviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLinkPreviewImageFile(file);
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      if (event.target?.result) {
        setLinkPreviewImage(event.target.result as string);
      }
    };
    fileReader.readAsDataURL(file);
  };

  const handleAnonymousToggle = (checked: boolean) => {
    // Only update the form data state
    updateField('isAnonymous', checked);
  };

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const formDataObj = new FormData();
      
      formDataObj.append('title', formData.title);
      formDataObj.append('contentType', activeTab);
      
      formDataObj.append('isAnonymous', formData.isAnonymous ? 'true' : 'false');
      
      switch (activeTab) {
        case 'text':
          formDataObj.append('textContent', formData.textContent || '');
          break;
        case 'image':
        case 'video':
        case 'audio':
          if (mediaFile) {
            formDataObj.append('media', mediaFile);
          }
          formDataObj.append('mediaAlt', formData.mediaAlt || '');
          break;
        case 'link':
          formDataObj.append('linkUrl', formData.linkUrl || '');
          formDataObj.append('linkDescription', formData.linkDescription || '');
          if (linkPreviewImageFile) {
            formDataObj.append('linkPreviewImage', linkPreviewImageFile);
          }
          break;
      }
  
      await handleSubmit(formDataObj as any);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const resetForm = () => {
    setMediaPreview(null);
    setMediaFile(null);
    setLinkPreviewImage(null);
    setLinkPreviewImageFile(null);
    setActiveTab('text');
    // Don't set local isAnonymous - it will be reset by the hook
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Post Title</Label>
              <Input 
                id="title" 
                name="title"
                placeholder="Give your post a title" 
                value={formData.title || ''}
                onChange={handleChange}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
              <Label htmlFor="anonymous-toggle" className="text-sm font-medium">
                Post anonymously
              </Label>
              <Switch
                id="anonymous-toggle"
                checked={formData.isAnonymous ?? false}
                onCheckedChange={handleAnonymousToggle}
              />
              <span className="text-sm text-gray-600">
                {formData.isAnonymous ? 'Anonymous' : 'Show your name'}
              </span>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Text
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <Image className="h-4 w-4" /> Image
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" /> Video
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-2">
                  <FileAudio className="h-4 w-4" /> Audio
                </TabsTrigger>
                <TabsTrigger value="link" className="flex items-center gap-2">
                  <Link className="h-4 w-4" /> Link
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="textContent">Content</Label>
                  <Textarea 
                    id="textContent" 
                    name="textContent"
                    placeholder="Share your thoughts..." 
                    className={`min-h-32 ${errors.textContent ? 'border-red-500' : ''}`}
                    value={formData.textContent || ''}
                    onChange={handleChange}
                  />
                  {errors.textContent && (
                    <p className="text-red-500 text-sm mt-1">{errors.textContent}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="image" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="imageUpload">Upload Image</Label>
                    <Input 
                      id="imageUpload" 
                      type="file" 
                      accept="image/*"
                      onChange={handleMediaChange}
                    />
                    {!mediaFile && activeTab === 'image' && (
                      <p className="text-red-500 text-sm mt-1">Image file is required</p>
                    )}
                  </div>
                  
                  {mediaPreview && (
                    <div className="mt-2">
                      <img 
                        src={mediaPreview} 
                        alt="Preview" 
                        className="max-h-64 rounded-md object-contain"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="mediaAlt">Alt Text</Label>
                    <Input 
                      id="mediaAlt" 
                      name="mediaAlt"
                      placeholder="Describe the image for accessibility"
                      value={formData.mediaAlt || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="video" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="videoUpload">Upload Video</Label>
                    <Input 
                      id="videoUpload" 
                      type="file" 
                      accept="video/*"
                      onChange={handleMediaChange}
                    />
                    {!mediaFile && activeTab === 'video' && (
                      <p className="text-red-500 text-sm mt-1">Video file is required</p>
                    )}
                  </div>
                  
                  {mediaPreview && mediaFile?.type.startsWith('video/') && (
                    <div className="mt-2">
                      <video 
                        src={mediaPreview} 
                        controls 
                        className="max-h-64 w-full rounded-md"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="mediaAlt">Description</Label>
                    <Input 
                      id="mediaAlt" 
                      name="mediaAlt"
                      placeholder="Describe the video for accessibility"
                      value={formData.mediaAlt || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audio" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="audioUpload">Upload Audio</Label>
                    <Input 
                      id="audioUpload" 
                      type="file" 
                      accept="audio/*"
                      onChange={handleMediaChange}
                    />
                    {!mediaFile && activeTab === 'audio' && (
                      <p className="text-red-500 text-sm mt-1">Audio file is required</p>
                    )}
                  </div>
                  
                  {mediaPreview && mediaFile?.type.startsWith('audio/') && (
                    <div className="mt-2">
                      <audio 
                        src={mediaPreview} 
                        controls 
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="mediaAlt">Description</Label>
                    <Input 
                      id="mediaAlt" 
                      name="mediaAlt"
                      placeholder="Describe the audio for accessibility"
                      value={formData.mediaAlt || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="link" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="linkUrl">Link URL</Label>
                    <Input 
                      id="linkUrl" 
                      name="linkUrl"
                      placeholder="https://example.com" 
                      value={formData.linkUrl || ''}
                      onChange={handleChange}
                      className={errors.linkUrl ? 'border-red-500' : ''}
                    />
                    {errors.linkUrl && (
                      <p className="text-red-500 text-sm mt-1">{errors.linkUrl}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="linkDescription">Description</Label>
                    <Textarea 
                      id="linkDescription" 
                      name="linkDescription"
                      placeholder="Describe what this link is about" 
                      value={formData.linkDescription || ''}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="linkPreviewUpload">Preview Image (Optional)</Label>
                    <Input 
                      id="linkPreviewUpload" 
                      type="file" 
                      accept="image/*"
                      onChange={handleLinkPreviewImageChange}
                    />
                    
                    {linkPreviewImage && (
                      <div className="mt-2">
                        <img 
                          src={linkPreviewImage} 
                          alt="Link preview" 
                          className="max-h-40 rounded-md object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isPending}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2"
            >
              {isPending && <Loader size="small" />}
              {isPending ? 'Creating...' : 'Create Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;