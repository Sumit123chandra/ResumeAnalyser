// store/useResumeStore.js
import { create } from 'zustand';

export const useResumeStore = create((set) => ({
  resumeFileUrl: null,     // preview URL from Cloudinary
  resumeText: '',
  jobDescription: '',
  analysis: null,

  // setters
  setResumeFileUrl: (url) => set({ resumeFileUrl: url }),
  setResumeText: (text) => set({ resumeText: text }),
  setJobDescription: (jd) => set({ jobDescription: jd }),
  setAnalysis: (a) => set({ analysis: a }),
}));
