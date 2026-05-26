import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../../api/courses.api';
import FileUploader from '../../components/FileUploader';

const AddCourse = () => {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Development');
  const [price, setPrice] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        title,
        description,
        category,
        thumbnail_url: thumbnailUrl,
        price: parseFloat(price) || 0
      };
      
      const res = await createCourse(payload);
      if (res.success) {
        // Navigate to the Course Builder to add lessons
        navigate(`/faculty/courses/${res.data.id}/builder`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/faculty/courses')}
        className="text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors flex items-center gap-2 mb-4 md:mb-6"
      >
        <span>&larr;</span> Back to My Courses
      </button>

      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Create New Course</h1>
        <p className="text-slate-500 mt-2">Start by providing basic information about your course. You can add lessons in the next step.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6 md:space-y-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">Basic Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Course Title <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
                placeholder="e.g. Complete Web Development Bootcamp"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500 transition-colors"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows="4"
                placeholder="What will students learn in this course?"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500 transition-colors resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500 transition-colors"
              >
                <option value="Development">Development</option>
                <option value="Business">Business</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="IT & Software">IT & Software</option>
                <option value="Personal Development">Personal Development</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Price (₹) <span className="text-slate-400 font-normal text-xs ml-1">(Leave 0 for Free)</span></label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder="e.g. 999"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">Course Media</h2>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Course Thumbnail</label>
            <div className="mb-4">
              <FileUploader 
                label="Upload Thumbnail Image"
                allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
                onUploadSuccess={(url) => setThumbnailUrl(url)}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
              <span className="w-full border-t border-slate-200"></span>
              <span className="px-4">OR ENTER URL</span>
              <span className="w-full border-t border-slate-200"></span>
            </div>

            <input 
              type="url" 
              value={thumbnailUrl} 
              onChange={(e) => setThumbnailUrl(e.target.value)} 
              placeholder="e.g. https://example.com/image.jpg"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500 transition-colors"
            />
            
            {thumbnailUrl && (
              <div className="mt-4 p-2 border border-slate-200 rounded-xl max-w-sm">
                <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-auto rounded-lg" onError={(e) => e.target.src='https://placehold.co/600x400?text=Invalid+Image+URL'} />
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md shadow-violet-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Course...
              </>
            ) : (
              <>
                Save & Continue to Lessons
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;
