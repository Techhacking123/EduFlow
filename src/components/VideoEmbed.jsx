import React from 'react';

const VideoEmbed = ({ url, title }) => {
  if (!url) {
    return (
      <div className="aspect-video w-full bg-slate-900 flex items-center justify-center text-slate-500 rounded-2xl">
        <p className="text-sm">No video source provided</p>
      </div>
    );
  }

  // Check if URL is YouTube
  const getYouTubeId = (urlStr) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlStr.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const ytId = getYouTubeId(url);

  if (ytId) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-950">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`}
          title={title || 'Video Player'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Standard video url (e.g. Cloudinary, local mp4)
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-950">
      <video
        src={url}
        controls
        controlsList="nodownload"
        className="w-full h-full object-contain"
        title={title || 'Video Player'}
      />
    </div>
  );
};

export default VideoEmbed;
