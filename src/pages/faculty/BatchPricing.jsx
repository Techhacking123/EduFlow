import React, { useState, useEffect } from 'react';
import { getMyBatches, updateBatchPrice } from '../../api/batches.api';
import { useToast } from '../../contexts/ToastContext';

const BatchPricing = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { addToast } = useToast();

  const fetchBatches = async () => {
    try {
      const res = await getMyBatches();
      if (res.success) {
        // We will store local state for inputs so they can be edited before saving
        const batchesWithInput = res.data.map(b => ({
          ...b,
          inputPrice: b.price,
          inputIsFree: b.is_free
        }));
        setBatches(batchesWithInput);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleInputChange = (batchId, field, value) => {
    setBatches(prev => prev.map(b => 
      b.id === batchId ? { ...b, [field]: value } : b
    ));
  };

  const handleSave = async (batchId) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    setUpdatingId(batchId);
    try {
      const res = await updateBatchPrice(batchId, {
        price: batch.inputIsFree ? 0 : parseFloat(batch.inputPrice || 0),
        is_free: batch.inputIsFree
      });
      if (res.success) {
        addToast("Batch pricing updated successfully!", "success");
        fetchBatches(); // reload fresh data
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to update pricing.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-slate-200 rounded animate-pulse mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(n => <div key={n} className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Batch Pricing & Enrollment</h1>
          <p className="text-slate-500 mt-2">Set enrollment fees for your upcoming and ongoing batches.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl border border-emerald-100 flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-80">Total Revenue</div>
            <div className="text-lg font-black">₹{batches.reduce((acc, curr) => acc + (curr.total_revenue || 0), 0).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {batches.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm text-slate-500">
            No batches assigned to you yet.
          </div>
        ) : (
          batches.map(batch => (
            <div key={batch.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 w-full border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                    batch.status === 'upcoming' ? 'bg-amber-100 text-amber-700' :
                    batch.status === 'ongoing' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {batch.status}
                  </span>
                  <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">
                    {batch.enrollment_count} Enrolled
                  </span>
                  {batch.dropped_count > 0 && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                      {batch.dropped_count} Canceled
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 leading-tight mb-1">{batch.name}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-1">{batch.course?.title || "Course Name Unavailable"}</p>
                <div className="text-sm font-semibold text-slate-600 bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100">
                  Revenue: <span className="text-emerald-600">₹{batch.total_revenue}</span>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col gap-4 min-w-[320px]">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label htmlFor={`free-${batch.id}`} className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                    Offer for Free
                  </label>
                  <input 
                    type="checkbox" 
                    id={`free-${batch.id}`}
                    checked={batch.inputIsFree}
                    onChange={(e) => handleInputChange(batch.id, 'inputIsFree', e.target.checked)}
                    className="w-5 h-5 text-violet-600 rounded border-slate-300 focus:ring-violet-500 transition-all cursor-pointer"
                  />
                </div>

                {!batch.inputIsFree && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input 
                      type="number"
                      value={batch.inputPrice}
                      onChange={(e) => handleInputChange(batch.id, 'inputPrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                )}

                <button
                  onClick={() => handleSave(batch.id)}
                  disabled={updatingId === batch.id || (batch.price === batch.inputPrice && batch.is_free === batch.inputIsFree)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    updatingId === batch.id 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : (batch.price !== parseFloat(batch.inputPrice) || batch.is_free !== batch.inputIsFree)
                        ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer'
                  }`}
                >
                  {updatingId === batch.id ? 'Saving...' : 'Save Pricing Settings'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BatchPricing;
