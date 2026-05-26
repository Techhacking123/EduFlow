import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyProgress, markLessonComplete } from '../../api/courses.api';
import VideoEmbed from '../../components/VideoEmbed';
import LessonList from '../../components/LessonList';
import { useToast } from '../../contexts/ToastContext';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  
  const [selectedOption, setSelectedOption] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const fetchProgress = async () => {
    try {
      const res = await getMyProgress(courseId);
      if (res.success) {
        setCourseData(res.data);
        if (res.data.lessons?.length > 0) {
          const firstUncompleted = res.data.lessons.find(l => !l.is_completed);
          setActiveLesson(firstUncompleted || res.data.lessons[0]);
        }
      } else {
        addToast("Could not load course progress.", "error");
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error(err);
      addToast("Error loading course.", "error");
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [courseId]);

  const handleLessonSelect = (lesson) => {
    setActiveLesson(lesson);
  };

  useEffect(() => {
    let timer;
    if (activeLesson?.type === 'live_class') {
      setCurrentTime(new Date());
      timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeLesson]);

  useEffect(() => {
    if (activeLesson) {
      setSelectedOption(activeLesson.quiz_selected_option || '');
      if (activeLesson.quiz_selected_option && activeLesson.quiz_correct_answer) {
        setCheckResult(activeLesson.quiz_selected_option === activeLesson.quiz_correct_answer ? 'correct' : 'incorrect');
      } else {
        setCheckResult(null);
      }
    }
  }, [activeLesson]);

  const handleCheckAnswer = async () => {
    if (!selectedOption) {
      addToast("Please select an option first", "warning");
      return;
    }
    const isCorrect = selectedOption === activeLesson.quiz_correct_answer;
    setCheckResult(isCorrect ? 'correct' : 'incorrect');
    
    try {
      const res = await markLessonComplete(courseId, activeLesson.id, { quiz_selected_option: selectedOption });
      if (res.success) {
        await fetchProgress();
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to save answer.", "error");
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    if (activeLesson.type === 'assignment' && !selectedOption && activeLesson.quiz_options) {
      addToast("Please select an option first", "warning");
      return;
    }
    try {
      const data = activeLesson.type === 'assignment' ? { quiz_selected_option: selectedOption } : {};
      const res = await markLessonComplete(courseId, activeLesson.id, data);
      if (res.success) {
        await fetchProgress();
        addToast("Lesson marked as complete!", "success");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to mark lesson complete.", "error");
    }
  };

  // ---------- Certificate Generation ----------
  const generateCertificate = async () => {
    setGeneratingCert(true);
    try {
      const { generateCertificateImage } = await import('../../utils/certificate');
      const dataUrl = await generateCertificateImage(courseData, user, courseId);
      
      const link = document.createElement('a');
      link.download = `EduFlow_Certificate_${(courseData?.course_title || 'Course').replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();

      addToast('Certificate downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to generate certificate.', 'error');
    } finally {
      setGeneratingCert(false);
    }
  };

  const isCourseCompleted = courseData && courseData.completion_percentage >= 100;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-violet-600 mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-500 font-medium">Loading player...</p>
        </div>
      </div>
    );
  }

  if (!courseData) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] bg-slate-50 md:overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:h-full md:overflow-y-auto bg-white md:border-r border-slate-200 min-h-[500px]">
        <div className="p-4 md:p-8 flex-1 max-w-5xl mx-auto w-full flex flex-col">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="text-xs font-bold text-slate-400 hover:text-violet-600 mb-6 flex items-center gap-1 w-max transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back to Dashboard
          </button>

          {activeLesson ? (
            <div className="flex-1 flex flex-col">
              <div className="mb-6">
                <span className="text-xs font-bold text-violet-600 tracking-wider uppercase mb-2 block">
                  Lesson {activeLesson.position}
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                  {activeLesson.title}
                </h1>
              </div>

              {/* Lesson Content Render */}
              <div className="flex-1 bg-slate-100 rounded-3xl overflow-hidden mb-8 border border-slate-200 flex flex-col">
                {activeLesson.type === 'video' && activeLesson.content_url && (
                  <div className="aspect-video w-full">
                    <VideoEmbed url={activeLesson.content_url} />
                  </div>
                )}
                
                {activeLesson.type === 'document' && activeLesson.content_url && (
                  <div className="flex-1 p-8 flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
                    <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <p className="mb-4">This lesson contains a document resource.</p>
                    <a href={activeLesson.content_url} target="_blank" rel="noreferrer" className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-md">
                      Open Document
                    </a>
                  </div>
                )}

                {activeLesson.type === 'text' && (
                  <div className="p-8 prose max-w-none text-slate-700">
                    {activeLesson.content_text || "No text content provided."}
                  </div>
                )}

                {activeLesson.type === 'live_class' && (
                  <div className="p-8 flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
                    <svg className="w-16 h-16 mb-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Live Class</h3>
                    {activeLesson.live_start_time ? (() => {
                      const startTime = new Date(activeLesson.live_start_time.endsWith('Z') ? activeLesson.live_start_time : activeLesson.live_start_time + 'Z');
                      const isTimeMet = currentTime >= startTime;
                      
                      return (
                        <div className="flex flex-col items-center">
                          <p className="mb-6 text-center">
                            Scheduled for: <span className="font-bold text-slate-700">{startTime.toLocaleString()}</span>
                          </p>
                          <button 
                            disabled={!isTimeMet}
                            onClick={() => window.open(activeLesson.content_url, '_blank')}
                            className={`px-8 py-3 font-bold rounded-xl shadow-md transition-all ${
                              isTimeMet 
                                ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                          >
                            {isTimeMet ? 'Join Live Class' : 'Live Class Starts At Scheduled Time'}
                          </button>
                        </div>
                      );
                    })() : (
                      <p>Time not scheduled for this live class.</p>
                    )}
                  </div>
                )}

                {activeLesson.type === 'assignment' && (
                  <div className="p-8 flex flex-col h-full">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">
                        Assignment / Test Details
                      </h3>
                      <div className="prose max-w-none text-slate-700">
                        {activeLesson.content_text ? (
                          <div dangerouslySetInnerHTML={{ __html: activeLesson.content_text }} />
                        ) : (
                          <p>No questions or details provided for this assignment.</p>
                        )}
                      </div>
                      
                      {activeLesson.quiz_options && Object.keys(activeLesson.quiz_options).length > 0 && (
                        <div className="mt-8">
                          <h4 className="font-bold text-slate-800 mb-4">Select the correct option:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['A', 'B', 'C', 'D'].map(opt => {
                              const optValue = activeLesson.quiz_options[opt];
                              if (!optValue) return null;
                              
                              let optionClass = "border-slate-200 hover:border-violet-300 hover:bg-violet-50";
                              if (selectedOption === opt) {
                                optionClass = "border-violet-500 bg-violet-50 ring-2 ring-violet-200";
                                if (checkResult === 'correct') {
                                  optionClass = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200";
                                } else if (checkResult === 'incorrect') {
                                  optionClass = "border-rose-500 bg-rose-50 ring-2 ring-rose-200";
                                }
                              } else if (checkResult === 'incorrect' && opt === activeLesson.quiz_correct_answer) {
                                optionClass = "border-emerald-500 bg-emerald-50";
                              }

                              return (
                                <button
                                  key={opt}
                                  disabled={!!activeLesson.quiz_selected_option}
                                  onClick={() => setSelectedOption(opt)}
                                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${optionClass} ${!!activeLesson.quiz_selected_option ? 'cursor-default opacity-80' : ''}`}
                                >
                                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${selectedOption === opt ? (checkResult === 'correct' ? 'bg-emerald-500 text-white' : checkResult === 'incorrect' ? 'bg-rose-500 text-white' : 'bg-violet-500 text-white') : (checkResult === 'incorrect' && opt === activeLesson.quiz_correct_answer ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500')}`}>
                                    {opt}
                                  </div>
                                  <span className="font-medium text-slate-700">{optValue}</span>
                                </button>
                              );
                            })}
                          </div>
                          
                          <div className="mt-6 flex items-center gap-4">
                            {!activeLesson.quiz_selected_option && (
                              <button
                                onClick={handleCheckAnswer}
                                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                                disabled={!selectedOption}
                              >
                                Check Answer
                              </button>
                            )}
                            
                            {checkResult === 'correct' && (
                              <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                Correct! Great job.
                              </div>
                            )}
                            {checkResult === 'incorrect' && (
                              <div className="flex items-center gap-2 text-rose-600 font-bold bg-rose-50 px-4 py-2 rounded-xl">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                Incorrect. The correct answer was {activeLesson.quiz_correct_answer}.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeLesson.content_url && (
                        <div className="mt-8 pt-6 border-t border-slate-100">
                          <a 
                            href={activeLesson.content_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-md transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Open External Test Link
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-2xl shadow-sm mb-8">
                <div className="text-sm font-medium text-slate-500">
                  {activeLesson.duration_mins ? `${activeLesson.duration_mins} mins` : 'Self-paced'}
                </div>
                <button
                  onClick={handleMarkComplete}
                  disabled={activeLesson.is_completed}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    activeLesson.is_completed
                      ? 'bg-green-50 text-green-600 border border-green-200 cursor-not-allowed'
                      : 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200'
                  }`}
                >
                  {activeLesson.is_completed ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      Completed
                    </>
                  ) : (
                    'Mark as Complete'
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium">
              Select a lesson from the syllabus to begin.
            </div>
          )}
        </div>
      </div>

      {/* Sidebar (Syllabus) */}
      <div className="w-full md:w-80 lg:w-96 bg-white flex flex-col md:h-full border-t md:border-t-0 md:border-l border-slate-200 shrink-0">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-2 truncate" title={courseData.course_title}>
            {courseData.course_title}
          </h2>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>{courseData.completion_percentage}% Complete</span>
              <span>{courseData.completed_lessons}/{courseData.total_lessons}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${courseData.completion_percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Syllabus</h3>
          <LessonList 
            lessons={courseData.lessons} 
            activeLessonId={activeLesson?.id}
            onLessonClick={handleLessonSelect}
          />
        </div>

        {/* Certificate Section — only visible when course is 100% complete */}
        {isCourseCompleted && (
          <div className="p-4 border-t border-slate-100">
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center shadow-md shadow-violet-200">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Course Completed! 🎉</h4>
                  <p className="text-xs text-slate-500">Download your certificate</p>
                </div>
              </div>
              <button
                onClick={generateCertificate}
                disabled={generatingCert}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {generatingCert ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Get Your Certificate
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
