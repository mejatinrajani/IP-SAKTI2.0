import React, { useState, useRef, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Copy, Check, ArrowUp } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function EvaluatorView({ language, activeChatId, onFirstMessageSent }) {
  const { user, getAccessToken } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const chatEndRef = useRef(null);

  // Load chat messages from Supabase whenever activeChatId changes
  useEffect(() => {
    if (!activeChatId) {
      setMessages([{
        id: 'welcome',
        role: 'ai',
        type: 'chat',
        text_content: 'Hello! I am IP-SAKTI 2.0, the statutory compliance assistant for the Ministry of Ayush. Submit your formulation ingredients or therapeutic claims to begin evaluation.',
        feedback: 'none'
      }]);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', activeChatId)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setMessages(data);
      }
    };
    fetchMessages();
  }, [activeChatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = async (messageId, feedbackType) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback: feedbackType } : m));
    if (user && activeChatId && messageId !== 'welcome') {
      await supabase.from('messages').update({ feedback: feedbackType }).eq('id', messageId);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userText = query.trim();
    setQuery('');
    
    let currentChatId = activeChatId;

    // Create a new chat session in Supabase if this is the first message
    if (user && !currentChatId) {
      const { data: newChat } = await supabase
        .from('chats')
        .insert([{ user_id: user.id, title: userText.slice(0, 30) }])
        .select()
        .single();
      if (newChat) {
        currentChatId = newChat.id;
        onFirstMessageSent(newChat);
      }
    }

    const userMsgObj = {
      id: Math.random().toString(),
      chat_id: currentChatId,
      role: 'user',
      type: 'chat',
      text_content: userText,
      feedback: 'none'
    };

    setMessages(prev => [...prev, userMsgObj]);
    setIsLoading(true);

    if (user && currentChatId) {
      await supabase.from('messages').insert([{
        chat_id: currentChatId,
        role: 'user',
        type: 'chat',
        text_content: userText
      }]);
    }

    try {
      const token = getAccessToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/v1/orchestrate/evaluate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ user_prompt: userText, user_language: language })
      });

      if (!res.ok) throw new Error(`Server returned status: ${res.status}`);
      const data = await res.json();

      const aiMsgObj = {
        id: Math.random().toString(),
        chat_id: currentChatId,
        role: 'ai',
        type: data.type,
        text_content: data.message,
        report_data: data.report,
        feedback: 'none'
      };

      setMessages(prev => [...prev, aiMsgObj]);

      if (user && currentChatId) {
        await supabase.from('messages').insert([{
          chat_id: currentChatId,
          role: 'ai',
          type: data.type,
          text_content: data.message,
          report_data: data.report
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'ai',
        type: 'error',
        text_content: 'Evaluation failed. Please verify the backend service is reachable.',
        feedback: 'none'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-[85vh] w-full max-w-4xl mx-auto bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`group relative max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 ${
              msg.role === 'user' 
                ? 'bg-neutral-900 text-white rounded-tr-xs' 
                : 'bg-neutral-50 border border-neutral-200/70 text-neutral-800 rounded-tl-xs'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text_content}</p>

              {/* Evaluation Dossier Card */}
              {msg.type === 'evaluation' && msg.report_data && (
                <div className="mt-3.5 pt-3.5 border-t border-neutral-200/80">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {msg.report_data.extracted_plants?.map((plant, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-100">
                        {plant}
                      </span>
                    ))}
                    {msg.report_data.dmr_violation && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-semibold rounded-md border border-red-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        DMR Violation
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveReport(msg.report_data)}
                    className="w-full sm:w-auto bg-neutral-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    Open Regulatory Canvas ↗
                  </button>
                </div>
              )}

              {/* Action Toolbar on AI responses */}
              {msg.role === 'ai' && (
                <div className="flex items-center gap-1 mt-2 text-neutral-400 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(msg.id, msg.text_content)}
                    className="p-1 hover:text-neutral-700 rounded transition-colors"
                    title="Copy text"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, msg.feedback === 'like' ? 'none' : 'like')}
                    className={`p-1 rounded transition-colors ${msg.feedback === 'like' ? 'text-indigo-600' : 'hover:text-neutral-700'}`}
                    title="Helpful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, msg.feedback === 'dislike' ? 'none' : 'dislike')}
                    className={`p-1 rounded transition-colors ${msg.feedback === 'dislike' ? 'text-red-600' : 'hover:text-neutral-700'}`}
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-50 border border-neutral-200/70 rounded-2xl rounded-tl-xs px-4 py-3 flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-neutral-100 bg-white">
        <form onSubmit={handleSend} className="relative flex items-center bg-neutral-50 rounded-2xl border border-neutral-200/90 px-3 py-1.5 focus-within:ring-2 focus-within:ring-neutral-900/10 focus-within:border-neutral-900 transition-all">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your formulation details or ask a regulatory question..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-2 py-2 text-sm text-neutral-800 outline-none placeholder-neutral-400"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="p-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 disabled:opacity-20 transition-all ml-1"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Dossier Canvas Side Panel */}
      {activeReport && (
        <div className="absolute inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-xs" onClick={() => setActiveReport(null)} />
          <div className="relative w-full md:w-3/4 bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 animate-slide-in-right">
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Statutory Dossier Canvas</h3>
                <p className="text-xs text-neutral-500">Ministry of Ayush Regulatory Synthesis</p>
              </div>
              <button 
                onClick={() => setActiveReport(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <MarkdownRenderer content={activeReport.final_report?.content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}