import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { coreApi } from '../../api/axios';

const GlobalChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user') || '{}'));
  const messagesEndRef = useRef(null);

  // Giphy Search State
  const [showGiphy, setShowGiphy] = useState(false);
  const [giphyQuery, setGiphyQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loadingGifs, setLoadingGifs] = useState(false);

  // Initialize Socket and Fetch History
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    
    // Fetch History
    coreApi.get('/chat/history').then((res) => {
      if (res.data.success) {
        setMessages(res.data.data);
      }
    }).catch(err => console.error("Failed to load history", err));

    // Connect Socket
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      query: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat');
    });

    newSocket.on('status', (data) => {
      setMessages(prev => [...prev, { type: 'status', content: data.msg, id: Date.now() }]);
    });

    newSocket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;
    socket.emit('send_message', { content: inputValue });
    setInputValue('');
  };

  const handleSendGif = (gifUrl) => {
    if (!socket) return;
    socket.emit('send_message', { image_url: gifUrl });
    setShowGiphy(false);
    setGiphyQuery('');
    setGifs([]);
  };

  // Search Giphy
  useEffect(() => {
    if (!giphyQuery.trim()) {
      setGifs([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoadingGifs(true);
      try {
        const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=GlVGYHqcVGWvwehn3HmbqA9X1W3jE01e&q=${encodeURIComponent(giphyQuery)}&limit=12`);
        const data = await res.json();
        setGifs(data.data || []);
      } catch (err) {
        console.error("Giphy search failed", err);
      } finally {
        setLoadingGifs(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [giphyQuery]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Global Chat</h1>
        <p className="text-slate-500 mt-1 md:mt-2 text-sm md:text-base">Connect, chat, and share GIFs with students around the world.</p>
      </div>

      <div className="flex-1 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => {
            if (msg.type === 'status') {
              return (
                <div key={msg.id || idx} className="flex justify-center my-2">
                  <span className="bg-slate-200 text-slate-500 text-xs px-3 py-1 rounded-full font-medium">
                    {msg.content}
                  </span>
                </div>
              );
            }

            const isMine = msg.sender_id === user.id;

            return (
              <div key={msg.id || idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                <div className="flex items-end gap-2 max-w-[70%]">
                  {!isMine && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {msg.sender_name ? msg.sender_name[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-slate-400 mb-1 font-medium ml-1">
                      {isMine ? 'You' : msg.sender_name}
                    </span>
                    <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                      isMine ? 'bg-violet-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                    }`}>
                      {msg.content && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                      {msg.image_url && (
                        <img src={msg.image_url} alt="Shared GIF" className="rounded-xl mt-2 max-w-full sm:max-w-xs object-cover" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Giphy Search Popup */}
        {showGiphy && (
          <div className="absolute bottom-[80px] left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-20">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-700 text-sm">Search Giphy</h3>
              <button onClick={() => setShowGiphy(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <input 
              type="text" 
              placeholder="Search GIFs..." 
              value={giphyQuery}
              onChange={(e) => setGiphyQuery(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              autoFocus
            />
            <div className="h-64 overflow-y-auto grid grid-cols-2 gap-2 pr-1 custom-scrollbar">
              {loadingGifs ? (
                <div className="col-span-2 flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
                </div>
              ) : gifs.map((gif) => (
                <img 
                  key={gif.id} 
                  src={gif.images.fixed_height_small.url} 
                  alt={gif.title}
                  onClick={() => handleSendGif(gif.images.downsized_medium.url)}
                  className="w-full h-24 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
              {!loadingGifs && gifs.length === 0 && giphyQuery && (
                <div className="col-span-2 text-center text-slate-400 text-xs py-4">No GIFs found</div>
              )}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 md:p-4 bg-white border-t border-slate-100 flex items-center md:items-end gap-2 md:gap-3 relative z-10">
          <button 
            type="button"
            onClick={() => setShowGiphy(!showGiphy)}
            className={`p-2 md:p-3 rounded-xl transition-colors shrink-0 ${showGiphy ? 'bg-violet-100 text-violet-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
            title="Search GIFs"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          
          <form onSubmit={handleSendMessage} className="flex-1 flex gap-2 md:gap-3">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl px-4 md:px-5 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all shadow-md shadow-violet-200 disabled:opacity-50 disabled:shadow-none shrink-0"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GlobalChat;
