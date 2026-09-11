import React, { useState, useRef, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Copy, Check, ArrowUp, Mic, MicOff, Volume2, Square } from 'lucide-react';
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
  const [jurisdiction, setJurisdiction] = useState('national');
  const chatEndRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

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

              <button 
                onClick={() => setActiveReport(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <MarkdownRenderer 
                content={
                  jurisdiction === 'national' 
                    ? (activeReport.final_report?.national_content || activeReport.final_report?.content) 
                    : (activeReport.final_report?.international_content || 'No international dossier generated for this query.')
                } 
              />
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
      )}
    </div>
  );
}