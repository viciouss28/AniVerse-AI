import { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';

export function App() {
  // Sync page state with window location hash if desired, or simple state
  const [currentPage, setCurrentPage] = useState<'home' | 'chat'>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#/chat' || hash === '#chat') return 'chat';
    return 'home';
  });

  const handleNavigate = (page: 'home' | 'chat') => {
    setCurrentPage(page);
    window.location.hash = page === 'chat' ? '#/chat' : '#/';
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#/chat' || hash === '#chat') {
        setCurrentPage('chat');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080910] text-[#F8FAFC]">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <div className="flex-1">
        {currentPage === 'home' ? (
          <HomePage onGetStarted={() => handleNavigate('chat')} />
        ) : (
          <ChatPage />
        )}
      </div>
    </div>
  );
}

export default App;
