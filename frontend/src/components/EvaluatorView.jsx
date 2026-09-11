import React, { useState, useRef, useEffect } from 'react';
<<<<<<< HEAD
import { ThumbsUp, ThumbsDown, Copy, Check, ArrowUp, Mic, MicOff, Volume2, Square } from 'lucide-react';
=======
import { ThumbsUp, ThumbsDown, Copy, Check, ArrowUp, Link, TriangleAlert, ShieldCheck, Leaf, Paperclip, Download, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';
>>>>>>> e825f0d (UI enhancements for IP-SAKTI 2.0)
import MarkdownRenderer from './MarkdownRenderer';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const formatName = (rawEmail) => {
  if (!rawEmail) return 'there';
  const name = rawEmail.split('@')[0];
  if (name.toLowerCase() === 'vaibhavakumarshrivastav') return 'Vaibhava Kumar Shrivastav';
  return name;
};

export default function EvaluatorView({ language, activeChatId, onFirstMessageSent, recentChats = [], onSelectChat }) {
  const { user, session } = useAuth();
  const [query, setQuery] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [jurisdiction, setJurisdiction] = useState('national');
  const chatEndRef = useRef(null);
  const printRef = useRef(null);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

<<<<<<< HEAD
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Load chat messages from Supabase whenever activeChatId changes
=======
>>>>>>> e825f0d (UI enhancements for IP-SAKTI 2.0)
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const loadChatHistory = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', activeChatId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
      }
    };
    
    loadChatHistory();
  }, [activeChatId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

  // Initialize Speech-to-Text (Microphone)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN'; // Support Hindi/English

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setQuery(transcript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    
    // Cleanup Text-to-Speech on unmount
    return () => window.speechSynthesis.cancel();
  }, [language]);

  const toggleListening = (e) => {
    e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setQuery(''); // Clear previous text when starting new dictation
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Text-to-Speech (Read Aloud)
  const handleSpeak = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    // Clean markdown characters so the bot doesn't read "hash hash asterisk"
    const cleanText = text.replace(/[#*_>\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to match an Indian accent/voice if available
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('hi'));
    if (indianVoice) utterance.voice = indianVoice;
    
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!query.trim() || isLoading) return;
    const userText = query.trim();

    setQuery('');
    
    let currentChatId = activeChatId;

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
      const token = session?.access_token;
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

  const getRiskStyles = (isHighRisk) => {
    if (isHighRisk) {
      return {
        bg: '#FEF2F2',
        border: '#DC2626',
        text: '#B91C1C',
        icon: <TriangleAlert className="w-3 h-3" />
      };
    }
    // Default to compliant/low-risk
    return {
      bg: '#F0FDF4',
      border: '#16A34A',
      text: '#15803D',
      icon: <ShieldCheck className="w-3 h-3" />
    };
  };

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'US';

  return (
    <div className="flex h-full w-full gap-4 transition-all duration-300">
      
      {/* Left Panel: Chat Area */}
      <div className={`flex flex-col h-full bg-transparent transition-all duration-300 ${activeReport ? 'w-1/2' : 'w-full'}`}>
        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="mx-auto w-full max-w-3xl px-4 md:px-8 py-8 md:py-12 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-start justify-center h-full text-left w-full animate-in fade-in duration-500 mt-10 md:mt-20">
              <h1 className="text-3xl font-semibold mb-3 tracking-tight" style={{ color: 'var(--color-base-navy)' }}>
                Good {getTimeOfDay()}, {formatName(user?.email)}
              </h1>
              <p className="text-[14px] mb-12 max-w-xl text-gray-500">
                I am IP-SAKTI 2.0, the statutory compliance assistant for the Ministry of Ayush. How can I help you evaluate your formulation today?
              </p>
              
              {recentChats.length > 0 && (
                <div className="w-full flex flex-col items-start">
                  <span className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>Recent Evaluations</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    {recentChats.map(chat => (
                      <button 
                        key={chat.id}
                        onClick={() => onSelectChat && onSelectChat(chat.id)} 
                        className="p-4 text-left border rounded-sm hover:bg-white transition-all text-sm group"
                        style={{ borderColor: '#E5E7EB', color: 'var(--color-text-muted)' }}
                      >
                        <span className="font-semibold block mb-1 group-hover:text-[var(--color-accent)] transition-colors line-clamp-1" style={{ color: 'var(--color-base-navy)' }}>
                          {chat.title || 'Untitled Evaluation'}
                        </span>
                        <span className="text-xs opacity-80">
                          {new Date(chat.created_at).toLocaleDateString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* User Message */}
              {msg.role === 'user' && (
                <div className="flex items-start justify-end gap-2 max-w-[85%] md:max-w-[75%]">
                  <div 
                    className="rounded-xl rounded-tr-sm px-4 py-3 text-sm shadow-sm"
                    style={{ background: 'var(--color-base-navy)', color: '#FFFFFF' }}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text_content}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm mt-0.5" 
                    style={{ background: 'var(--color-base-navy)', color: '#FFFFFF', border: '2px solid var(--color-surface)' }}>
                    {userInitials}
                  </div>
                </div>
              )}

              {/* AI Message */}
              {msg.role === 'ai' && (
<<<<<<< HEAD
                <div className="flex items-center gap-1 mt-2 text-neutral-400 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleSpeak(msg.report_data ? msg.report_data.final_report.content : msg.text_content)}
                    className="p-1 hover:text-neutral-700 rounded transition-colors"
                    title={isSpeaking ? "Stop reading" : "Read aloud"}
                  >
                    {isSpeaking ? <Square className="w-3.5 h-3.5 text-red-600" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
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
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-all mr-1 ${
              isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-neutral-500 hover:bg-neutral-200'
            }`}
            title="Dictate prompt"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
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
              
              {/* Jurisdiction Toggle */}
              <div className="flex bg-neutral-200/70 p-1 rounded-xl mx-4">
                <button
                  onClick={() => setJurisdiction('national')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    jurisdiction === 'national' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  🇮🇳 National
                </button>
                <button
                  onClick={() => setJurisdiction('international')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    jurisdiction === 'international' ? 'bg-white text-indigo-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  🌐 International
                </button>
              </div>

=======
                <div 
                  className="max-w-[95%] md:max-w-[85%] rounded-[12px] px-5 py-4 shadow-sm"
                  style={{ 
                    background: 'var(--color-surface-card)', 
                    border: '1px solid #E5E7EB',
                    color: 'var(--color-base-navy)'
                  }}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text_content}</div>

                  {/* Evaluation Dossier Card */}
                  {msg.type === 'evaluation' && msg.report_data && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      
                      {/* Trace Text */}
                      <div className="text-[11px] mb-3 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                        <Check className="w-3 h-3" />
                        Extracted {msg.report_data.extracted_plants?.length || 0} entities → cross-referenced statutes
                      </div>

                      <div className="flex flex-col gap-3 mb-4">
                        {/* Risk Chips (Entities) */}
                        <div className="flex flex-wrap gap-2">
                          {msg.report_data.extracted_plants?.map((plant, i) => {
                            const isHighRisk = msg.report_data.dmr_violation || msg.report_data.schedule_e1_violation || msg.report_data.risk_level === 'high';
                            const rStyle = getRiskStyles(isHighRisk);
                            return (
                              <span key={i} className="px-2 py-1 text-[11px] font-semibold rounded-sm flex items-center gap-1.5"
                                style={{ background: rStyle.bg, color: rStyle.text, border: `1px solid ${rStyle.border}` }}
                              >
                                {rStyle.icon}
                                {plant}
                              </span>
                            );
                          })}
                        </div>
                        
                        {/* Statute Reference Chips */}
                        <div className="flex flex-wrap gap-2">
                          {msg.report_data.dmr_violation && (
                            <button className="px-2 py-1 text-[11px] font-medium rounded-md flex items-center gap-1.5 transition-colors hover:bg-gray-50"
                              style={{ border: '1px solid #D1D5DB', color: 'var(--color-text-muted)' }}
                              onClick={() => setActiveReport(msg.report_data)}
                            >
                              <Link className="w-3 h-3" />
                              DMR Act 1954
                            </button>
                          )}
                          <button className="px-2 py-1 text-[11px] font-medium rounded-md flex items-center gap-1.5 transition-colors hover:bg-gray-50"
                            style={{ border: '1px solid #D1D5DB', color: 'var(--color-text-muted)' }}
                            onClick={() => setActiveReport(msg.report_data)}
                          >
                            <Link className="w-3 h-3" />
                            Biological Diversity Act 2002
                          </button>
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={() => setActiveReport(msg.report_data)}
                        className="px-4 py-2 rounded-md text-xs font-semibold transition-all w-full sm:w-auto"
                        style={{ 
                          background: '#0284C7',
                          color: '#FFFFFF'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        Open regulatory canvas
                      </button>

                      {/* Footer */}
                      <div className="mt-4 pt-3 border-t border-gray-100 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        Sources verified {new Date().toLocaleDateString()} · Not a substitute for legal counsel.
                      </div>
                    </div>
                  )}

                  {/* Action Toolbar */}
                  <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleCopy(msg.id, msg.text_content)} className="p-1 rounded transition-colors" style={{ color: 'var(--color-text-muted)' }} title="Copy">
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => handleFeedback(msg.id, msg.feedback === 'like' ? 'none' : 'like')} className="p-1 rounded transition-colors" style={{ color: msg.feedback === 'like' ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleFeedback(msg.id, msg.feedback === 'dislike' ? 'none' : 'dislike')} className="p-1 rounded transition-colors" style={{ color: msg.feedback === 'dislike' ? 'var(--color-risk-high-border)' : 'var(--color-text-muted)' }}>
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-[12px] px-5 py-3 shadow-sm flex gap-2 items-center" style={{ background: 'var(--color-surface-card)', border: '1px solid #E5E7EB' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-text-muted)' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-text-muted)', animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-text-muted)', animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="w-full px-4 pb-4 md:pb-8 bg-transparent">
          <div className="mx-auto w-full max-w-3xl">
            <form onSubmit={handleSend} className="flex items-end gap-2 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm px-3 py-2.5 focus-within:ring-2 focus-within:ring-gray-200 transition-all">
            
            <button type="button" className="p-2 shrink-0 rounded-xl hover:bg-gray-100 transition-colors mb-0.5" style={{ color: 'var(--color-text-muted)' }} title="Attach file">
              <Paperclip className="w-5 h-5" />
            </button>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type formulation details or ask a question..."
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent px-2 py-2 text-[15px] outline-none resize-none min-h-[40px] max-h-[160px] overflow-y-auto"
              style={{ color: 'var(--color-base-navy)' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="p-2 shrink-0 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center mb-0.5"
              style={{ background: '#0284C7', color: '#FFFFFF' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </form>
          </div>
        </div>
      </div>

      {/* Claude-style Artifact Side Panel */}
      {activeReport && (
        <div className="w-1/2 h-full flex flex-col rounded-xl overflow-hidden shadow-2xl border animate-in slide-in-from-right-8 duration-300"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-base-navy)' }}
        >
          {/* Artifact Header */}
          <div className="flex justify-between items-center px-4 py-3 shrink-0" style={{ background: 'var(--color-base-navy)', borderBottom: '1px solid var(--color-base-navy-panel)' }}>
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-md" style={{ color: 'var(--color-accent)' }}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#FFFFFF' }}>
                Regulatory_Dossier.md
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: 'var(--color-base-navy-panel)', color: 'var(--color-surface)' }}>MD</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => {
                  const element = printRef.current;
                  if (!element) return;
                  
                  // Temporarily make it visible for printing
                  element.style.display = 'block';
                  
                  const opt = {
                    margin:       15,
                    filename:     'Regulatory_Dossier.pdf',
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, useCORS: true },
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
                    pagebreak:    { mode: 'css', avoid: ['tr', 'h1', 'h2', 'h3', 'h4', 'p', 'li', '.avoid-break'] }
                  };
                  
                  html2pdf().set(opt).from(element).save().then(() => {
                    // Hide it again
                    element.style.display = 'none';
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                style={{ background: 'var(--color-base-navy-panel)', color: '#FFFFFF', border: '1px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#FFFFFF'; }}
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
>>>>>>> e825f0d (UI enhancements for IP-SAKTI 2.0)
              <button 
                onClick={() => setActiveReport(null)}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: 'var(--color-surface)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-base-navy-panel)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-surface)'; }}
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Artifact Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gray-50 flex justify-center text-gray-900">
            <div className="w-full max-w-3xl flex flex-col min-h-full">
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-8 flex-1">
                <MarkdownRenderer 
                  content={
                    jurisdiction === 'national' 
                      ? (activeReport.final_report?.national_content || activeReport.final_report?.content) 
                      : (activeReport.final_report?.international_content || 'No international dossier generated for this query.')
                  } 
                  isDark={false} 
                />
              </div>

              {/* DYNAMIC AI Audit & Provenance Footer */}
              {activeReport.audit_metrics && (
                <div className="mt-8 pt-4 border-t border-neutral-200 bg-neutral-50 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-3">
                    AI Audit & Traceability Report
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Groundedness Metric */}
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-500 uppercase">Statutory Faithfulness</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-full bg-neutral-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${activeReport.audit_metrics.groundedness_score >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            style={{ width: `${activeReport.audit_metrics.groundedness_score}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-bold ${activeReport.audit_metrics.groundedness_score >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {activeReport.audit_metrics.groundedness_score}%
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1">Dynamic LLM-as-a-Judge Score</span>
                    </div>

                    {/* Knowledge Limit / Confidence */}
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-500 uppercase">Data Completeness</span>
                      <span className={`text-xs font-bold mt-1 flex items-center gap-1 ${
                        activeReport.audit_metrics.confidence === 'High' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          activeReport.audit_metrics.confidence === 'High' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></span>
                        {activeReport.audit_metrics.confidence}
                      </span>
                      <span className="text-[10px] text-neutral-400 mt-1 line-clamp-1" title={activeReport.audit_metrics.completeness}>
                        {activeReport.audit_metrics.completeness}
                      </span>
                    </div>

                    {/* Provenance / Audit Trail */}
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-500 uppercase">Verification Sources</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeReport.audit_metrics.sources?.map((source, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded">
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Hidden Container for PDF Export */}
          <div 
            ref={printRef} 
            className="w-full max-w-none bg-white p-8" 
            style={{ display: 'none', color: '#000' }}
          >
            <div className="mb-6 border-b border-gray-200 pb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">IP-SAKTI 2.0 Regulatory Dossier</h1>
              <p className="text-sm text-gray-500">Ministry of Ayush Regulatory Synthesis - {new Date().toLocaleDateString()}</p>
            </div>
            <MarkdownRenderer content={activeReport.final_report?.content} isDark={false} />
          </div>
        </div>
      )}
    </div>
  );
}