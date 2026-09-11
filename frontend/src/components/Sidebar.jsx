import React, { useState } from 'react';
import { 
  Plus, Pin, MessageSquare, Trash2, Edit3, 
  MoreVertical, PanelLeftClose, PanelLeft, Check, X, ShieldAlert 
} from 'lucide-react';

export default function Sidebar({ 
  isOpen, 
  setIsOpen, 
  chats, 
  activeChatId, 
  onSelectChat, 
  onNewChat, 
  onUpdateTitle, 
  onTogglePin, 
  onDeleteChat 
}) {
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
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all ${
          isActive 
            ? 'bg-neutral-200/60 font-semibold text-neutral-900' 
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {chat.is_pinned ? (
            <Pin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
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
                className="w-full bg-white border border-neutral-300 rounded px-1.5 py-0.5 text-xs outline-none focus:border-neutral-900"
              />
              <button onClick={(e) => handleSaveRename(chat.id, e)} className="text-emerald-600 hover:text-emerald-800 p-0.5">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditingId(null)} className="text-neutral-400 hover:text-neutral-600 p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="truncate pr-2">{chat.title || 'New Formulation'}</span>
          )}
        </div>

        {/* Action Button & Dropdown */}
        {!isEditing && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-300/50 rounded-md transition-opacity"
            >
              <MoreVertical className="w-3.5 h-3.5 text-neutral-500" />
            </button>

            {menuOpenId === chat.id && (
              <div 
                className="absolute right-0 top-full mt-1 z-30 w-36 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 animate-fade-in text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    onTogglePin(chat.id, !chat.is_pinned);
                    setMenuOpenId(null);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-neutral-700 hover:bg-neutral-50"
                >
                  <Pin className="w-3.5 h-3.5" />
                  {chat.is_pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={(e) => startRename(chat, e)}
                  className="w-full px-3 py-2 flex items-center gap-2 text-neutral-700 hover:bg-neutral-50"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Rename
                </button>
                <button
                  onClick={() => {
                    onDeleteChat(chat.id);
                    setMenuOpenId(null);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-neutral-50 border-r border-neutral-200 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0'
      } overflow-hidden`}>
        <div className="p-4 flex items-center justify-between border-b border-neutral-200/70">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Evaluation
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 ml-2 text-neutral-500 hover:bg-neutral-200/60 rounded-xl"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {pinnedChats.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 block mb-1.5">
                Pinned
              </span>
              <div className="space-y-0.5">{pinnedChats.map(renderChatItem)}</div>
            </div>
          )}

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 block mb-1.5">
              Recent Evaluations
            </span>
            <div className="space-y-0.5">
              {recentChats.length === 0 ? (
                <p className="text-xs text-neutral-400 px-3 py-2 italic">No history yet</p>
              ) : (
                recentChats.map(renderChatItem)
              )}
            </div>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="p-3 border-t border-neutral-200/70 text-[11px] text-neutral-400 flex items-center gap-1.5 justify-center">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Statutory Audit Mode</span>
        </div>
      </aside>
    </>
  );
}