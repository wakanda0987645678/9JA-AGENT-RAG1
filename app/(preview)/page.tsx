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
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpName, setSignUpName] = useState("");
  const [signingUp, setSigningUp] = useState(false);
  const [signUpError, setSignUpError] = useState("");
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
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
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
    <div className={cn(
      "flex h-screen font-[Helvetica,Arial,sans-serif]",
      darkMode ? "bg-gray-950" : "bg-gray-50"
    )}>
      {/* Enhanced Sign In/Sign Up Modal */}
      {(showSignIn || showSignUp) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-all">
          <div className={cn(
            "bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn border border-gray-200 dark:border-gray-700",
          )}>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => { setShowSignIn(false); setShowSignUp(false); }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6 text-center">
              <Image src="/NOUN-logo.png" alt="NOUN Logo" width={40} height={40} className="mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{!showSignUp ? "Sign In" : "Sign Up"}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{!showSignUp ? "Welcome back! Please sign in to continue." : "Create your account to get started."}</p>
            </div>
            {!showSignUp ? (
              <>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSigningIn(true);
                    setSignInError("");
                    try {
                      const res = await fetch("/api/profile", {
                        method: "GET",
                        headers: { "x-user-email": signInEmail },
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setUserData(data);
                        setShowSignIn(false);
                      } else {
                        setSignInError("User not found or invalid email.");
                      }
                    } catch (err) {
                      setSignInError("Sign in failed. Try again.");
                    } finally {
                      setSigningIn(false);
                    }
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
                    <Input
                      id="email"
                      type="email"
                      value={signInEmail}
                      onChange={e => setSignInEmail(e.target.value)}
                      required
                      autoFocus
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00D084]"
                      placeholder="Enter your email"
                      disabled={signingIn}
                    />
                  </div>
                  {signInError && (
                    <p className="text-xs text-red-500 text-center">{signInError}</p>
                  )}
                  <div className="flex flex-col space-y-2 mt-2">
                    <Button type="submit" disabled={signingIn || !signInEmail} className="bg-[#00D084] text-white w-full rounded-lg">
                      {signingIn ? "Signing In..." : "Sign In"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowSignIn(false)} className="w-full rounded-lg">
                      Cancel
                    </Button>
                  </div>
                  {signInError && (
                    <div className="flex flex-col items-center mt-3">
                      <Button type="button" variant="secondary" onClick={() => { setShowSignUp(true); setShowSignIn(false); setSignUpName(""); setSignUpError(""); }} className="w-full rounded-lg">
                        Sign Up Instead
                      </Button>
                    </div>
                  )}
                </form>
                <div className="my-6 flex items-center">
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
                  <span className="mx-3 text-xs text-gray-400">or</span>
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="flex flex-col space-y-2">
                  <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2 rounded-lg" disabled>
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35 11.1h-9.17v2.98h5.24c-.23 1.22-1.39 3.59-5.24 3.59-3.15 0-5.72-2.61-5.72-5.83s2.57-5.83 5.72-5.83c1.8 0 3.01.77 3.7 1.43l2.53-2.46C16.13 3.99 14.3 3 12 3 6.48 3 2 7.48 2 13s4.48 10 10 10c5.52 0 10-4.48 10-10 0-.68-.07-1.34-.2-1.9z"/><path fill="#34A853" d="M3.88 7.36l2.53 1.86C7.41 8.13 9.52 7 12 7c2.48 0 4.59 1.13 5.59 2.22l2.53-1.86C18.13 5.99 15.3 5 12 5c-3.3 0-6.13.99-8.12 2.36z"/><path fill="#FBBC05" d="M12 21c-2.48 0-4.59-1.13-5.59-2.22l-2.53 1.86C5.87 20.01 8.7 21 12 21c3.3 0 6.13-.99 8.12-2.36l-2.53-1.86C16.59 19.87 14.48 21 12 21z"/><path fill="#EA4335" d="M21.35 11.1h-9.17v2.98h5.24c-.23 1.22-1.39 3.59-5.24 3.59-3.15 0-5.72-2.61-5.72-5.83s2.57-5.83 5.72-5.83c1.8 0 3.01.77 3.7 1.43l2.53-2.46C16.13 3.99 14.3 3 12 3 6.48 3 2 7.48 2 13s4.48 10 10 10c5.52 0 10-4.48 10-10 0-.68-.07-1.34-.2-1.9z"/></svg>
                    Continue with Google
                  </Button>
                  <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2 rounded-lg" disabled>
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#1877F2" d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"/></svg>
                    Continue with Facebook
                  </Button>
                </div>
              </>
            ) : (
              <>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSigningUp(true);
                    setSignUpError("");
                    try {
                      // Call sign-up API
                      const res = await fetch("/api/admin/users", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: signInEmail, name: signUpName, isAdmin: false, totalTokensUsed: 0 }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setUserData(data);
                        setShowSignUp(false);
                        setShowSignIn(false);
                      } else {
                        let errorMsg = "Sign up failed. Try again.";
                        try {
                          const errorData = await res.json();
                          if (errorData?.error?.toLowerCase().includes("unique") || errorData?.error?.toLowerCase().includes("duplicate")) {
                            errorMsg = "Email already registered. Please sign in instead.";
                          }
                        } catch {}
                        setSignUpError(errorMsg);
                      }
                    } catch (err) {
                      setSignUpError("Sign up failed. Try again.");
                    } finally {
                      setSigningUp(false);
                    }
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signUpName}
                      onChange={e => setSignUpName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00D084]"
                      placeholder="Enter your name"
                      disabled={signingUp}
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signInEmail}
                      disabled
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
                    />
                  </div>
                  {signUpError && <p className="text-xs text-red-500 text-center">{signUpError}</p>}
                  {signUpError && signUpError.includes("Email already registered") && (
                    <div className="flex flex-col items-center mt-3">
                      <Button type="button" variant="secondary" onClick={() => { setShowSignUp(false); setShowSignIn(true); setSignInError(""); }} className="w-full rounded-lg">
                        Sign In Instead
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-col space-y-2 mt-2">
                    <Button type="submit" disabled={signingUp || !signUpName} className="bg-[#00D084] text-white w-full rounded-lg">
                      {signingUp ? "Signing Up..." : "Sign Up"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowSignUp(false); setShowSignIn(true); }} className="w-full rounded-lg">
                      Back
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className={cn(
            "fixed inset-0 z-40 lg:hidden",
            darkMode ? "bg-black/80" : "bg-black/50"
          )}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 sm:w-72 border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-lg lg:shadow-none",
          darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
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
              className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
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
        </div> {/* End Sidebar Header */}

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
            onClick={() => setShowSignIn(true)}
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
      </div> {/* End Sidebar */}

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0",
        darkMode ? "bg-gray-950" : "bg-white"
      )}>
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
                  className={cn(
                    "pr-10 sm:pr-12 h-9 sm:h-10 border-gray-300 focus:border-blue-500 bg-white text-sm text-gray-900 placeholder:text-gray-400",
                    darkMode && "bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-blue-400"
                  )}
                />
                <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim()}
                    className="h-5 w-5 sm:h-6 sm:w-6 bg-[#00D084] hover:bg-[#00D084] disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white dark:text-white"
                  >
                    <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white dark:text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div> {/* End Main Content */}
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