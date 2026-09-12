import React, { useState } from 'react';
import { 
  Plus, Pin, MessageSquare, Trash2, Edit3, 
  MoreVertical, PanelLeftClose, Check, X, ShieldAlert,
  Calculator, User, LogOut, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const BHASHINI_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिंदी)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' },
  { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'or', label: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'as', label: 'Assamese (অসমীয়া)' },
  { code: 'ur', label: 'Urdu (اردو)' },
  { code: 'sa', label: 'Sanskrit (संस्कृतम्)' },
  { code: 'mai', label: 'Maithili (मैथिली)' },
  { code: 'brx', label: 'Bodo (बड़ो)' },
  { code: 'doi', label: 'Dogri (डोगरी)' },
  { code: 'ks', label: 'Kashmiri (कॉशुर)' },
  { code: 'gom', label: 'Konkani (कोंकणी)' },
  { code: 'mni', label: 'Manipuri (মৈতৈলোন্)' },
  { code: 'ne', label: 'Nepali (नेपाली)' },
  { code: 'sat', label: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)' },
  { code: 'sd', label: 'Sindhi (سنڌي)' }
];

export default function Sidebar({ 
  isOpen, 
  setIsOpen, 
  chats, 
  activeChatId, 
  onSelectChat, 
  onNewChat, 
  onUpdateTitle, 
  onTogglePin, 
  onDeleteChat,
  mainView,
  setMainView,
  language,
  setLanguage
}) {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);

  const startRename = (chat, e) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (chatId, e) => {
    e?.stopPropagation();
    if (editTitle.trim()) {
      onUpdateTitle(chatId, editTitle.trim());
    }
    setEditingId(null);
  };

  const pinnedChats = chats.filter(c => c.is_pinned);
  const recentChats = chats.filter(c => !c.is_pinned);

  const renderChatItem = (chat) => {
    const isActive = chat.id === activeChatId;
    const isEditing = editingId === chat.id;

    return (
      <div 
        key={chat.id}
        onClick={() => onSelectChat(chat.id)}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-200 ${
          isActive 
            ? 'bg-stone-200/80 font-medium text-stone-900 shadow-sm' 
            : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {chat.is_pinned ? (
            <Pin className="w-4 h-4 text-teal-700 shrink-0" />
          ) : (
            <MessageSquare className="w-4 h-4 text-stone-400 shrink-0" />
          )}

          {isEditing ? (
            <div className="flex items-center gap-1 flex-1 pr-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename(chat.id, e);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className="w-full bg-white border border-stone-300 rounded-md px-2 py-1 text-xs outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700/50 transition-all"
              />
              <button onClick={(e) => handleSaveRename(chat.id, e)} className="text-teal-700 hover:text-teal-800 p-1 bg-teal-50 rounded-md ml-1 transition-colors">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditingId(null)} className="text-stone-400 hover:text-stone-600 p-1 hover:bg-stone-200 rounded-md transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="truncate pr-2">{chat.title || 'New Formulation'}</span>
          )}
        </div>

        {!isEditing && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-stone-300/50 rounded-md transition-all text-stone-500 hover:text-stone-800"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpenId === chat.id && (
              <div 
                className="absolute z-100 right-0 top-full mt-1 z-30 w-36 bg-[#FAF9F6] border border-stone-200 rounded-xl shadow-lg py-1.5 animate-fade-in text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    onTogglePin(chat.id, !chat.is_pinned);
                    setMenuOpenId(null);
                  }}
                  className="w-full px-4 py-2 flex items-center gap-2.5 text-stone-700 hover:bg-stone-200/60 transition-colors"
                >
                  <Pin className="w-4 h-4 text-teal-700" />
                  {chat.is_pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={(e) => startRename(chat, e)}
                  className="w-full px-4 py-2 flex items-center gap-2.5 text-stone-700 hover:bg-stone-200/60 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-stone-500" />
                  Rename
                </button>
                <button
                  onClick={() => {
                    onDeleteChat(chat.id);
                    setMenuOpenId(null);
                  }}
                  className="w-full px-4 py-2 flex items-center gap-2.5 text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-stone-900/10 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-[#F4F2EE] border-r border-stone-200/60 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0'
      } overflow-hidden font-sans`}>
        
        {/* Top Header & Tools */}
        <div className="p-4 flex flex-col gap-5 border-b border-stone-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shrink-0 mt-1 ">
                <img
                  src="/favicon.png"
                  alt="IP"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-lg font-serif font-bold tracking-tight text-stone-900">
                IP-SAKTI 2.0
              </h1>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-stone-400 hover:bg-stone-200/80 rounded-full transition-colors md:hidden"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => setMainView('evaluator')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                mainView === 'evaluator' ? 'bg-stone-200/80 text-stone-900 shadow-sm' : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Evaluation Chat
            </button>
            <button
              onClick={() => setMainView('calculator')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                mainView === 'calculator' ? 'bg-stone-200/80 text-stone-900 shadow-sm' : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900'
              }`}
            >
              <Calculator className="w-4 h-4" />
              ABS Calculator
            </button>
          </div>

          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-800 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Evaluation
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {pinnedChats.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-3 block mb-2">
                Pinned
              </span>
              <div className="space-y-1">{pinnedChats.map(renderChatItem)}</div>
            </div>
          )}

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 px-3 block mb-2">
              Recent Evaluations
            </span>
            <div className="space-y-1">
              {recentChats.length === 0 ? (
                <p className="text-sm text-stone-400 px-3 py-2 italic font-serif">No history yet</p>
              ) : (
                recentChats.map(renderChatItem)
              )}
            </div>
          </div>
        </div>

        {/* Footer Area: Language & User Context */}
        <div className="p-4 border-t border-stone-200/60 flex flex-col gap-3 bg-[#F4F2EE]">
          
          <div className="flex items-center gap-2 px-1">
            <Globe className="w-4 h-4 text-stone-500 shrink-0" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-stone-600 text-sm font-medium w-full outline-none cursor-pointer focus:text-stone-900 transition-colors"
            >
              {BHASHINI_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>

          {user ? (
            <div className="flex items-center justify-between bg-stone-200/50 p-2 rounded-xl border border-stone-200/40">
              <span className="text-xs text-stone-600 font-medium truncate max-w-[130px] px-1">
                {user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-stone-200 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-300 transition-colors shadow-sm"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}

          <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-medium text-stone-400 uppercase tracking-widest">
            <ShieldAlert className="w-3 h-3 text-teal-700/70" />
            Statutory Audit Mode
          </div>
        </div>
      </aside>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}