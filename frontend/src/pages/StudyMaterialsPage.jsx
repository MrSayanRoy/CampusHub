import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  FileText,
  UploadCloud,
  Download,
  Search,
  Filter,
  Sparkles,
  BookOpen,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { STUDY_MATERIALS_REPO, FACULTY_COURSES } from '../data/facultyData.js';

export default function StudyMaterialsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [materials, setMaterials] = useState(STUDY_MATERIALS_REPO);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New Material Form
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    courseCode: 'CS401',
    topic: '',
    fileType: 'PDF',
    fileName: '',
    fileSize: '3.4 MB',
  });

  const filteredMaterials = materials.filter((m) => {
    const matchesCourse = selectedCourse === 'all' || m.courseCode === selectedCourse;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const handleDownload = (material) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === material.id ? { ...m, downloadsCount: m.downloadsCount + 1 } : m))
    );
    addToast({
      title: 'Download Initialized',
      description: `Downloading "${material.fileName}" (${material.fileSize}).`,
      variant: 'success',
    });
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!newMaterial.title.trim() || !newMaterial.topic.trim()) {
      addToast({
        title: 'Validation Error',
        description: 'Please provide both title and module/topic.',
        variant: 'destructive',
      });
      return;
    }

    const created = {
      id: `mat-${Date.now()}`,
      courseCode: newMaterial.courseCode,
      courseTitle:
        newMaterial.courseCode === 'CS401'
          ? 'Distributed Systems & Cloud Computing'
          : 'Compiler Design & Program Analysis',
      topic: newMaterial.topic,
      title: newMaterial.title,
      fileType: newMaterial.fileType,
      fileName: newMaterial.fileName || `${newMaterial.courseCode}_Lecture_Notes_${Date.now().toString().slice(-4)}.${newMaterial.fileType.toLowerCase()}`,
      fileSize: newMaterial.fileSize,
      uploadedOn: 'Today, Oct 27, 2026',
      downloadsCount: 0,
    };

    setMaterials([created, ...materials]);
    setIsUploadModalOpen(false);
    setNewMaterial({
      title: '',
      courseCode: 'CS401',
      topic: '',
      fileType: 'PDF',
      fileName: '',
      fileSize: '3.4 MB',
    });

    addToast({
      title: 'Study Material Published',
      description: `Material successfully made accessible to enrolled students in ${newMaterial.courseCode}.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
              Academic Repository
            </span>
            <span className="text-xs text-[#737373]">Course Content Distribution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight mt-1">
            Study Materials & Resources
          </h1>
          <p className="mt-1 text-sm text-[#737373]">
            Publish lecture slides, reference guides, laboratory manuals, and code starter kits for your classes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/courses')}
            leftIcon={BookOpen}
          >
            My Courses
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={UploadCloud}
          >
            Upload Material
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
          <input
            type="text"
            placeholder="Search by topic, document title, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#737373]">Filter Course:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
          >
            <option value="all">All Courses</option>
            {FACULTY_COURSES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.title.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-3">
        {filteredMaterials.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-[#E5E5E5] text-center text-[#737373] text-xs">
            No study materials found for this selection.
          </div>
        ) : (
          filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white p-4 sm:p-5 rounded-xl border border-[#E5E5E5] hover:border-neutral-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                      {mat.courseCode}
                    </span>
                    <span className="text-xs font-bold text-[#171717]">{mat.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-[#737373]">
                      {mat.fileType}
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] font-medium">{mat.topic}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[#737373]">
                    <span>File: {mat.fileName}</span>
                    <span>•</span>
                    <span>Size: {mat.fileSize}</span>
                    <span>•</span>
                    <span>Uploaded: {mat.uploadedOn}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">
                      {mat.downloadsCount} student downloads
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleDownload(mat)}
                  leftIcon={Download}
                >
                  Download
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload Study Material to Course Portal"
          size="md"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Target Course
              </label>
              <select
                value={newMaterial.courseCode}
                onChange={(e) => setNewMaterial({ ...newMaterial, courseCode: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
              >
                {FACULTY_COURSES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}: {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Topic or Curriculum Module
              </label>
              <Input
                placeholder="e.g., Module 4: Raft Consensus Algorithm & Heartbeat Quorums"
                value={newMaterial.topic}
                onChange={(e) => setNewMaterial({ ...newMaterial, topic: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Resource Document Title
              </label>
              <Input
                placeholder="e.g., Lecture 12-14: Raft Consensus Protocol Slides & Notes"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  File Format
                </label>
                <select
                  value={newMaterial.fileType}
                  onChange={(e) => setNewMaterial({ ...newMaterial, fileType: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="PPTX">PowerPoint Presentation</option>
                  <option value="ZIP">ZIP Starter Archive</option>
                  <option value="DOCX">Word Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Upload Attachment
                </label>
                <div className="border border-dashed border-[#E5E5E5] rounded-lg p-2.5 text-center bg-[#FAFAFA] hover:bg-neutral-50 cursor-pointer">
                  <p className="text-[11px] text-[#DC2626] font-semibold">Click or drag file here</p>
                  <p className="text-[10px] text-[#737373]">PDF, PPTX, ZIP up to 50MB</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" leftIcon={UploadCloud}>
                Publish to Students
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
