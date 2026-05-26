import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetail, createLesson, updateLesson, deleteLesson, togglePublishCourse, updateCourse } from '../../api/courses.api';
import { updateBatchPrice } from '../../api/batches.api';
import FileUploader from '../../components/FileUploader';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';

const CourseBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [courseIsFree, setCourseIsFree] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('video');
  const [contentUrl, setContentUrl] = useState('');
  const [contentText, setContentText] = useState('');
  const [durationMins, setDurationMins] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [position, setPosition] = useState(1);
  const [quizOptions, setQuizOptions] = useState({ A: '', B: '', C: '', D: '' });
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState('A');
  const [liveStartTime, setLiveStartTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCourse = async () => {
    try {
      const res = await getCourseDetail(courseId);
      if (res.success) {
        setCourse(res.data);
      } else {
        addToast("Course not found", "error");
        navigate('/faculty/courses');
      }
    } catch (err) {
      console.error(err);
      navigate('/faculty/courses');
    } finally {
      setLoading(false);
    }
  };

  const openEditCourseModal = () => {
    if (course) {
      setCourseTitle(course.title || '');
      setCourseDescription(course.description || '');
      setCourseCategory(course.category || '');
      
      if (course.batches && course.batches.length > 0) {
        const batch = course.batches[0];
        setCoursePrice(batch.price || '');
        setCourseIsFree(batch.is_free || false);
      }
      setIsEditCourseModalOpen(true);
    }
  };

  const handleSaveCourseSettings = async (e) => {
    e.preventDefault();
    setSavingCourse(true);
    try {
      await updateCourse(courseId, {
        title: courseTitle,
        description: courseDescription,
        category: courseCategory
      });

      if (course.batches && course.batches.length > 0) {
        await updateBatchPrice(course.batches[0].id, {
          price: courseIsFree ? 0 : parseFloat(coursePrice || 0),
          is_free: courseIsFree
        });
      }

      await fetchCourse();
      setIsEditCourseModalOpen(false);
      addToast("Course settings updated successfully!", "success");
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to update course settings", "error");
    } finally {
      setSavingCourse(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const openModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setTitle(lesson.title);
      setType(lesson.type);
      setContentUrl(lesson.content_url || '');
      setContentText(lesson.content_text || '');
      setDurationMins(lesson.duration_mins || '');
      setIsPreview(lesson.is_preview);
      setPosition(lesson.position);
      setQuizOptions(lesson.quiz_options || { A: '', B: '', C: '', D: '' });
      setQuizCorrectAnswer(lesson.quiz_correct_answer || 'A');
      setLiveStartTime(lesson.live_start_time ? (() => {
        const d = new Date(lesson.live_start_time.endsWith('Z') ? lesson.live_start_time : lesson.live_start_time + 'Z');
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
      })() : '');
    } else {
      setEditingLesson(null);
      setTitle('');
      setType('video');
      setContentUrl('');
      setContentText('');
      setDurationMins('');
      setIsPreview(false);
      setPosition((course?.lessons?.length || 0) + 1);
      setQuizOptions({ A: '', B: '', C: '', D: '' });
      setQuizCorrectAnswer('A');
      setLiveStartTime('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLesson(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      title,
      type,
      content_url: (type === 'video' || type === 'document' || type === 'live_class') ? contentUrl : null,
      content_text: (type === 'text' || type === 'assignment') ? contentText : null,
      duration_mins: durationMins ? parseInt(durationMins) : null,
      is_preview: isPreview,
      position: parseInt(position),
      quiz_options: type === 'assignment' ? quizOptions : null,
      quiz_correct_answer: type === 'assignment' ? quizCorrectAnswer : null,
      live_start_time: (type === 'live_class' && liveStartTime) ? new Date(liveStartTime).toISOString() : null
    };

    try {
      if (editingLesson) {
        await updateLesson(courseId, editingLesson.id, payload);
      } else {
        await createLesson(courseId, payload);
      }
      await fetchCourse();
      closeModal();
      addToast("Lesson saved successfully!", "success");
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to save lesson", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (lessonId) => {
    const isConfirmed = await confirm("Are you sure you want to delete this lesson?");
    if (!isConfirmed) return;
    try {
      await deleteLesson(courseId, lessonId);
      await fetchCourse();
      addToast("Lesson deleted", "success");
    } catch (err) {
      addToast("Failed to delete lesson", "error");
    }
  };

  const handleTogglePublish = async () => {
    try {
      await togglePublishCourse(courseId);
      await fetchCourse();
      addToast("Publish status toggled", "success");
    } catch (err) {
      addToast("Failed to toggle publish status", "error");
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
        <div className="h-64 bg-slate-100 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto relative">
      <button 
        onClick={() => navigate('/faculty/courses')}
        className="text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors flex items-center gap-2 mb-6"
      >
        <span>&larr;</span> Back to My Courses
      </button>

      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-800">Course Builder</h1>
            <button 
              onClick={openEditCourseModal}
              className="p-2 text-slate-400 hover:text-violet-600 bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-200 rounded-lg transition-colors"
              title="Edit Course Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
          </div>
          <p className="text-slate-500 mt-2 font-medium">Manage syllabus for: <span className="text-slate-800">{course?.title}</span></p>
        </div>
        <div className="flex items-center gap-3">
          {course && (
            <button
              onClick={handleTogglePublish}
              className={`px-4 py-3 font-bold rounded-xl transition-all shadow-md flex items-center gap-2 ${
                course.is_published 
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${course.is_published ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
              {course.is_published ? 'Published' : 'Draft'}
            </button>
          )}
          <button
            onClick={() => openModal()}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-md shadow-violet-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Add Lesson
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {course?.lessons?.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No lessons created yet. Click "Add Lesson" to start building your course.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {course?.lessons?.sort((a,b) => a.position - b.position).map(lesson => (
              <div key={lesson.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                    {lesson.position}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">{lesson.type}</span>
                      {lesson.is_preview && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">Free Preview</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{lesson.title}</h3>
                    <p className="text-sm text-slate-500">
                      {lesson.type === 'live_class' && lesson.live_start_time 
                        ? `Scheduled: ${new Date(lesson.live_start_time.endsWith('Z') ? lesson.live_start_time : lesson.live_start_time + 'Z').toLocaleString()}` 
                        : lesson.duration_mins ? `${lesson.duration_mins} mins` : 'Self-paced'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(lesson)} className="p-2 text-slate-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button onClick={() => handleDelete(lesson.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Lesson Title</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors" placeholder="e.g. Introduction to React" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Lesson Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors">
                    <option value="video">Video</option>
                    <option value="document">Document (PDF/PPT)</option>
                    <option value="text">Text / Article</option>
                    <option value="assignment">Assignment</option>
                    <option value="live_class">Live Class (Zoom/Meet)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Duration (mins)</label>
                  <input type="number" value={durationMins} onChange={e => setDurationMins(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors" placeholder="Optional" />
                </div>

                <div className="col-span-2 flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="isPreview" checked={isPreview} onChange={e => setIsPreview(e.target.checked)} className="w-5 h-5 text-violet-600 rounded border-slate-300 focus:ring-violet-500" />
                    <label htmlFor="isPreview" className="text-sm font-bold text-slate-700 cursor-pointer">Free Preview</label>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-3 justify-end">
                    <label className="text-sm font-bold text-slate-700">Position</label>
                    <input type="number" min="1" value={position} onChange={e => setPosition(e.target.value)} className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500" />
                  </div>
                </div>
              </div>

              {(type === 'video' || type === 'document') ? (
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Content Media</label>
                  <FileUploader 
                    label={`Upload ${type === 'video' ? 'Video (MP4)' : 'Document (PDF/PPT)'}`}
                    allowedTypes={type === 'video' ? ['video/mp4', 'video/webm'] : ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']}
                    onUploadSuccess={(url) => setContentUrl(url)}
                  />
                  
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <span className="w-full border-t border-slate-200"></span>
                    <span className="px-4">OR USE EXTERNAL URL</span>
                    <span className="w-full border-t border-slate-200"></span>
                  </div>
                  
                  <input type="url" value={contentUrl} onChange={e => setContentUrl(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors" placeholder="e.g. https://youtube.com/watch?v=..." />
                  
                  {contentUrl && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm break-all font-medium">
                      Current URL: {contentUrl}
                    </div>
                  )}
                </div>
              ) : type === 'live_class' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Meeting Link (Zoom, Google Meet, etc.)</label>
                    <input type="url" required value={contentUrl} onChange={e => setContentUrl(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors" placeholder="https://zoom.us/j/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Scheduled Date & Time</label>
                    <input type="datetime-local" required value={liveStartTime} onChange={e => setLiveStartTime(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {type === 'assignment' ? 'Assignment Question' : 'Text Content'}
                  </label>
                  <textarea rows="4" value={contentText} onChange={e => setContentText(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors resize-none" placeholder={type === 'assignment' ? "Write question here..." : "Write lesson content here..."}></textarea>
                </div>
              )}

              {type === 'assignment' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="text-sm font-bold text-slate-800">Multiple Choice Options</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <div key={opt} className="flex items-center gap-2">
                        <span className="font-bold text-slate-500 w-4">{opt}</span>
                        <input 
                          type="text" 
                          value={quizOptions[opt] || ''} 
                          onChange={e => setQuizOptions({...quizOptions, [opt]: e.target.value})} 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500" 
                          placeholder={`Option ${opt}`} 
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 mt-4">Correct Answer</label>
                    <select value={quizCorrectAnswer} onChange={e => setQuizCorrectAnswer(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500">
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || (!contentUrl && !contentText)} className="px-6 py-2.5 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 transition-all disabled:opacity-50 flex items-center gap-2">
                  {submitting ? 'Saving...' : 'Save Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Course Modal */}
      {isEditCourseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">Edit Course Settings</h2>
              <button onClick={() => setIsEditCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveCourseSettings} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                <input type="text" required value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <input type="text" value={courseCategory} onChange={e => setCourseCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea rows="4" value={courseDescription} onChange={e => setCourseDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors resize-none"></textarea>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="courseIsFree" className="text-sm font-bold text-slate-700 cursor-pointer">Offer for Free</label>
                  <input type="checkbox" id="courseIsFree" checked={courseIsFree} onChange={e => setCourseIsFree(e.target.checked)} className="w-5 h-5 text-violet-600 rounded border-slate-300 focus:ring-violet-500 cursor-pointer" />
                </div>
                {!courseIsFree && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Price (₹)</label>
                    <input type="number" min="0" step="0.01" value={coursePrice} onChange={e => setCoursePrice(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 transition-colors" placeholder="e.g. 999.00" />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditCourseModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={savingCourse} className="px-6 py-2.5 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 transition-all disabled:opacity-50 flex items-center gap-2">
                  {savingCourse ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBuilder;
