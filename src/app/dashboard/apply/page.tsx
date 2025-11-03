
'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import showToast from '@/utils/showToast';
import { useSession } from 'next-auth/react';

const donationApplicationSchema = z.object({
  projectTitle: z.string().min(5, 'Project title must be at least 5 characters'),
  organization: z.string().optional(),
  projectDescription: z.string().min(100, 'Project description must be at least 100 characters'),
  projectGoals: z.string().min(50, 'Project goals must be at least 50 characters'),
  budgetAmount: z.string().min(1, 'Budget amount is required'),
  duration: z.string().min(1, 'Project duration is required'),
  email: z.string(),
  expectedImpact: z.string().min(50, 'Expected impact must be at least 50 characters'),
});

type DonationApplicationFormValues = z.infer<typeof donationApplicationSchema>;

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

export default function DonationApplicationForm () {
  const [certificates, setCertificates] = useState<FileWithPreview[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const { data: session} = useSession();
  const fullName = session?.user?.fullName;
  const phoneNumber = session?.user?.phoneNumber;
  const form = useForm<DonationApplicationFormValues>({
    resolver: zodResolver(donationApplicationSchema),
    defaultValues: {
      projectTitle: '',
      organization: '',
      projectDescription: '',
      projectGoals: '',
      budgetAmount: '',
      email: '',
      duration: '',
      expectedImpact: '',
    },
  });

  const submitApplication = useMutation({
    mutationFn: async (data: DonationApplicationFormValues) => {
      const formData = new FormData();
      
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key as keyof DonationApplicationFormValues] || '');
      });

      certificates.forEach((cert, index) => {
        formData.append(`certificates`, cert.file);
      });

      const response = await axios.post('/api/donations/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
    showToast("Application Submitted! ", "success")
      form.reset();
      setCertificates([]);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message, "error")

    },
  });

  const onSubmit = (data: DonationApplicationFormValues) => {
    if (!session) {
      showToast("Authentication Required", "error")
      return;
    }

    if (certificates.length === 0) {
      setUploadError('Please upload at least one certificate');
      return;
    }
    submitApplication.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadError('');

    const newFiles: FileWithPreview[] = [];
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Only PDF and image files (JPEG, PNG) are allowed');
        return;
      }

      if (file.size > maxSize) {
        setUploadError('File size must be less than 5MB');
        return;
      }

      const fileWithPreview: FileWithPreview = {
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
      };

      newFiles.push(fileWithPreview);
    });

    setCertificates([...certificates, ...newFiles]);
  };

  const removeCertificate = (id: string) => {
    setCertificates(certificates.filter((cert) => cert.id !== id));
    setUploadError('');
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl">
        
        <Card className="shadow-2xl pt-0">
          <CardHeader className="bg-slate-700 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold py-5">Apply for Donation</CardTitle>
            <CardDescription className="text-green-50">
              Submit your project proposal to receive funding support
            </CardDescription>
          </CardHeader>
          {session && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg mx-5">
                <h4 className="text-sm font-semibold text-green-800 mb-2">Applicant Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                  <div>
                    <span className="font-medium">Name:</span> {session.user?.fullName || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Phone Number:</span> {session.user?.phoneNumber || 'N/A'}
                  </div>
                </div>
              </div>
            )}

          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-2">
                      1
                    </span>
                    Personal Information
                  </h3>
                  

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <FormField
                      control={form.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your organization name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-2">
                      2
                    </span>
                    Project Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="projectTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your project title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project in detail. What problem does it solve? Who will benefit from it?"
                            className="min-h-[150px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 100 characters ({field.value?.length || 0}/100)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Goals & Objectives *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What are the main goals and objectives of your project?"
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 50 characters ({field.value?.length || 0}/50)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedImpact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Impact *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What impact do you expect your project to have? How will you measure success?"
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 50 characters ({field.value?.length || 0}/50)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budgetAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Amount (USD) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Duration *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 6 months, 1 year" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-2">
                      3
                    </span>
                    Supporting Documents
                  </h3>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Certificates & Documents *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        id="certificate-upload"
                      />
                      <label
                        htmlFor="certificate-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, JPG, PNG (Max 5MB per file)
                        </p>
                      </label>
                    </div>

                    {uploadError && (
                      <Alert variant="destructive">
                        <AlertDescription>{uploadError}</AlertDescription>
                      </Alert>
                    )}

                    {/* Uploaded Files List */}
                    {certificates.length > 0 && (
                      <div className="space-y-2 mt-4">
                        {certificates.map((cert) => (
                          <div
                            key={cert.id}
                            className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {cert.file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(cert.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCertificate(cert.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setCertificates([]);
                    }}
                    disabled={submitApplication.isPending}
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitApplication.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                  >
                    {submitApplication.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
