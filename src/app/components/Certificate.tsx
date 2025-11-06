// "use client";
// import { Certificate as CertificateType } from "@/hooks/useCourses";
// import { Award, Download, X } from "lucide-react";
// import { useRef, useState } from "react";
// import showToast from "@/utils/showToast";
// import { Button } from "@/components/ui/button";

// interface CertificateProps {
//   certificate: CertificateType;
//   onClose: () => void;
//   userName?: string;
// }

// export default function Certificate({ certificate, onClose, userName }: CertificateProps) {
//   const certificateRef = useRef<HTMLDivElement>(null);
//   const [isDownloading, setIsDownloading] = useState(false);
//   const handleDownload = async () => {
//     const element = certificateRef.current;
//     if (!element) return;

//     setIsDownloading(true);
//     showToast("Generating PDF...", "success");

//     try {
//       const html2canvas = (await import("html2canvas")).default;
//       const { jsPDF } = await import("jspdf");

//       const canvas = await html2canvas(element, {
//         scale: 3, 
//         backgroundColor: "#ffffff",
//         logging: false,
//         useCORS: true,
//         allowTaint: true,
//       });

//       const imgData = canvas.toDataURL("image/png", 1.0);

//       const pdf = new jsPDF({
//         orientation: "landscape",
//         unit: "mm",
//         format: "a4",
//       });

//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
//       const imgWidth = pdfWidth;
//       const imgHeight = (canvas.height * pdfWidth) / canvas.width;

//       const yOffset = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;

//       pdf.addImage(imgData, "PNG", 0, yOffset, imgWidth, imgHeight);

//       const fileName = `${certificate.courseTitle.replace(/[^a-z0-9]/gi, "_")}_Certificate.pdf`;

//       pdf.save(fileName);

//       showToast("Certificate downloaded successfully!", "success");
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       showToast("Failed to download certificate. Please try again.", "error");
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//       <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
//         {/* Header Controls */}
//         <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//           <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <Award className="w-6 h-6 text-green-600" />
//             Your Certificate
//           </h2>
//           <div className="flex items-center gap-3">
//             <Button
//               onClick={handleDownload}
//               disabled={isDownloading}
//               className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <Download className={`w-4 h-4 ${isDownloading ? "animate-bounce" : ""}`} />
//               {isDownloading ? "Generating..." : "Download PDF"}
//             </Button>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <X className="w-5 h-5 text-gray-600" />
//             </button>
//           </div>
//         </div>

//         {/* Certificate Content */}
//         <div className="p-8">
//           <div
//             ref={certificateRef}
//             className="bg-white border-8 border-green-600 p-12 rounded-lg shadow-lg"
//           >
//             {/* Decorative Corner Elements */}
//             <div className="relative">
//               <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-yellow-500 rounded-tl-lg"></div>
//               <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-yellow-500 rounded-tr-lg"></div>
//               <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-yellow-500 rounded-bl-lg"></div>
//               <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-yellow-500 rounded-br-lg"></div>

//               {/* Certificate Content */}
//               <div className="text-center space-y-8 py-8">
//                 {/* Header */}
//                 <div className="space-y-2">
//                   <div className="flex justify-center mb-4">
//                     <Award className="w-20 h-20 text-green-600" />
//                   </div>
//                   <h1 className="text-5xl font-bold text-gray-900 tracking-wide">
//                     CERTIFICATE
//                   </h1>
//                   <p className="text-xl text-gray-600">OF COMPLETION</p>
//                 </div>

//                 <div className="flex items-center justify-center">
//                   <div className="h-px w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
//                 </div>

//                 <div className="space-y-4">
//                   <p className="text-lg text-gray-600">This is to certify that</p>
//                   <p className="text-4xl font-bold text-green-600">{userName}</p>
//                   <p className="text-lg text-gray-600">has successfully completed</p>
//                 </div>

//                 <div className="space-y-2">
//                   <h2 className="text-3xl font-bold text-gray-900">
//                     {certificate.courseTitle}
//                   </h2>
//                   <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mt-4">
//                     {certificate.courseLevel && (
//                       <span className="px-3 py-1 bg-gray-100 rounded-full">
//                         {certificate.courseLevel}
//                       </span>
//                     )}
//                     {certificate.courseCategory && (
//                       <span className="px-3 py-1 bg-gray-100 rounded-full">
//                         {certificate.courseCategory}
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 <div className="max-w-2xl mx-auto">
//                   <p className="text-gray-700 leading-relaxed">
//                     {certificate.completionMessage}
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 mt-8 border-t-2 border-gray-200">
//                   <div>
//                     <p className="text-sm text-gray-500 mb-1">Date of Completion</p>
//                     <p className="font-semibold text-gray-900">
//                       {formatDate(certificate.completedAt)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500 mb-1">Course Instructor</p>
//                     <p className="font-semibold text-gray-900">
//                       {certificate.courseInstructorFullName}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500 mb-1">Course Duration</p>
//                     <p className="font-semibold text-gray-900">
//                       {certificate.timeToComplete}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="pt-4">
//                   <p className="text-xs text-gray-400">
//                     Certificate ID: {certificate.id}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";
import { Certificate as CertificateType } from "@/hooks/useCourses";
import { Award, Download, X } from "lucide-react";
import { useRef, useState } from "react";
import showToast from "@/utils/showToast";
import { Button } from "@/components/ui/button";

interface CertificateProps {
  certificate: CertificateType;
  onClose: () => void;
  userName?: string;
}

export default function Certificate({ certificate, onClose, userName }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const element = certificateRef.current;
    if (!element) return;

    setIsDownloading(true);
    showToast("Generating PDF...", "success");

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Create a clone to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Apply inline styles to fix color issues
      clone.style.backgroundColor = "#ffffff";
      clone.style.color = "#000000";
      
      // Replace all problematic colors with standard hex/rgb values
      const allElements = clone.querySelectorAll("*");
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const computedStyle = window.getComputedStyle(element.querySelector(`*:nth-child(${Array.from(allElements).indexOf(el) + 1})`) || element);
        
        // Fix background colors
        if (computedStyle.backgroundColor) {
          htmlEl.style.backgroundColor = computedStyle.backgroundColor;
        }
        
        // Fix text colors
        if (computedStyle.color) {
          htmlEl.style.color = computedStyle.color;
        }
        
        // Fix border colors
        if (computedStyle.borderColor) {
          htmlEl.style.borderColor = computedStyle.borderColor;
        }
      });

      // Append clone temporarily to render
      document.body.appendChild(clone);
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")


      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        removeContainer: true,
      });


      // Remove the clone
      document.body.removeChild(clone);

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
      console.error("Error generating PDF000000000000000000:", error);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header Controls */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-green-600" />
            Your Certificate
          </h2>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className={`w-4 h-4 ${isDownloading ? "animate-bounce" : ""}`} />
              {isDownloading ? "Generating..." : "Download PDF"}
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Certificate Content */}
        <div className="p-8">
          <div
            ref={certificateRef}
            style={{ backgroundColor: "#ffffff" }}
            className="border-8 rounded-lg shadow-lg"
            data-certificate="true"
          >
            <style jsx>{`
              [data-certificate="true"] {
                border-color: #16a34a !important;
              }
              [data-certificate="true"] .corner-border {
                border-color: #eab308 !important;
              }
              [data-certificate="true"] .gradient-line {
                background: linear-gradient(to right, transparent, #eab308, transparent) !important;
              }
            `}</style>

            {/* Decorative Corner Elements */}
            <div className="relative p-12">
              <div className="absolute top-0 left-0 w-16 h-16 rounded-tl-lg corner-border" style={{ borderTop: "4px solid #eab308", borderLeft: "4px solid #eab308" }}></div>
              <div className="absolute top-0 right-0 w-16 h-16 rounded-tr-lg corner-border" style={{ borderTop: "4px solid #eab308", borderRight: "4px solid #eab308" }}></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 rounded-bl-lg corner-border" style={{ borderBottom: "4px solid #eab308", borderLeft: "4px solid #eab308" }}></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 rounded-br-lg corner-border" style={{ borderBottom: "4px solid #eab308", borderRight: "4px solid #eab308" }}></div>

              {/* Certificate Content */}
              <div className="text-center space-y-8 py-8">
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex justify-center mb-4">
                    <Award className="w-20 h-20" style={{ color: "#16a34a" }} />
                  </div>
                  <h1 className="text-5xl font-bold tracking-wide" style={{ color: "#111827" }}>
                    CERTIFICATE
                  </h1>
                  <p className="text-xl" style={{ color: "#4b5563" }}>OF COMPLETION</p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="h-px w-24 gradient-line"></div>
                </div>

                <div className="space-y-4">
                  <p className="text-lg" style={{ color: "#4b5563" }}>This is to certify that</p>
                  <p className="text-4xl font-bold" style={{ color: "#16a34a" }}>{userName}</p>
                  <p className="text-lg" style={{ color: "#4b5563" }}>has successfully completed</p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold" style={{ color: "#111827" }}>
                    {certificate.courseTitle}
                  </h2>
                  <div className="flex items-center justify-center gap-4 text-sm mt-4">
                    {certificate.courseLevel && (
                      <span className="px-3 py-1 rounded-full" style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}>
                        {certificate.courseLevel}
                      </span>
                    )}
                    {certificate.courseCategory && (
                      <span className="px-3 py-1 rounded-full" style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}>
                        {certificate.courseCategory}
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-w-2xl mx-auto">
                  <p className="leading-relaxed" style={{ color: "#374151" }}>
                    {certificate.completionMessage}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 mt-8" style={{ borderTop: "2px solid #e5e7eb" }}>
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#6b7280" }}>Date of Completion</p>
                    <p className="font-semibold" style={{ color: "#111827" }}>
                      {formatDate(certificate.completedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#6b7280" }}>Course Instructor</p>
                    <p className="font-semibold" style={{ color: "#111827" }}>
                      {certificate.courseInstructorFullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#6b7280" }}>Course Duration</p>
                    <p className="font-semibold" style={{ color: "#111827" }}>
                      {certificate.timeToComplete}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-xs" style={{ color: "#9ca3af" }}>
                    Certificate ID: {certificate.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}