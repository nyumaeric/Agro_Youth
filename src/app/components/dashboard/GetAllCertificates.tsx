"use client";
import { Award, Download, Calendar, BookOpen, Trophy } from "lucide-react";
import { useState, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import showToast from "@/utils/showToast";
import { Button } from "@/components/ui/button";
import { useAllCertificatesByUser } from "@/hooks/useGetAllCertificates";

interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  completionMessage: string;
  completedAt: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  courseDescription: string;
  courseLevel: string;
  courseCategory: string;
  timeToComplete: string;
  courseInstructorFullName: string;
}

const CertificateCard = ({ certificate }: { certificate: Certificate }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    setIsDownloading(true);
    showToast("Generating PDF...", "success");

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      const yOffset = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;

      pdf.addImage(imgData, "PNG", 0, yOffset, imgWidth, imgHeight);
      const fileName = `${certificate.courseTitle.replace(/[^a-z0-9]/gi, "_")}_Certificate.pdf`;
      pdf.save(fileName);

      showToast("Certificate downloaded successfully!", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Failed to download certificate. Please try again.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Card Preview */}
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden group">
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-b-4 border-green-600">
          <div className="flex items-start justify-between mb-4">
            <Award className="w-12 h-12 text-green-600" />
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
              Completed
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
            {certificate.courseTitle}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(certificate.completedAt)}</span>
          </div>
        </div>

        <div className="p-5 space-y-4">

          <p className="text-sm text-gray-600 line-clamp-2">
            {certificate.completionMessage}
          </p>

          <div className="text-xs text-gray-500">
            Instructor: {certificate.courseInstructorFullName}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setShowPreview(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <Trophy className="w-4 h-4" />
              View
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Download className={`w-4 h-4 ${isDownloading ? "animate-bounce" : ""}`} />
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
          </div>
        </div>
      </div>

      {/* Full Certificate Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-green-600" />
                Your Certificate
              </h2>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${isDownloading ? "animate-bounce" : ""}`} />
                  {isDownloading ? "Generating..." : "Download PDF"}
                </Button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8">
              <div
                ref={certificateRef}
                className="bg-white border-8 border-green-600 p-12 rounded-lg shadow-lg"
              >
                <div className="relative">
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-yellow-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-yellow-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-yellow-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-yellow-500 rounded-br-lg"></div>

                  <div className="text-center space-y-8 py-8">
                    <div className="space-y-2">
                      <div className="flex justify-center mb-4">
                        <Award className="w-20 h-20 text-green-600" />
                      </div>
                      <h1 className="text-5xl font-bold text-gray-900 tracking-wide">
                        CERTIFICATE
                      </h1>
                      <p className="text-xl text-gray-600">OF COMPLETION</p>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="h-px w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg text-gray-600">This is to certify that</p>
                      <p className="text-4xl font-bold text-green-600">{certificate.userName}</p>
                      <p className="text-lg text-gray-600">has successfully completed</p>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-gray-900">
                        {certificate.courseTitle}
                      </h2>
                    </div>

                    <div className="max-w-2xl mx-auto">
                      <p className="text-gray-700 leading-relaxed">
                        {certificate.completionMessage}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 mt-8 border-t-2 border-gray-200">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Date of Completion</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(certificate.completedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Course Instructor</p>
                        <p className="font-semibold text-gray-900">
                          {certificate.courseInstructorFullName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Course Duration</p>
                        <p className="font-semibold text-gray-900">
                          {certificate.timeToComplete}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-xs text-gray-400">
                        Certificate ID: {certificate.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const CertificateSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-b-4 border-green-600">
      <Skeleton width={48} height={48} className="mb-4" />
      <Skeleton width="80%" height={24} className="mb-2" />
      <Skeleton width="50%" height={16} />
    </div>
    <div className="p-5 space-y-4">
      <Skeleton width="60%" height={20} />
      <Skeleton count={2} height={14} />
      <div className="flex gap-2 pt-2">
        <Skeleton height={40} className="flex-1" />
        <Skeleton height={40} className="flex-1" />
      </div>
    </div>
  </div>
);

export default function CertificatesGallery() {
  const { data: certificatesData, isPending } = useAllCertificatesByUser();

  const certificates = Array.isArray(certificatesData)
  ? certificatesData
  : Array.isArray((certificatesData as any)?.data)
  ? (certificatesData as any).data
  : [];



  return (
    <div className="space-y-6 pt-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-green-600" />
            My Certificates
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Your earned certificates and achievements
          </p>
        </div>
        {certificates.length > 0 && (
          <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-semibold">
            {certificates.length} {certificates.length === 1 ? "Certificate" : "Certificates"}
          </div>
        )}
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CertificateSkeleton key={i} />
          ))}
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert: Certificate) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
            <Award className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Certificates Yet</h3>
          <p className="text-sm text-gray-600 mb-4">
            Complete courses to earn your certificates
          </p>
          <Button className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <BookOpen className="w-4 h-4" />
            Browse Courses
          </Button>
        </div>
      )}
    </div>
  );
}