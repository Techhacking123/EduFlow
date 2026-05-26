import React, { useState, useEffect } from 'react';
import { getCourses, createCourse, updateCourse, togglePublishCourse } from '../../api/courses.api';
import FileUploader from '../../components/FileUploader';
import { useToast } from '../../contexts/ToastContext';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      if (res.success) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setTitle(course.title);
      setDescription(course.description || '');
      setCategory(course.category || '');
      setThumbnailUrl(course.thumbnail_url || '');
    } else {
      setEditingCourse(null);
      setTitle('');
      setDescription('');
      setCategory('');
      setThumbnailUrl('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = { title, description, category, thumbnail_url: thumbnailUrl };

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, payload);
      } else {
        await createCourse(payload);
      }
      await fetchCourses();
      closeModal();
      addToast(editingCourse ? "Course updated!" : "Course created!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save course", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (courseId) => {
    try {
      await togglePublishCourse(courseId);
      await fetchCourses();
      addToast("Publish status toggled", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to toggle publish status", "error");
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto animate-pulse space-y-6">
        <div className="h-10 w-64 bg-slate-200 rounded"></div>
        <div className="h-96 bg-white border border-slate-100 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Course Management</h1>
          <p className="text-slate-500 mt-2">Create and manage course catalogues.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-md shadow-violet-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          New Course
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <th className="p-4 pl-6 border-b border-slate-100">Course</th>
              <th className="p-4 border-b border-slate-100 hidden md:table-cell">Category</th>
              <th className="p-4 border-b border-slate-100">Status</th>
              <th className="p-4 pr-6 border-b border-slate-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {courses.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500">
                  No courses found. Create one to get started.
                </td>
              </tr>
            ) : (
              courses.map(course => (
                <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{course.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{course.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {course.category ? (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {course.category}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      course.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleTogglePublish(course.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          course.is_published 
                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {course.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button 
                        onClick={() => openModal(course)}
                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-slate-800">{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Course Title <span className="text-rose-500">*</span></label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 transition-colors" placeholder="e.g. Masterclass in React" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 transition-colors" placeholder="e.g. Programming" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 transition-colors resize-none" placeholder="Brief summary of what this course covers..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Course Thumbnail</label>
                <FileUploader 
                  label="Upload Thumbnail Image"
                  allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
                  onUploadSuccess={(url) => setThumbnailUrl(url)}
                />
                
                {thumbnailUrl && (
                  <div className="mt-4 flex gap-4 items-center">
                    <img src={thumbnailUrl} alt="Thumbnail preview" className="w-24 h-16 object-cover rounded-lg border border-slate-200 shadow-sm" />
                    <button type="button" onClick={() => setThumbnailUrl('')} className="text-sm font-bold text-rose-500 hover:text-rose-600">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !title} className="px-6 py-2.5 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 transition-all disabled:opacity-50">
                  {submitting ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
