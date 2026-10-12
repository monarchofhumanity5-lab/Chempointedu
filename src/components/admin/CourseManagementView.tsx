import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Course, Subject, Chapter, Lesson } from '../../types';
import { api } from '../../services/api';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  FolderTree,
  BookOpen,
  PlayCircle,
  FileText,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Circle,
  Clock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowLeft,
  X,
  Save,
  Link,
  Upload,
  RotateCw,
  Ban,
} from 'lucide-react';

interface CourseManagementViewProps {
  initialCourseId?: string | null;
  onBackToDashboard: () => void;
}

export const CourseManagementView: React.FC<CourseManagementViewProps> = ({
  initialCourseId,
  onBackToDashboard,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(initialCourseId || null);
  const [courseData, setCourseData] = useState<(Course & { subjects: Subject[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Partial<Subject> | null>(null);

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Partial<Chapter> | null>(null);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [videoMode, setVideoMode] = useState<'link' | 'upload'>('link');
  const [materialMode, setMaterialMode] = useState<'upload' | 'link'>('upload');
  const [selectedMaterialFile, setSelectedMaterialFile] = useState<File | null>(null);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const [materialUploadProgress, setMaterialUploadProgress] = useState(0);
  const [materialUploadStatus, setMaterialUploadStatus] = useState('');
  const [materialUploadError, setMaterialUploadError] = useState<string | null>(null);
  const cancelUploadRef = useRef<(() => void) | null>(null);
  const [newMaterial, setNewMaterial] = useState<{
    title: string;
    file_name: string;
    file_type: string;
    file_size: string;
    url: string;
  }>({
    title: '',
    file_name: '',
    file_type: 'pdf',
    file_size: '',
    url: '',
  });

  // Expanded states
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Confirm Modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const list = await api.courses.list(false);
      setCourses(list);
      if (!selectedCourseId && list.length > 0) {
        setSelectedCourseId(list[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setNotice({ type: 'error', text: err.message || 'Failed to load courses.' });
    } finally {
      setLoading(false);
    }
  };

  const loadCourseHierarchy = async (id: string) => {
    try {
      const data = await api.courses.getById(id);
      setCourseData(data);

      // Auto expand all subjects and chapters
      const subMap: Record<string, boolean> = {};
      const chMap: Record<string, boolean> = {};
      data.subjects?.forEach((s) => {
        subMap[s.id] = true;
        s.chapters?.forEach((ch) => {
          chMap[ch.id] = true;
        });
      });
      setExpandedSubjects(subMap);
      setExpandedChapters(chMap);
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Failed to load course hierarchy.' });
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseHierarchy(selectedCourseId);
    }
  }, [selectedCourseId]);

  // Course Handlers
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse?.title || !editingCourse?.code) return;
    try {
      if (editingCourse.id) {
        await api.courses.update(editingCourse.id, editingCourse);
        setNotice({ type: 'success', text: 'Course updated successfully.' });
      } else {
        const created = await api.courses.create(editingCourse);
        setSelectedCourseId(created.id);
        setNotice({ type: 'success', text: 'New course created successfully.' });
      }
      setIsCourseModalOpen(false);
      setEditingCourse(null);
      await loadCourses();
      if (selectedCourseId) await loadCourseHierarchy(selectedCourseId);
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Course save failed.' });
    }
  };

  const promptDeleteCourse = (id: string, title?: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Course',
      message: `Are you sure you want to delete "${title || courseData?.title || 'this course'}" and all of its subjects, chapters, and lessons? This action cannot be undone.`,
      confirmText: 'Delete Course',
      onConfirm: async () => {
        const remaining = courses.filter((c) => c.id !== id);
        setCourses(remaining);
        setSelectedCourseId(remaining[0]?.id || null);
        setConfirmDialog(null);
        setIsDeleting(false);
        try {
          await api.courses.delete(id);
          setNotice({ type: 'success', text: 'Course removed successfully.' });
        } catch (err: any) {
          setNotice({ type: 'error', text: err.message || 'Failed to delete course.' });
          await loadCourses();
        }
      },
    });
  };

  // Subject Handlers
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject?.title || !selectedCourseId) return;
    try {
      if (editingSubject.id) {
        await api.subjects.update(editingSubject.id, editingSubject);
        setNotice({ type: 'success', text: 'Subject updated successfully.' });
      } else {
        await api.subjects.create({
          ...editingSubject,
          course_id: selectedCourseId,
        });
        setNotice({ type: 'success', text: 'Subject created successfully.' });
      }
      setIsSubjectModalOpen(false);
      setEditingSubject(null);
      await loadCourseHierarchy(selectedCourseId);
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Subject save failed.' });
    }
  };

  const promptDeleteSubject = (id: string, title?: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Subject',
      message: `Are you sure you want to delete subject "${title || 'this subject'}"? All chapters and lessons inside this subject will be permanently removed.`,
      confirmText: 'Delete Subject',
      onConfirm: async () => {
        setCourseData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            subjects: prev.subjects.filter((s) => s.id !== id),
          };
        });
        setConfirmDialog(null);
        setIsDeleting(false);
        try {
          await api.subjects.delete(id);
          setNotice({ type: 'success', text: `Subject "${title || 'item'}" removed successfully.` });
          if (selectedCourseId) await loadCourseHierarchy(selectedCourseId);
        } catch (err: any) {
          setNotice({ type: 'error', text: err.message || 'Failed to delete subject.' });
          if (selectedCourseId) await loadCourseHierarchy(selectedCourseId);
        }
      },
    });
  };

  // Chapter Handlers
  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter?.title || !editingChapter?.subject_id) return;
    try {
      if (editingChapter.id) {
        await api.chapters.update(editingChapter.id, editingChapter);
        setNotice({ type: 'success', text: 'Chapter updated successfully.' });
      } else {
        await api.chapters.create(editingChapter);
        setNotice({ type: 'success', text: 'Chapter created successfully.' });
      }
      setIsChapterModalOpen(false);
      setEditingChapter(null);
      if (selectedCourseId) await loadCourseHierarchy(selectedCourseId);
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Chapter save failed.' });
    }
  };

  const promptDeleteChapter = (id: string, title?: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Chapter',
      message: `Are you sure you want to delete chapter "${title || 'this chapter'}"? All contained lessons will also be removed.`,
      confirmText: 'Delete Chapter',
      onConfirm: async () => {
        setCourseData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            subjects: prev.subjects.map((s) => ({
              ...s,
              chapters: s.chapters?.filter((ch) => ch.id !== id),
            })),
          };
        });
        setConfirmDialog(null);
        setIsDeleting(false);
        try {
          await api.chapters.delete(id);
          setNotice({ type: 'success', text: `Chapter "${title || 'item'}" removed successfully.` });
          if (selectedCourseId) await loadCourseHierarchy(selectedCourseId);
        } catch (err: any) {
          setNotice({ type: 'error', text: err.message || 'Failed to delete chapter.' });
          if (selectedCourseId) await loadCourseHierarchy(selectedCourseId);
        }
      },
    });
  };

  // Lesson Handlers
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson?.title || !editingLesson?.chapter_id) return;
    try {
      if (editingLesson.id) {
        await api.lessons.update(editingLesson.id, editingLesson);
        setNotice({ type: 'success', text: 'Lesson updated successfully.' });
      } else {
        await api.lessons.create(editingLesson);
        setNotice({ type: 'success', text: 'Lesson created successfully.' });
      }
      setIsLessonModalOpen(false);
      setEditingLesson(null);
      if (selectedCourseId) await loadCourseHierarchy(selectedCourseId);
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Lesson save failed.' });
    }
  };

  const handleTogglePublishLesson = async (lessonId: string) => {
    try {
      const res = await api.lessons.togglePublish(lessonId);
      if (selectedCourseId) await loadCourseHierarchy(selectedCourseId);
      setNotice({
        type: 'success',
        text: res.is_published ? 'Lesson is now published to students.' : 'Lesson set to draft mode.',
      });
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Publish toggle failed.' });
    }
  };

  const promptDeleteLesson = (id: string, title?: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Lesson',
      message: `Are you sure you want to permanently delete lesson "${title || 'this lesson'}"?`,
      confirmText: 'Delete Lesson',
      onConfirm: async () => {
        setCourseData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            subjects: prev.subjects.map((s) => ({
              ...s,
              chapters: s.chapters?.map((ch) => ({
                ...ch,
                lessons: ch.lessons?.filter((l) => l.id !== id),
              })),
            })),
          };
        });
        setConfirmDialog(null);
        setIsDeleting(false);
        try {
          await api.lessons.delete(id);
          setNotice({ type: 'success', text: `Lesson "${title || 'item'}" deleted successfully.` });
          if (selectedCourseId) await loadCourseHierarchy(selectedCourseId);
        } catch (err: any) {
          setNotice({ type: 'error', text: err.message || 'Failed to delete lesson.' });
          if (selectedCourseId) await loadCourseHierarchy(selectedCourseId);
        }
      },
    });
  };

  // Study Materials & Video Handlers in Lesson Modal
  const handleRemoveMaterial = (index: number, materialId?: string) => {
    if (!editingLesson) return;
    const currentMaterials = editingLesson.study_materials || [];
    const updated = currentMaterials.filter((_, i) => i !== index);
    setEditingLesson({ ...editingLesson, study_materials: updated });
    if (editingLesson.id && materialId) {
      api.lessons.deleteMaterial(editingLesson.id, materialId).catch(() => {});
    }
    setNotice({ type: 'success', text: 'Study material removed.' });
  };

  const handleMaterialFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMaterialUploadError(null);

    const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB (Supabase bucket limit)
    if (file.size > MAX_UPLOAD_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const errMsg = `File "${file.name}" is ${sizeMB} MB, which exceeds the 50 MB cloud storage limit. For files larger than 50 MB, please use the "External Link (URL)" option to attach via Google Drive, Dropbox, or OneDrive.`;
      setNotice({
        type: 'error',
        text: errMsg,
      });
      setMaterialUploadError(errMsg);
      setSelectedMaterialFile(null);
      setMaterialUploadStatus(`File exceeds 50 MB limit (${sizeMB} MB)`);
      e.target.value = '';
      return;
    }

    setSelectedMaterialFile(file);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    setNewMaterial((prev) => ({
      ...prev,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      file_name: file.name,
      file_type: ext,
      file_size: sizeStr,
    }));
    setMaterialUploadProgress(0);
    setMaterialUploadStatus(`Selecting file: ${file.name} (${sizeStr} / max 50 MB)`);
  };

  const handleCancelMaterialUpload = () => {
    if (cancelUploadRef.current) {
      cancelUploadRef.current();
      cancelUploadRef.current = null;
    }
    setIsUploadingMaterial(false);
    setMaterialUploadStatus('Upload canceled by user.');
    setNotice({ type: 'info', text: 'Upload was canceled.' });
  };

  const handleResetMaterialUpload = () => {
    if (isUploadingMaterial && cancelUploadRef.current) {
      cancelUploadRef.current();
      cancelUploadRef.current = null;
    }
    setIsUploadingMaterial(false);
    setSelectedMaterialFile(null);
    setMaterialUploadProgress(0);
    setMaterialUploadStatus('');
    setMaterialUploadError(null);
    setNewMaterial({
      title: '',
      file_name: '',
      file_type: 'pdf',
      file_size: '',
      url: '',
    });
  };

  const handleUploadAndAttachMaterial = async () => {
    if (!selectedMaterialFile) {
      setNotice({ type: 'error', text: 'Please choose a document file (PDF, Doc, Sheet) from your device first.' });
      return;
    }
    if (!editingLesson || !editingLesson.id) {
      setNotice({ type: 'error', text: 'Lesson must be saved or selected before attaching study materials.' });
      return;
    }

    const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
    if (selectedMaterialFile.size > MAX_UPLOAD_BYTES) {
      const err = `File is ${(selectedMaterialFile.size / (1024 * 1024)).toFixed(1)} MB, which exceeds the 50 MB upload limit. Please use the External Link tab to attach via Google Drive or OneDrive.`;
      setNotice({ type: 'error', text: err });
      setMaterialUploadError(err);
      return;
    }

    try {
      setIsUploadingMaterial(true);
      setMaterialUploadError(null);
      setMaterialUploadProgress(0);
      setMaterialUploadStatus('Uploading 0%');

      const result = await api.lessons.uploadStudyMaterialResumable({
        file: selectedMaterialFile,
        lessonId: editingLesson.id,
        title: newMaterial.title.trim() || selectedMaterialFile.name,
        onProgress: (pct) => {
          setMaterialUploadProgress(pct);
        },
        onStatusChange: (status) => {
          setMaterialUploadStatus(status);
        },
        registerCancel: (cancelFn) => {
          cancelUploadRef.current = cancelFn;
        },
      });

      setMaterialUploadProgress(100);
      setMaterialUploadStatus('Uploaded successfully');

      const materialItem = result.material || {
        id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        lesson_id: editingLesson.id,
        title: newMaterial.title.trim() || result.fileName,
        type: 'file' as const,
        file_name: result.fileName,
        file_type: result.fileType,
        file_size: result.fileSize,
        url: result.url,
        created_at: new Date().toISOString(),
      };

      const currentMaterials = editingLesson.study_materials || [];
      const updatedMaterials = currentMaterials.filter((m) => m.id !== materialItem.id);
      updatedMaterials.push(materialItem);

      setEditingLesson({
        ...editingLesson,
        study_materials: updatedMaterials,
        pdf_url: result.url,
        pdf_name: result.fileName,
        pdf_size_mb: parseFloat(result.fileSize) || 1.5,
      });

      setSelectedMaterialFile(null);
      setNewMaterial({
        title: '',
        file_name: '',
        file_type: 'pdf',
        file_size: '',
        url: '',
      });
      setNotice({ type: 'success', text: `"${result.fileName}" permanently saved and attached to lesson.` });
    } catch (err: any) {
      console.error('[ChemPoint Study Material Upload Technical Failure]', {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        fileName: selectedMaterialFile?.name,
        fileSize: selectedMaterialFile?.size,
      });
      const userMessage = err?.message || 'File upload could not be completed. Please check your network connection and retry.';
      setMaterialUploadError(userMessage);
      setNotice({ type: 'error', text: userMessage });
      setMaterialUploadStatus(err?.message === 'Upload canceled by user.' ? 'Upload canceled' : 'Upload failed. Please check details or retry.');
    } finally {
      setIsUploadingMaterial(false);
      cancelUploadRef.current = null;
    }
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !newMaterial.title.trim()) return;

    const fileType = newMaterial.file_type || 'pdf';
    const fileName =
      newMaterial.file_name.trim() ||
      `${newMaterial.title.replace(/\s+/g, '_')}.${fileType}`;
    const fileSize = newMaterial.file_size.trim() || '1.5 MB';
    const url =
      newMaterial.url.trim() ||
      `https://storage.chempoint.edu/materials/${encodeURIComponent(fileName)}`;

    const materialItem = {
      id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      lesson_id: editingLesson.id,
      title: newMaterial.title.trim(),
      type: 'file' as const,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      url: url,
      created_at: new Date().toISOString(),
    };

    const currentMaterials = editingLesson.study_materials || [];
    setEditingLesson({
      ...editingLesson,
      study_materials: [...currentMaterials, materialItem],
      pdf_url: url,
      pdf_name: fileName,
    });

    setNewMaterial({
      title: '',
      file_name: '',
      file_type: 'pdf',
      file_size: '',
      url: '',
    });
    setNotice({ type: 'success', text: 'External document link attached to lesson.' });
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingLesson) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const objectUrl = URL.createObjectURL(file);

    setEditingLesson({
      ...editingLesson,
      video_source_type: 'upload',
      video_file_name: file.name,
      video_file_size: sizeInMB,
      video_url: objectUrl,
      video_title: file.name,
    });
    setNotice({ type: 'success', text: `Video "${file.name}" selected ready for lecture stream.` });
  };

  const handleRemoveVideo = () => {
    if (!editingLesson) return;
    setEditingLesson({
      ...editingLesson,
      video_url: '',
      video_file_name: undefined,
      video_file_size: undefined,
      video_source_type: 'direct',
    });
    setNotice({ type: 'success', text: 'Video removed from lesson.' });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Dynamic Status / Action Feedback Notice */}
      {notice && (
        <div
          id="course-management-notice"
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200 ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="btn-tactile text-xs font-bold text-slate-500 hover:text-purple-700 flex items-center gap-1.5 mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-purple-700" />
            Curriculum & Content Hierarchy
          </h1>
          <p className="text-xs text-slate-500">
            Course → Subject → Chapter → Lesson (Video + PDF Notes)
          </p>
        </div>

        <button
          type="button"
          id="btn-create-new-course"
          onClick={() => {
            setEditingCourse({
              title: '',
              code: '',
              description: '',
              target_class: 'Grade 12 & Droppers',
              instructor_name: 'Dr. Sen & Senior Faculty',
              thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
              is_published: true,
            });
            setIsCourseModalOpen(true);
          }}
          className="btn-tactile px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Course Selector Tabs */}
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-900/60 pl-2 pr-1">
            Active Batch:
          </span>
          {courses.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCourseId(c.id)}
              className={`btn-tactile px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                selectedCourseId === c.id
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <span>{c.code}</span>
              <span className="text-[11px] opacity-80 font-normal truncate max-w-[140px]">
                {c.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Course Content Hierarchy */}
      {courseData ? (
        <div className="space-y-6">
          {/* Course Details Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <img
                src={
                  courseData.thumbnail_url && courseData.thumbnail_url.trim()
                    ? courseData.thumbnail_url
                    : 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80'
                }
                alt={courseData.title}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200/80 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                    {courseData.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      courseData.is_published
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                        : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                    }`}
                  >
                    {courseData.is_published ? 'Live to Enrolled Students' : 'Draft / Unpublished'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{courseData.title}</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{courseData.description}</p>
                <div className="text-[11px] text-slate-500 mt-2 font-medium">
                  Target: <strong className="text-slate-800">{courseData.target_class}</strong> • Instructor:{' '}
                  <strong className="text-slate-800">{courseData.instructor_name}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                id="btn-delete-active-course"
                onClick={() => promptDeleteCourse(courseData.id, courseData.title)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-1.5 transition-colors border border-red-100"
                title="Delete Course and all its curriculum"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Course</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingCourse(courseData);
                  setIsCourseModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 flex items-center gap-1.5 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Course</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingSubject({
                    course_id: courseData.id,
                    title: '',
                    code: 'SUB',
                    color: '#2563eb',
                    sort_order: (courseData.subjects?.length || 0) + 1,
                  });
                  setIsSubjectModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            </div>
          </div>

          {/* Subjects List */}
          <div className="space-y-6">
            {(!courseData.subjects || courseData.subjects.length === 0) ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No subjects in this course yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSubject({
                      course_id: courseData.id,
                      title: 'Physics',
                      code: 'PHY',
                      color: '#2563eb',
                      sort_order: 1,
                    });
                    setIsSubjectModalOpen(true);
                  }}
                  className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white"
                >
                  + Add First Subject
                </button>
              </div>
            ) : (
              courseData.subjects.map((subject) => {
                const isSubExpanded = expandedSubjects[subject.id] !== false;
                return (
                  <div
                    key={subject.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                  >
                    {/* Subject Header */}
                    <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
                      <div
                        className="flex items-center gap-3 cursor-pointer select-none"
                        onClick={() =>
                          setExpandedSubjects((prev) => ({ ...prev, [subject.id]: !prev[subject.id] }))
                        }
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: subject.color || '#3b82f6' }}
                        ></span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">{subject.title}</h3>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                              {subject.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {subject.chapters?.length || 0} Chapters in this subject
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingChapter({
                              subject_id: subject.id,
                              title: '',
                              description: '',
                              chapter_number: (subject.chapters?.length || 0) + 1,
                              estimated_hours: 3,
                            });
                            setIsChapterModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Chapter</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingSubject(subject);
                            setIsSubjectModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                          title="Edit Subject"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          id={`btn-delete-subject-${subject.id}`}
                          onClick={() => promptDeleteSubject(subject.id, subject.title)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSubjects((prev) => ({ ...prev, [subject.id]: !prev[subject.id] }))
                          }
                          className="p-1.5 text-slate-400"
                        >
                          {isSubExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Chapters inside Subject */}
                    {isSubExpanded && (
                      <div className="p-4 space-y-4">
                        {(!subject.chapters || subject.chapters.length === 0) ? (
                          <p className="text-xs text-slate-400 text-center py-4">
                            No chapters in this subject. Click "Add Chapter" above.
                          </p>
                        ) : (
                          subject.chapters.map((chapter) => {
                            const isChExpanded = expandedChapters[chapter.id] !== false;
                            return (
                              <div
                                key={chapter.id}
                                className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs"
                              >
                                {/* Chapter Title Row */}
                                <div className="p-3.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                  <div
                                    className="flex items-center gap-2.5 cursor-pointer select-none"
                                    onClick={() =>
                                      setExpandedChapters((prev) => ({
                                        ...prev,
                                        [chapter.id]: !prev[chapter.id],
                                      }))
                                    }
                                  >
                                    <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-800 flex items-center justify-center text-xs font-bold">
                                      {chapter.chapter_number}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-xs text-slate-900">
                                        {chapter.title}
                                      </h4>
                                      <span className="text-[10px] text-slate-400">
                                        {chapter.lessons?.length || 0} Lessons • Est. {chapter.estimated_hours} hrs
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingLesson({
                                          chapter_id: chapter.id,
                                          title: '',
                                          description: '',
                                          duration_minutes: 35,
                                          lesson_order: (chapter.lessons?.length || 0) + 1,
                                          is_published: true,
                                          video_url: 'https://www.youtube.com/watch?v=XHGKIzCcVa0',
                                          video_title: '',
                                          video_source_type: 'youtube',
                                          pdf_name: 'Chapter_Formula_Sheet.pdf',
                                          pdf_pages: 12,
                                          pdf_size_mb: 2.5,
                                          pdf_notes_content:
                                            '# Master Notes & Key Principles\n\n- Key Formula 1: ...\n- Key Concept 2: ...',
                                        });
                                        setVideoMode('link');
                                        setIsLessonModalOpen(true);
                                      }}
                                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Add Lesson</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingChapter(chapter);
                                        setIsChapterModalOpen(true);
                                      }}
                                      className="p-1 text-slate-400 hover:text-slate-700"
                                      title="Edit Chapter"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      id={`btn-delete-chapter-${chapter.id}`}
                                      onClick={() => promptDeleteChapter(chapter.id, chapter.title)}
                                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                      title="Delete Chapter"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Lessons inside Chapter */}
                                {isChExpanded && (
                                  <div className="p-3 space-y-2 divide-y divide-slate-100">
                                    {(!chapter.lessons || chapter.lessons.length === 0) ? (
                                      <p className="text-[11px] text-slate-400 text-center py-2">
                                        No lessons in this chapter yet.
                                      </p>
                                    ) : (
                                      chapter.lessons.map((lesson) => (
                                        <div
                                          key={lesson.id}
                                          className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                        >
                                          <div className="flex items-start gap-2.5 min-w-0">
                                            <PlayCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                            <div>
                                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                                <span>{lesson.title}</span>
                                                <span
                                                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                                    lesson.is_published
                                                      ? 'bg-emerald-50 text-emerald-700'
                                                      : 'bg-amber-50 text-amber-800'
                                                  }`}
                                                >
                                                  {lesson.is_published ? 'Published' : 'Hidden/Draft'}
                                                </span>
                                              </div>
                                              <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3 mt-0.5">
                                                <span>{lesson.duration_minutes} Mins</span>
                                                {lesson.video_url && (
                                                  <span className="text-blue-600 font-medium truncate max-w-[200px]">
                                                    Video: {lesson.video_url}
                                                  </span>
                                                )}
                                                {lesson.pdf_name && (
                                                  <span className="text-slate-600">
                                                    PDF Notes: {lesson.pdf_name} ({lesson.pdf_pages} pgs)
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Lesson Actions: Publish Toggle, Edit, Delete */}
                                          <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => handleTogglePublishLesson(lesson.id)}
                                              className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                                                lesson.is_published
                                                  ? 'text-amber-700 hover:bg-amber-50'
                                                  : 'text-emerald-700 hover:bg-emerald-50'
                                              }`}
                                              title={lesson.is_published ? 'Unpublish lesson' : 'Publish lesson'}
                                            >
                                              {lesson.is_published ? 'Unpublish' : 'Publish'}
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() => {
                                                setEditingLesson(lesson);
                                                setVideoMode(lesson.video_source_type === 'upload' ? 'upload' : 'link');
                                                setIsLessonModalOpen(true);
                                              }}
                                              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md"
                                              title="Edit Lesson & Materials"
                                            >
                                              <Edit className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                              type="button"
                                              id={`btn-delete-lesson-${lesson.id}`}
                                              onClick={() => promptDeleteLesson(lesson.id, lesson.title)}
                                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                              title="Delete Lesson"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500">No course selected.</p>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: COURSE MODAL */}
      {/* ============================================================ */}
      {isCourseModalOpen && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingCourse.id ? 'Edit Course Details' : 'Create New Course / Batch'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={editingCourse.title || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  placeholder="e.g. JEE Advanced 2026 Masterclass"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Code *</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.code || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value })}
                    placeholder="e.g. JEE-2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Class</label>
                  <input
                    type="text"
                    value={editingCourse.target_class || ''}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, target_class: e.target.value })
                    }
                    placeholder="e.g. Grade 12 & Droppers"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lead Instructor Name</label>
                <input
                  type="text"
                  value={editingCourse.instructor_name || ''}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, instructor_name: e.target.value })
                  }
                  placeholder="e.g. ChemPoint Faculty"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={editingCourse.thumbnail_url || ''}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, thumbnail_url: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Description</label>
                <textarea
                  rows={2}
                  value={editingCourse.description || ''}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, description: e.target.value })
                  }
                  placeholder="Brief summary of syllabus and targets..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="course-published-check"
                  checked={editingCourse.is_published !== false}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, is_published: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="course-published-check" className="font-semibold text-slate-700">
                  Publish course to enrolled students
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: SUBJECT MODAL */}
      {/* ============================================================ */}
      {isSubjectModalOpen && editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingSubject.id ? 'Edit Subject' : 'Add Subject'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Title *</label>
                <input
                  type="text"
                  required
                  value={editingSubject.title || ''}
                  onChange={(e) => setEditingSubject({ ...editingSubject, title: e.target.value })}
                  placeholder="e.g. Physics: Mechanics & Electrodynamics"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={editingSubject.code || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value })}
                    placeholder="e.g. PHY-ADV"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingSubject.color || '#2563eb'}
                      onChange={(e) => setEditingSubject({ ...editingSubject, color: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="font-mono text-xs">{editingSubject.color || '#2563eb'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: CHAPTER MODAL */}
      {/* ============================================================ */}
      {isChapterModalOpen && editingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingChapter.id ? 'Edit Chapter' : 'Add Chapter'}
              </h3>
              <button
                type="button"
                onClick={() => setIsChapterModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chapter Title *</label>
                <input
                  type="text"
                  required
                  value={editingChapter.title || ''}
                  onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                  placeholder="e.g. Chapter 01: Rotational Dynamics"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chapter Number</label>
                  <input
                    type="number"
                    min="1"
                    value={editingChapter.chapter_number || 1}
                    onChange={(e) =>
                      setEditingChapter({ ...editingChapter, chapter_number: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingChapter.estimated_hours || 2}
                    onChange={(e) =>
                      setEditingChapter({ ...editingChapter, estimated_hours: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Syllabus</label>
                <textarea
                  rows={2}
                  value={editingChapter.description || ''}
                  onChange={(e) =>
                    setEditingChapter({ ...editingChapter, description: e.target.value })
                  }
                  placeholder="Key concepts covered..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChapterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Save Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: LESSON MODAL (Video, PDF Notes, Publish) */}
      {/* ============================================================ */}
      {isLessonModalOpen && editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingLesson.id ? 'Edit Lesson & Materials' : 'Add New Video & PDF Lesson'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Configure lecture stream link, study notes, and publication status
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLessonModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lesson Title *</label>
                <input
                  type="text"
                  required
                  value={editingLesson.title || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  placeholder="e.g. Lesson 1.1: Torque Vector & Moment of Inertia Derivations"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingLesson.duration_minutes || 30}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, duration_minutes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lesson Order</label>
                  <input
                    type="number"
                    min="1"
                    value={editingLesson.lesson_order || 1}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, lesson_order: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Video Configuration (Dual Mode: Direct File Upload vs Online Link) */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <PlayCircle className="w-4 h-4 text-blue-600" />
                    <span>Lecture Video Stream</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      id="btn-video-mode-link"
                      onClick={() => setVideoMode('link')}
                      className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        videoMode === 'link'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Link className="w-3 h-3" />
                      <span>Video Link</span>
                    </button>
                    <button
                      type="button"
                      id="btn-video-mode-upload"
                      onClick={() => setVideoMode('upload')}
                      className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        videoMode === 'upload'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Video</span>
                    </button>
                  </div>
                </div>

                {videoMode === 'link' ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Video Stream URL (YouTube, Vimeo, or MP4 URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={editingLesson.video_url || ''}
                        onChange={(e) =>
                          setEditingLesson({
                            ...editingLesson,
                            video_url: e.target.value,
                            video_source_type: 'youtube',
                          })
                        }
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      {editingLesson.video_url && (
                        <button
                          type="button"
                          id="btn-remove-video-link"
                          onClick={handleRemoveVideo}
                          className="px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 font-semibold hover:bg-red-100 flex items-center gap-1 transition-colors shrink-0"
                          title="Remove video stream"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Upload Classroom Video File (.mp4, .webm, .mkv)
                    </label>
                    <div className="border-2 border-dashed border-blue-200 rounded-xl p-3.5 bg-white text-center hover:bg-blue-50/40 transition-colors">
                      {editingLesson.video_file_name || (editingLesson.video_source_type === 'upload' && editingLesson.video_url) ? (
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2.5 text-left">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                              <PlayCircle className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 line-clamp-1">
                                {editingLesson.video_file_name || 'Uploaded_Lecture_Video.mp4'}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {editingLesson.video_file_size || 'Attached Video File'} • Ready for stream
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            id="btn-remove-video-file"
                            onClick={handleRemoveVideo}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 font-semibold hover:bg-red-100 flex items-center gap-1 transition-colors"
                            title="Remove uploaded video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Video</span>
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-7 h-7 text-blue-500 mx-auto mb-1.5" />
                          <p className="font-semibold text-slate-700">Choose a video file to attach</p>
                          <p className="text-[10px] text-slate-500 mb-2">Supports MP4, WebM, MKV for local lesson testing</p>
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Browse Video Files</span>
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/mkv,video/quicktime"
                              onChange={handleVideoFileSelect}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80 text-amber-800">
                      <strong>Architecture Note for 1,000+ Students:</strong> To ensure high performance and zero buffering, long classroom lectures should be streamed via CDN/embed URLs (YouTube Unlisted, Vimeo OTT, or Cloudflare Stream) under the <em>Video Link</em> tab rather than stored in the application container.
                    </p>
                  </div>
                )}
              </div>

              {/* Study Materials & Notes Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Study Materials & Handouts (PDF, DOC, PPT, Images)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    {editingLesson.study_materials?.length || 0} attached
                  </span>
                </div>

                {/* Attached materials list with working Remove buttons */}
                {editingLesson.study_materials && editingLesson.study_materials.length > 0 ? (
                  <div className="space-y-2">
                    {editingLesson.study_materials.map((mat, index) => {
                      const ext = (mat.file_type || mat.file_name?.split('.').pop() || 'pdf').toLowerCase();
                      const isPdf = ext.includes('pdf');
                      const isDoc = ext.includes('doc');
                      const isPpt = ext.includes('ppt');
                      const isImg = ext.includes('png') || ext.includes('jpg') || ext.includes('jpeg');
                      
                      const badgeColor = isPdf
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : isDoc
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : isPpt
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : isImg
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-indigo-100 text-indigo-700 border-indigo-200';

                      return (
                        <div
                          key={mat.id || index}
                          className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border shrink-0 ${badgeColor}`}
                            >
                              {ext}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">
                                {mat.title || mat.file_name}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {mat.file_name} {mat.file_size ? `• ${mat.file_size}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {mat.url && (
                              <a
                                href={mat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                              >
                                View
                              </a>
                            )}
                            <button
                              type="button"
                              id={`btn-remove-material-${index}`}
                              onClick={() => handleRemoveMaterial(index, mat.id)}
                              className="px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-[11px] flex items-center gap-1 transition-colors border border-red-100"
                              title="Remove study material"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-[11px]">
                    No study materials attached yet. Upload lecture notes, DPP sheets, or slides below.
                  </div>
                )}

                {/* Material Mode Selector: Upload File vs External Link */}
                <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Attach Study Material</span>
                    </span>

                    <div className="inline-flex bg-slate-100 p-0.5 rounded-lg text-[11px]">
                      <button
                        type="button"
                        onClick={() => setMaterialMode('upload')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                          materialMode === 'upload'
                            ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Upload PDF/Doc File
                      </button>
                      <button
                        type="button"
                        onClick={() => setMaterialMode('link')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                          materialMode === 'link'
                            ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        External Link (URL)
                      </button>
                    </div>
                  </div>

                  {materialMode === 'upload' ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newMaterial.title}
                          onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                          placeholder="Document Title (e.g. Chapter 01 Handwritten Notes)"
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white text-xs"
                        />

                        <div className="flex items-center gap-2">
                          <label className="flex-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 rounded-lg text-xs font-semibold cursor-pointer border border-indigo-200 transition-colors flex items-center justify-center gap-1.5 truncate">
                            <Upload className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {selectedMaterialFile ? selectedMaterialFile.name : 'Choose File from Device...'}
                            </span>
                            <input
                              type="file"
                              accept=".pdf,.docx,.doc,.pptx,.ppt,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={handleMaterialFileSelect}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                        <span>Max direct cloud upload: <strong className="text-slate-700 font-semibold">50 MB</strong> (PDF, Word, PPT, Scans)</span>
                        {selectedMaterialFile && (
                          <span className="text-indigo-600 font-medium truncate max-w-[200px]">
                            {(selectedMaterialFile.size / (1024 * 1024)).toFixed(1)} MB / 50 MB
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/80 flex items-center justify-between">
                        <span>Need to attach a massive file (50 MB+)?</span>
                        <button
                          type="button"
                          onClick={() => setMaterialMode('link')}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2 ml-2"
                        >
                          Use External Cloud Link (Google Drive / OneDrive)
                        </button>
                      </div>

                      {/* Selected File Card & Actions */}
                      {selectedMaterialFile && (
                        <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 rounded-lg px-3 py-2 text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">{selectedMaterialFile.name}</span>
                            <span className="text-slate-500 text-[11px] shrink-0">
                              ({(selectedMaterialFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          </div>
                          {!isUploadingMaterial && (
                            <button
                              type="button"
                              onClick={handleResetMaterialUpload}
                              className="text-slate-400 hover:text-red-500 ml-2 p-1 rounded-sm text-xs flex items-center gap-1 transition-colors"
                              title="Remove selected file"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Reset</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Upload Status / Progress */}
                      {materialUploadStatus && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                          <span className="font-medium text-slate-700">{materialUploadStatus}</span>
                          {isUploadingMaterial ? (
                            <span className="text-indigo-600 font-bold">{materialUploadProgress}%</span>
                          ) : selectedMaterialFile && !materialUploadError ? (
                            <span className="text-emerald-600 font-bold">Ready</span>
                          ) : null}
                        </div>
                      )}

                      {/* Real Progress Bar */}
                      {isUploadingMaterial && (
                        <div className="space-y-1">
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-2.5 transition-all duration-200 rounded-full"
                              style={{ width: `${materialUploadProgress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 px-0.5">
                            <span>Resumable Cloud Upload</span>
                            <span>{materialUploadProgress}%</span>
                          </div>
                        </div>
                      )}

                      {/* Error Alert with Retry */}
                      {materialUploadError && !isUploadingMaterial && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold">Upload Incomplete</p>
                              <p className="text-[11px] text-red-600 mt-0.5">{materialUploadError}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleUploadAndAttachMaterial}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          {isUploadingMaterial && (
                            <button
                              type="button"
                              onClick={handleCancelMaterialUpload}
                              className="px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-semibold text-xs flex items-center gap-1 transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Cancel Upload</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {selectedMaterialFile && !isUploadingMaterial && (
                            <button
                              type="button"
                              onClick={handleResetMaterialUpload}
                              className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-xs transition-colors"
                            >
                              Clear
                            </button>
                          )}
                          <button
                            type="button"
                            id="btn-upload-attach-material"
                            disabled={isUploadingMaterial || !selectedMaterialFile}
                            onClick={handleUploadAndAttachMaterial}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            {isUploadingMaterial ? (
                              <>
                                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Uploading ({materialUploadProgress}%)...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload & Attach to Lesson</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newMaterial.title}
                          onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                          placeholder="Document Title (e.g. Formula Reference Sheet)"
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white text-xs"
                        />

                        <input
                          type="url"
                          value={newMaterial.url}
                          onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                          placeholder="Public Document URL (https://...)"
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white text-xs"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          id="btn-add-material"
                          disabled={!newMaterial.title.trim()}
                          onClick={handleAddMaterial}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Attach Link</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Formulas / Markdown summary */}
                <div className="pt-2 border-t border-slate-200/80">
                  <label className="block font-semibold text-slate-700 mb-1 text-xs">
                    Lecture Summary & Key Concepts (Optional Text Reference)
                  </label>
                  <textarea
                    rows={3}
                    value={editingLesson.pdf_notes_content || ''}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, pdf_notes_content: e.target.value })
                    }
                    placeholder="# Quick Formulas & Concepts&#10;1. Concept 1&#10;2. Key Derivation"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-[11px] bg-white"
                  ></textarea>
                </div>
              </div>

              {/* Publication Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lesson-published-check"
                  checked={editingLesson.is_published !== false}
                  onChange={(e) =>
                    setEditingLesson({ ...editingLesson, is_published: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="lesson-published-check" className="font-semibold text-slate-700">
                  Publish this lesson immediately to enrolled students
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* In-App Confirmation Modal (Bypasses sandboxed iframe restrictions) */}
      {confirmDialog && (
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText || 'Delete'}
          isLoading={isDeleting}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => {
            if (!isDeleting) setConfirmDialog(null);
          }}
        />
      )}
    </div>
  );
};
