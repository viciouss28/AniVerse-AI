import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, RefreshCw, Sparkles, User, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Logo } from '../components/common/Logo';
import { fetchAnimeRecommendationsStream } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
  queryToRetry?: string;
  isStreaming?: boolean;
}

const PROMPT_SUGGESTIONS = [
  "Dark psychological anime",
  "Anime like Attack on Titan",
  "Romantic comedy",
  "Short anime under 30 episodes",
  "Surprise me",
];

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      content: "Kon'nichiwa! Tell me what kind of anime you're looking for.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
    );
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      sender: 'user',
      content: query,
      timestamp,
    };

    const aiMsgId = `ai-${Date.now()}`;
    const initialAiMessage: Message = {
      id: aiMsgId,
      sender: 'assistant',
      content: "Finding anime for you...",
      timestamp,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, initialAiMessage]);
    setInputValue('');
    setIsLoading(true);

    let hasReceivedChunk = false;

    await fetchAnimeRecommendationsStream(
      query,
      (chunk: string) => {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === aiMsgId) {
              const newContent = hasReceivedChunk ? msg.content + chunk : chunk;
              return { ...msg, content: newContent, isStreaming: true };
            }
            return msg;
          })
        );
        hasReceivedChunk = true;
      },
      () => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg))
        );
        setIsLoading(false);
        abortControllerRef.current = null;
      },
      (err: Error) => {
        console.error('Streaming error:', err);
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === aiMsgId) {
              return {
                ...msg,
                content: "Something went wrong while finding your anime. Please try again.",
                isError: true,
                queryToRetry: query,
                isStreaming: false,
              };
            }
            return msg;
          })
        );
        setIsLoading(false);
        abortControllerRef.current = null;
      },
      abortController.signal
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRetry = (queryToRetry?: string) => {
    if (queryToRetry) {
      handleSend(queryToRetry);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-dark-900 bg-grid-pattern">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-ambient-glow pointer-events-none rounded-full blur-3xl opacity-60" />

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col justify-between">
        
        {/* Header Section */}
        <div className="text-center py-4 border-b border-surface-border/40 mb-6">
          <div className="inline-flex items-center space-x-2 text-xl font-bold text-appText-main">
            <Logo size="sm" />
            <span>AniVerse <span className="text-brand-cyan">AI</span></span>
          </div>
          <p className="text-xs sm:text-sm text-appText-muted mt-1">
            Your AI anime recommendation companion
          </p>
        </div>

        {/* Messages List Container */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-6 px-1">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start space-x-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="flex-shrink-0 mt-0.5">
                    <Logo size="sm" className={msg.isStreaming && msg.content === "Finding anime for you..." ? "animate-pulse" : ""} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-brand-purple to-brand-violet text-white rounded-tr-none'
                      : msg.isError
                      ? 'bg-surface-900 border border-red-500/40 text-red-200 rounded-tl-none'
                      : 'bg-surface-900 border border-surface-border text-appText-main rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between space-x-4 mb-1 text-[11px] font-medium opacity-75 border-b border-white/10 pb-1">
                    <span>{msg.sender === 'user' ? 'You' : 'AniVerse AI'}</span>
                    <span className="flex items-center space-x-1">
                      {msg.isStreaming && <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping mr-1" />}
                      <span>{msg.timestamp}</span>
                    </span>
                  </div>

                  {msg.sender === 'assistant' && !msg.isError ? (
                    msg.content === "Finding anime for you..." ? (
                      <div className="flex items-center space-x-2 text-brand-cyan italic py-1">
                        <Loader2 size={15} className="animate-spin text-brand-violet" />
                        <span>Finding anime for you...</span>
                      </div>
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-brand-cyan prose-a:text-brand-violet">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )
                  ) : (
                    <div>{msg.content}</div>
                  )}

                  {msg.isError && msg.queryToRetry && (
                    <button
                      onClick={() => handleRetry(msg.queryToRetry)}
                      className="mt-3 inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold border border-red-500/40 transition-colors"
                    >
                      <RefreshCw size={13} />
                      <span>Retry</span>
                    </button>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full bg-surface-700 border border-surface-border flex items-center justify-center text-appText-muted">
                    <User size={14} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 pl-10"
            >
              <p className="text-xs font-semibold text-appText-dim mb-3 flex items-center space-x-1.5">
                <Sparkles size={13} className="text-brand-cyan" />
                <span>Suggested prompts to get started:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {PROMPT_SUGGESTIONS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="px-3 py-1.5 rounded-xl bg-surface-900/90 hover:bg-surface-800 border border-surface-border hover:border-brand-violet/50 text-xs text-appText-muted hover:text-appText-main transition-all shadow-sm"
                  >
                    "{chip}"
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-surface-border/40">
          <div className="relative flex items-center bg-surface-900/90 border border-surface-border focus-within:border-brand-violet/60 focus-within:ring-1 focus-within:ring-brand-violet/60 rounded-2xl px-4 py-3 shadow-lg transition-all">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={isLoading ? "AniVerse is generating recommendations..." : "Describe what kind of anime you want to watch..."}
              className="w-full bg-transparent text-sm text-appText-main placeholder-appText-dim focus:outline-none pr-12 disabled:opacity-50"
            />

            {isLoading ? (
              <button
                onClick={handleStop}
                className="absolute right-2.5 p-2.5 rounded-xl bg-surface-800 hover:bg-red-500/20 text-red-400 border border-surface-border hover:border-red-500/40 transition-all"
                title="Stop generation"
              >
                <StopCircle size={16} />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim()}
                className={`absolute right-2.5 p-2.5 rounded-xl transition-all ${
                  inputValue.trim()
                    ? 'bg-purple-cyan-gradient text-white shadow-glow-button hover:scale-105'
                    : 'bg-surface-800 text-appText-dim cursor-not-allowed'
                }`}
                title="Send Message"
              >
                <Send size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-2 mt-2 text-[11px] text-appText-dim">
            <span>Talk naturally about genres, tropes, themes, or similar anime</span>
            <span className="hidden sm:inline-flex items-center space-x-1">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-800 border border-surface-border text-[10px]">Enter ↵</kbd>
              <span>to send</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
