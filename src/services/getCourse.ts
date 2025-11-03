import axios from "axios";


export const getSingleCourse = async (id: string) => {
    try {
        const response = axios.get(`/api/courses/${id}`);
        return (await response).data;
    } catch (error) {
        return error;
    }
}

export const getSingleCourseModule = async (id: string, ids: string) => {
    try {
        const response = axios.get(`/api/courses/${id}/modules/${ids}`);
        return (await response).data;
    } catch (error) {
        return error;
    }
}



export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseLevel: string;
  courseCategory: string;
  courseLanguage: string;
  timeToComplete: string;
  courseInstructorFullName: string;
  userName: string;
  completionMessage: string;
  completedAt: string;
  createdAt: string;
}

interface CertificateResponse {
  success: boolean;
  data: Certificate;
  message: string;
}

export const getCertificate = async (courseId: string) => {
  try {
    const response = await axios.get<CertificateResponse>(`/api/courses/${courseId}/certificate`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postCertificate = async (courseId: string) => {
  try {
    const response = await axios.post<CertificateResponse>(`/api/courses/${courseId}/certificate`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllCertificatesByUser = async () => {
  try {
    const response = await axios.get<CertificateResponse[]>('/api/certificates');
    return response.data;
  } catch (error) {
    throw error;
  }
}