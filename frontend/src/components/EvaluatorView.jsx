import React, { useState, useRef, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Copy, Check, ArrowUp, Mic, MicOff, Volume2, Square, Download, ShieldAlert } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import MarkdownRenderer from './MarkdownRenderer';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function EvaluatorView({ language, activeChatId, onFirstMessageSent }) {
  const { user, getAccessToken } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [jurisdiction, setJurisdiction] = useState('national');
  const chatEndRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const textBeforeMic = useRef('');

  const dossierRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  // Initialize Speech-to-Text (Microphone)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      // Safely iterate through the ResultList (more reliable than Array.from)
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      const baseText = textBeforeMic.current ? textBeforeMic.current + ' ' : '';
      setQuery(baseText + currentTranscript.trimStart());
    };

    // Replace your current recognition.onerror and recognition.onend with this:

    recognition.onerror = (event) => {
      console.warn("Mic error caught:", event.error);
      
      if (event.error === 'no-speech') {
        // Do not immediately set isListening to false here.
        // Chrome will automatically trigger onend next.
        return;
      }
      
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        alert("Microphone access denied or unavailable. Please check your browser permissions.");
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // If the browser stopped the mic due to a pause (no-speech) 
      // but the user still wants to be listening, you can optionally restart it here.
      // For standard behavior, just reset the UI so they can click it again:
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup Text-to-Speech & Mic on unmount
    return () => {
      recognition.stop();
      window.speechSynthesis.cancel();
    };
  }, [language]);

  const toggleListening = (e) => {
    e.preventDefault();
    if (!recognitionRef.current) {
      alert("Voice input is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Save the current input text before starting the mic so we don't overwrite it
      textBeforeMic.current = query;
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Mic start error:", err);
      }
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

  // 1. Initialize the print hook with V3 syntax
  const triggerPrint = useReactToPrint({
    contentRef: dossierRef, // <-- V3 requires contentRef
    documentTitle: `IP_SAKTI_Clearance_${jurisdiction.toUpperCase()}`,
  });

  // 2. Wrap it in our button handler
  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    triggerPrint();
    
    // Reset the button state after a short delay
    setTimeout(() => {
      setIsGeneratingPDF(false);
    }, 1000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    // 1. ADD THIS: Stop the mic and clear context when sending a message
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    textBeforeMic.current = '';
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
    <div className="relative flex flex-col h-full w-full max-w-6xl mx-auto font-sans text-stone-800">
      
      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 pt-8 md:pt-12 space-y-10 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-4'}`}>
            
            {/* Claude-style AI Avatar Icon */}
            {msg.role === 'ai' && (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shrink-0 mt-1">
                <img
                  src="/favicon.png"
                  alt="IP"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className={`group relative max-w-[85%] md:max-w-[75%] ${
              msg.role === 'user' 
                ? 'bg-stone-200 text-stone-900 px-6 py-4 rounded-3xl rounded-tr-sm shadow-sm' 
                : 'bg-transparent text-stone-800 py-1.5'
            }`}>
              <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">{msg.text_content}</p>

              {/* Evaluation Dossier Card */}
              {msg.type === 'evaluation' && msg.report_data && (
                <div className="mt-5 pt-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {msg.report_data.extracted_plants?.map((plant, i) => (
                      <span key={i} className="px-3 py-1 bg-[#F4F2EE] text-teal-800 text-sm font-medium rounded-full border border-stone-200/60">
                        {plant}
                      </span>
                    ))}
                    {msg.report_data.dmr_violation && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-full border border-amber-200/60 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        DMR Violation
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveReport(msg.report_data)}
                    className="w-full sm:w-auto bg-teal-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-teal-700 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    Open Detailed Report ↗
                  </button>
                </div>
              )}

              {/* Action Toolbar on AI responses */}
              {msg.role === 'ai' && (
                <div className="flex items-center gap-2 mt-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleSpeak(msg.report_data ? msg.report_data.final_report.content : msg.text_content)}
                    className="p-1.5 hover:bg-stone-200 hover:text-stone-700 rounded-md transition-colors"
                    title={isSpeaking ? "Stop reading" : "Read aloud"}
                  >
                    {isSpeaking ? <Square className="w-4 h-4 text-amber-600" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleCopy(msg.id, msg.text_content)}
                    className="p-1.5 hover:bg-stone-200 hover:text-stone-700 rounded-md transition-colors"
                    title="Copy text"
                  >
                    {copiedId === msg.id ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, msg.feedback === 'like' ? 'none' : 'like')}
                    className={`p-1.5 rounded-md transition-colors ${msg.feedback === 'like' ? 'text-teal-600 bg-teal-50' : 'hover:bg-stone-200 hover:text-stone-700'}`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, msg.feedback === 'dislike' ? 'none' : 'dislike')}
                    className={`p-1.5 rounded-md transition-colors ${msg.feedback === 'dislike' ? 'text-amber-600 bg-amber-50' : 'hover:bg-stone-200 hover:text-stone-700'}`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shrink-0 mt-1 shadow-sm">
              <img src="/favicon.png" alt="IP" className="w-full h-full object-cover" />
            </div>
            <div className="bg-transparent py-4 flex gap-2 items-center">
              <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form - Pure Single Line Fill-in-the-Blank */}
      <div className="shrink-0 px-4 md:px-10 pb-6 md:pb-8 pt-2">
        <form
          onSubmit={handleSend}
          className="flex items-center w-full border-b-2 border-stone-300 focus-within:border-teal-700 transition-colors pb-2"
        >
          <textarea
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (isListening && recognitionRef.current) recognitionRef.current.stop();
              
              // This makes the textarea grow dynamically as the user types
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            placeholder="Type your formulation details or ask a regulatory question..."
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent border-none px-2 py-2 text-base md:text-lg text-stone-800 outline-none placeholder-stone-400 resize-none w-full max-h-32 overflow-y-auto self-end"
          />

          <div className="flex items-center shrink-0 gap-1">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-full transition-all ${
                isListening
                  ? 'text-amber-600 animate-pulse bg-amber-50'
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
              }`}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="p-2 text-teal-800 hover:text-teal-600 disabled:opacity-30 hover:bg-teal-50 rounded-full transition-all flex items-center justify-center"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-5 h-5 transition-transform duration-300 ${
                  query.trim() && !isLoading
                    ? 'hover:translate-x-1 hover:-translate-y-1'
                    : ''
                }`}
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Expanded Claude-Style Canvas Dossier (Ultra-Wide & Borderless Content) */}
      {activeReport && (
        <div className="absolute inset-0 z-50 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity" onClick={() => setActiveReport(null)} />
          
          {/* Canvas Window - Increased width significantly */}
          <div className="relative w-full md:w-[85%] lg:w-[80%] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right rounded-l-2xl border-l border-stone-200/60 overflow-hidden">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-200/80 bg-stone-50/50 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">Regulatory Canvas</h3>
                  <p className="text-[11px] text-stone-500 uppercase tracking-widest">Ministry of Ayush Synthesis</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex bg-stone-200/60 p-1 rounded-lg">
                  <button
                    onClick={() => setJurisdiction('national')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                      jurisdiction === 'national' ? 'bg-white text-teal-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    National
                  </button>
                  <button
                    onClick={() => setJurisdiction('international')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                      jurisdiction === 'international' ? 'bg-white text-teal-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    International
                  </button>
                </div>

                <div className="h-6 w-px bg-stone-200 hidden sm:block"></div>

                <button 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="hidden sm:flex items-center justify-center w-8 h-8 rounded-md hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-50"
                  title="Save as PDF"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => setActiveReport(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Canvas Scroll Area - Pure white, no inner card, full width text */}
            <div className="flex-1 overflow-y-auto bg-white p-8 md:p-16 lg:p-20 no-scrollbar">
              <div ref={dossierRef} className="w-full max-w-6xl mx-auto min-h-full">
                
                <div className="mb-10 pb-8 border-b border-stone-100">
                  <h2 className="text-3xl md:text-4xl font-serif text-stone-900">IP-SAKTI Clearance</h2>
                  <p className="text-base text-stone-500 mt-3">
                    Jurisdiction Target: <strong className="text-stone-700">{jurisdiction === 'national' ? 'India (AYUSH/CDSCO)' : 'Global Export'}</strong>
                  </p>
                </div>

                <div className="prose prose-stone max-w-none prose-p:leading-relaxed prose-headings:font-serif">
                  <MarkdownRenderer 
                    content={
                      jurisdiction === 'national' 
                        ? (activeReport.final_report?.national_content || activeReport.final_report?.content) 
                        : (activeReport.final_report?.international_content || 'No international dossier generated for this query.')
                    } 
                  />
                </div>
                
                {activeReport.audit_metrics && (
                  <div className="mt-16 pt-8 border-t border-stone-200 bg-stone-50/50 rounded-xl p-8">
                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> Audit & Traceability
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider">Statutory Faithfulness</span>
                        <div className="flex items-center gap-3 mt-2.5">
                          <div className="flex-1 bg-stone-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${activeReport.audit_metrics.groundedness_score >= 90 ? 'bg-teal-600' : 'bg-amber-500'}`} 
                              style={{ width: `${activeReport.audit_metrics.groundedness_score}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-semibold ${activeReport.audit_metrics.groundedness_score >= 90 ? 'text-teal-700' : 'text-amber-700'}`}>
                            {activeReport.audit_metrics.groundedness_score}%
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider">Data Completeness</span>
                        <span className={`text-sm font-medium mt-2 flex items-center gap-2 ${
                          activeReport.audit_metrics.confidence === 'High' ? 'text-teal-700' : 'text-amber-600'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            activeReport.audit_metrics.confidence === 'High' ? 'bg-teal-500' : 'bg-amber-500'
                          }`}></span>
                          {activeReport.audit_metrics.confidence}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider">Verification Sources</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {activeReport.audit_metrics.sources?.map((source, idx) => (
                            <span key={idx} className="text-[11px] px-3 py-1 bg-white border border-stone-200 text-stone-700 rounded-md font-medium shadow-sm">
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
        </div>
      )}
    </div>
  );
}