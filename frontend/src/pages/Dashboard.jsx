import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import EvaluatorView from '../components/EvaluatorView';
import ABSCalculator from '../components/ABSCalculator';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { user } = useAuth();
  const [mainView, setMainView] = useState('evaluator');
  const [language, setLanguage] = useState('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  // Fetch user chats from Supabase
  const loadUserChats = async () => {
    if (!user) {
      setChats([]);
      setActiveChatId(null);
      return;
    }
    const { data } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) {
      setChats(data);
    }
  };

  useEffect(() => {
    loadUserChats();
  }, [user]);

  const handleNewChat = () => {
    setActiveChatId(null);
    setMainView('evaluator');
  };

  const handleUpdateTitle = async (chatId, title) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, title } : c));
    await supabase.from('chats').update({ title }).eq('id', chatId);
  };

  const handleTogglePin = async (chatId, is_pinned) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, is_pinned } : c));
    await supabase.from('chats').update({ is_pinned }).eq('id', chatId);
  };

  const handleDeleteChat = async (chatId) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
    await supabase.from('chats').delete().eq('id', chatId);
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'var(--color-base-navy)', color: '#FAFAF8' }}>
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => { setActiveChatId(id); setMainView('evaluator'); }}
        onNewChat={handleNewChat}
        onUpdateTitle={handleUpdateTitle}
        onTogglePin={handleTogglePin}
        onDeleteChat={handleDeleteChat}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #0f1a2e 0%, #0d1726 100%)' }}>
        <Navbar
          mainView={mainView}
          setMainView={setMainView}
          language={language}
          setLanguage={setLanguage}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onNewChat={handleNewChat}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col"
          style={{ background: 'var(--color-surface)' }}
        >
          {mainView === 'evaluator' ? (
            <EvaluatorView
              language={language}
              activeChatId={activeChatId}
              recentChats={chats.slice(0, 2)}
              onSelectChat={(id) => { setActiveChatId(id); setMainView('evaluator'); }}
              onFirstMessageSent={(newChat) => {
                setChats(prev => [newChat, ...prev]);
                setActiveChatId(newChat.id);
              }}
            />
          ) : (
            <ABSCalculator />
          )}
        </main>
      </div>
    </div>
  );
}
