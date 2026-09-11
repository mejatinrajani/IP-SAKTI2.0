import React, { useState, useMemo } from 'react';
import { 
  Pin, MessageSquare, Trash2, Edit3, 
  MoreVertical, PanelLeftClose, Check, X, Search, Plus
} from 'lucide-react';

const getMockStatus = (title) => {
  if (!title) return 'low';
  const len = title.length;
  if (len % 3 === 0) return 'high';
  if (len % 3 === 1) return 'medium';
  return 'low';
};

const StatusDot = ({ status }) => {
  let bgColor = 'var(--color-risk-low-border)';
  if (status === 'high') bgColor = 'var(--color-risk-high-border)';
  if (status === 'medium') bgColor = 'var(--color-risk-medium-border)';
  
  return (
    <span 
      className="w-2 h-2 rounded-full shrink-0 mt-1.5" 
      style={{ backgroundColor: bgColor }} 
      title={`Risk Level: ${status}`}
    />
  );
};

export default function Sidebar({ 
  isOpen, 
  setIsOpen, 
  chats, 
  activeChatId, 
  onSelectChat, 
  onUpdateTitle, 
  onTogglePin, 
  onDeleteChat,
  onNewChat
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const lowerQ = searchQuery.toLowerCase();
    return chats.filter(c => c.title?.toLowerCase().includes(lowerQ));
  }, [chats, searchQuery]);

  const pinnedChats = filteredChats.filter(c => c.is_pinned);
  const recentChats = filteredChats.filter(c => !c.is_pinned);

  const renderChatItem = (chat) => {
    const isActive = chat.id === activeChatId;
    const isEditing = editingId === chat.id;
    const status = getMockStatus(chat.title);

    return (
      <div 
        key={chat.id}
        onClick={() => onSelectChat(chat.id)}
        className="group relative flex items-start justify-between px-3 py-2 cursor-pointer text-sm transition-all rounded-md mx-2"
        style={isActive 
          ? { 
              background: 'rgba(255,255,255,0.05)', 
              color: 'var(--color-surface)', 
            }
          : { 
              color: 'var(--color-text-secondary-on-dark)',
            }
        }
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {chat.is_pinned ? (
            <Pin className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-70" />
          ) : (
            <StatusDot status={status} />
          )}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-1 flex-1 pr-2 mb-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(chat.id, e);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="w-full rounded px-1.5 py-0.5 text-xs outline-none"
                  style={{ background: 'var(--color-base-navy)', border: '1px solid var(--color-text-secondary-on-dark)', color: 'var(--color-surface)' }}
                />
                <button onClick={(e) => handleSaveRename(chat.id, e)} className="p-0.5" style={{ color: 'var(--color-risk-low-border)' }}>
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingId(null)} className="p-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="truncate font-medium pr-2 text-[13px]" style={isActive ? {color: 'var(--color-surface)'} : {color: 'var(--color-text-secondary-on-dark)'}}>
                {chat.title || 'New Formulation'}
              </div>
            )}
            <div className="text-[10px] mt-0.5 uppercase tracking-wider font-semibold" style={{ color: '#9CA3AF' }}>
              {status} risk · just now
            </div>
          </div>
        </div>

        {/* Action Button & Dropdown */}
        {!isEditing && (
          <div className="relative shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity"
              style={{ color: 'var(--color-text-secondary-on-dark)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpenId === chat.id && (
              <div 
                className="absolute right-0 top-full mt-1 z-30 w-36 rounded-md shadow-lg py-1 text-xs"
                style={{ background: 'var(--color-base-navy)', border: '1px solid var(--color-base-navy-panel)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    onTogglePin(chat.id, !chat.is_pinned);
                    setMenuOpenId(null);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 transition-colors"
                  style={{ color: 'var(--color-surface)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-base-navy-panel)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Pin className="w-3.5 h-3.5" />
                  {chat.is_pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={(e) => startRename(chat, e)}
                  className="w-full px-3 py-2 flex items-center gap-2 transition-colors"
                  style={{ color: 'var(--color-surface)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-base-navy-panel)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Rename
                </button>
                <button
                  onClick={() => {
                    onDeleteChat(chat.id);
                    setMenuOpenId(null);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 transition-colors"
                  style={{ color: 'var(--color-risk-high-border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-risk-high-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'w-[260px] translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0'
        } overflow-hidden`}
        style={{ 
          background: 'var(--color-base-navy-panel)',
          borderRight: isOpen ? '1px solid var(--color-base-navy)' : 'none'
        }}
      >
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid transparent' }}>
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2" style={{ color: 'var(--color-text-secondary-on-dark)' }} />
            <input 
              type="text" 
              placeholder="Search evaluations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs outline-none"
              style={{ background: 'var(--color-base-navy)', color: 'var(--color-surface)', border: '1px solid transparent' }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              onBlur={(e) => e.target.style.borderColor = 'transparent'}
            />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 ml-2 rounded-md transition-colors md:hidden"
            style={{ color: 'var(--color-text-secondary-on-dark)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-base-navy)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto py-1 space-y-6">
          <div className="px-4">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-all"
              style={{ 
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--color-surface)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <Plus className="w-4 h-4" />
              New Evaluation
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between px-5 mb-2">
              <span className="text-[13px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Projects
              </span>
              <button className="opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {pinnedChats.length === 0 ? (
              <div className="flex items-center gap-2.5 px-5 py-1 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                <Pin className="w-3.5 h-3.5 -rotate-45 shrink-0 opacity-70" />
                <span>Pin projects to keep them here</span>
              </div>
            ) : (
              <div className="space-y-0.5">{pinnedChats.map(renderChatItem)}</div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between px-5 mb-2">
              <span className="text-[13px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Chats and tasks
              </span>
            </div>
            <div className="space-y-0.5">
              {recentChats.length === 0 ? (
                <p className="text-[13px] px-5 py-1 italic" style={{ color: 'var(--color-text-muted)' }}>No history yet</p>
              ) : (
                recentChats.map(renderChatItem)
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}