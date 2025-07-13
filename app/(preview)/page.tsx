"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Send,
  User,
  Settings,
  Plus,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Code,
  FileText,
  Mail,
  Pen,
  Moon,
  Sun,
  Coins,
  BookOpen,
  Bot
} from "lucide-react";
import { Message } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown, { Options } from "react-markdown";
import React from "react";
import { LoadingIcon } from "@/components/icons";
import Image from "next/image";
interface UserData {
  id: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
}

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toolCall, setToolCall] = useState<string>();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Load user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');

    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSettingsClick = () => {
    window.location.href = '/profile';
  };

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      maxSteps: 4,
      onToolCall({ toolCall }) {
        setToolCall(toolCall.toolName);
      },
      onError: (error) => {
        toast.error("You've been rate limited, please try again later!");
      },
    });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const currentToolCall = useMemo(() => {
    const tools = messages?.slice(-1)[0]?.toolInvocations;
    if (tools && toolCall === tools[0].toolName) {
      return tools[0].toolName;
    } else {
      return undefined;
    }
  }, [toolCall, messages]);

  const awaitingResponse = useMemo(() => {
    if (
      isLoading &&
      currentToolCall === undefined &&
      messages.slice(-1)[0]?.role === "user"
    ) {
      return true;
    } else {
      return false;
    }
  }, [isLoading, currentToolCall, messages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e);
    }
  };

  // Add a function to set the input value from suggestions
  const setSuggestion = (text: string) => {
    handleInputChange({ target: { value: text } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-[Helvetica,Arial,sans-serif]">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-lg lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-12 sm:h-14 px-3 sm:px-4 bg-gray-100/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center">
              <Image
                src="/NOUN-logo.png"
                alt="NOUN Logo"
                width={32}
                height={32}
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">NOUN AI</h1>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden lg:flex h-6 w-6 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun className="w-3 h-3 sm:w-4 sm:h-4" /> : <Moon className="w-3 h-3 sm:w-4 sm:h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden h-6 w-6 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <Button
            onClick={() => {}}
            className="w-full justify-start bg-[#00D084] hover:bg-[#00D084] text-white h-8 sm:h-10 text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            New Chat
          </Button>
          <Button
            onClick={() => window.location.href = '/signin'}
            className="w-full justify-start mt-2 border border-[#00D084] text-[#00D084] bg-white hover:bg-[#00D084] hover:text-white h-8 sm:h-10 text-sm"
          >
            <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Sign In
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-1 sm:p-2">
            {[].length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-6 sm:py-8">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                <p className="text-xs sm:text-sm">No conversations yet</p>
                <p className="text-xs mt-1 hidden sm:block">Start a new chat to begin</p>
              </div>
            ) : (
              [].map((conversation, index) => (
                <div
                  key={index}
                  onClick={() => {}}
                  className={cn(
                    "flex items-center p-2 sm:p-3 rounded-lg cursor-pointer transition-colors mb-1",
                    false
                      ? "bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {'New conversation'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                      {'No messages'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4 mt-auto">
          <Button
            onClick={handleSettingsClick}
            className="w-full justify-start border border-[#00D084] text-[#00D084] bg-white hover:bg-[#00D084] hover:text-white h-8 sm:h-10 text-sm"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Profile
          </Button>
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Loading user data...</p>
          ) : userData ? (
            <div className="flex items-center space-x-2 sm:space-x-3 mt-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{userData.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Points: {userData.points}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Failed to load user data.</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-950">
        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center justify-between h-12 sm:h-14 px-3 sm:px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
            <Image
              src="/NOUN-logo.png"
              alt="NOUN Logo"
              width={30}
              height={30}
              className="block dark:hidden"
            />
            <Image
              src="/NOUN-logo.png"
              alt="NOUN Logo"
              width={30}
              height={30}
              className="hidden dark:block"
            />
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden">
          <div
            className="h-full overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6"
          >
            {[].length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Image
                      src="/NOUN-logo.png"
                      alt="NOUN Logo"
                      width={64}
                      height={64}
                      className="w-15 h-15 sm:w-16 sm:h-16 object-contain"
                    />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Welcome to NOUN AI
                    <Bot className="inline-block ml-2 w-6 h-6 text-[#00D084] align-middle" />
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
                    This platform is an AI assistant for NOUN students. You can get information about the school, course summaries, past questions, and more. What would you like to explore today?
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-4">
                    {[
                      { text: "Get course summary", icon: BookOpen },
                      { text: "Find past questions", icon: FileText },
                      { text: "School information", icon: HelpCircle },
                      { text: "Exam tips and advice", icon: Lightbulb }
                    ].map((suggestion, index) => {
                      const IconComponent = suggestion.icon;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSuggestion(suggestion.text)}
                          className="flex flex-col sm:flex-row items-center p-2 sm:p-4 text-center sm:text-left rounded-lg border border-[#00D084] hover:border-[#00D084] dark:border-[#00D084] dark:hover:border-[#00D084] hover:bg-[#00D084] hover:bg-opacity-10 dark:hover:bg-[#00D084] dark:hover:bg-opacity-10 transition-colors group"
                        >
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 mb-1 sm:mb-0 sm:mr-3 text-[#00D084] group-hover:text-[#00D084] flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white leading-tight">{suggestion.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              [].map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-2 sm:gap-4",
                    false ? 'justify-end' : 'justify-start'
                  )}
                >
                  {false && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs sm:text-sm">N</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-3xl px-3 sm:px-4 py-2 sm:py-3 rounded-2xl",
                      false
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                    )}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert text-xs sm:text-sm">
                      <ReactMarkdown
                        remarkPlugins={[]}
                        components={{
                          code: ({ node, inline, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <div>
                                {String(children).replace(/\n$/, '')}
                              </div>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {""}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {false && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </motion.div>
              ))
            )}
            {false && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 sm:gap-4"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs sm:text-sm">N</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                handleSubmit();
              }
            }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  disabled={false}
                  className="pr-10 sm:pr-12 h-9 sm:h-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-sm"
                />
                <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim()}
                    className="h-5 w-5 sm:h-6 sm:w-6 bg-[#00D084] hover:bg-[#00D084] disabled:bg-gray-300 dark:disabled:bg-gray-600"
                  >
                    <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const MessageBubble = ({ message, isLast }: { message: Message; isLast: boolean }) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start space-x-3 mb-6"
    >
      <div className="flex-shrink-0">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-gray-600 dark:bg-gray-700"
            : "bg-gradient-to-br from-blue-500 to-purple-600"
        )}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isUser ? (
            <p className="text-gray-900 dark:text-gray-100 mb-0 leading-relaxed">
              {message.content}
            </p>
          ) : (
            <div className="text-gray-900 dark:text-gray-100">
              <MemoizedReactMarkdown>
                {message.content}
              </MemoizedReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Loading = ({ tool }: { tool?: string }) => {
  const toolName =
    tool === "getInformation"
      ? "Searching"
      : tool === "addResource"
        ? "Adding resource"
        : "Thinking";

  return (
    <div className="flex items-center space-x-2">
      <div className="animate-spin">
        <LoadingIcon />
      </div>
      <span className="text-gray-600 dark:text-gray-400 text-sm">
        {toolName}...
      </span>
    </div>
  );
};

const MemoizedReactMarkdown: React.FC<Options> = React.memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className,
);