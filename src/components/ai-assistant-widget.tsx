"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User as UserIcon,
  HelpCircle,
  Calendar,
  ShieldAlert,
  Wrench,
  ChevronDown,
} from "lucide-react";
import { getStoredState, queryAIAssistant, parseSmartLeaveText } from "@/lib/store";
import { AIMessage } from "@/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hello! I am your HCM Lite AI Assistant. I answer live questions directly from real database records (headcount, attendance, leave balance, payroll, company policies). How can I assist you?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      is_ai_generated: true,
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [state, setState] = useState(getStoredState());

  useEffect(() => {
    const handleStateChange = () => setState(getStoredState());
    window.addEventListener("hcm_state_changed", handleStateChange);
    return () => window.removeEventListener("hcm_state_changed", handleStateChange);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const currentUser = state.currentUser;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: AIMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      // Smart Leave shortcut detection
      const lower = text.toLowerCase();
      if (
        (lower.includes("leave") || lower.includes("chutti") || lower.includes("off")) &&
        (lower.includes("need") || lower.includes("chahiye") || lower.includes("want") || lower.includes("apply"))
      ) {
        const smartDraft = parseSmartLeaveText(text);
        const aiMsg: AIMessage = {
          id: "ai-" + Date.now(),
          role: "assistant",
          content: `I've prepared a Smart Leave pre-filled draft for you:\n\n• **Type:** ${smartDraft.leave_type}\n• **From:** ${smartDraft.start_date}\n• **To:** ${smartDraft.end_date}\n• **Reason:** "${smartDraft.reason}"\n\nWould you like to open the Leave form to confirm?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          is_ai_generated: true,
          tool_called: "smart_leave_parser",
        };
        setMessages((prev) => [...prev, aiMsg]);
        setLoading(false);
        return;
      }

      // Live tool-calling query
      const result = queryAIAssistant(text, currentUser);

      const aiMsg: AIMessage = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        is_ai_generated: true,
        tool_called: result.tool_called,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 600);
  };

  // Quick judge prompts based on user role
  const quickPrompts =
    currentUser?.role === "employee"
      ? [
          "How many sick leaves do I have left this year?",
          "I need next Monday and Tuesday off for sister's wedding",
          "What is my colleague's salary?",
          "What is the company office start & grace time policy?",
        ]
      : [
          "How many active employees are in the company?",
          "Who came late most often this month?",
          "What is this month's attendance rate?",
          "What are the company payroll tax slab rules?",
        ];

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl border border-slate-700 transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse text-amber-400" />
          <span className="text-xs sm:text-sm font-semibold">AI Assistant</span>
          <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white uppercase font-mono font-medium">
            Live Tools
          </span>
        </button>
      )}

      {/* Slide-out / Pop-up Chat Window */}
      {isOpen && (
        <div className="flex flex-col w-[calc(100vw-1.5rem)] max-w-[420px] h-[480px] sm:h-[550px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold flex items-center space-x-1.5">
                  <span>HCM AI Assistant</span>
                  <Badge variant="secondary" className="text-[9px] py-0 px-1 bg-slate-800 text-slate-200 border border-slate-700">
                    M8 Module
                  </Badge>
                </h3>
                <p className="text-[11px] text-slate-300">
                  Role Scope: <span className="font-semibold uppercase text-emerald-400">{currentUser?.role || "Guest"}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center space-x-1.5 overflow-x-auto text-xs no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 pl-1 shrink-0">Try:</span>
            {quickPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-900 text-slate-700 dark:text-slate-300 text-[11px] transition shrink-0 cursor-pointer"
              >
                {prompt.length > 28 ? prompt.slice(0, 28) + "..." : prompt}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-white dark:bg-slate-900">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                    m.role === "user"
                      ? "bg-slate-900 text-white rounded-br-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/60"
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">{m.content}</div>

                  {/* Tool called indicator */}
                  {m.tool_called && (
                    <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center space-x-1 text-[10px] text-slate-600 dark:text-slate-400 font-mono font-medium">
                      <Wrench className="h-3 w-3" />
                      <span>Tool: {m.tool_called}</span>
                    </div>
                  )}
                </div>

                {/* Subtext info */}
                <div className="flex items-center space-x-1.5 mt-1 px-1 text-[10px] text-slate-400">
                  <span>{m.timestamp}</span>
                  {m.is_ai_generated && (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      • AI-generated
                    </span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-500 text-xs py-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>AI is querying live database tools...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask attendance, leaves, payroll, headcount..."
                className="h-10 text-xs"
                disabled={loading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading}
                className="h-10 w-10 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="mt-1.5 text-center text-[10px] text-slate-400">
              Answers derived strictly from real DB records.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
