"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Send,
  Calendar,
  User,
  Shield,
  CheckCircle,
} from "lucide-react";
import { getStoredState, createAnnouncementAsync } from "@/lib/store";
import { Announcement } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

export default function AnnouncementsPage() {
  const [state, setState] = useState(getStoredState());
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState<Announcement["target_role"]>("all");

  useEffect(() => {
    const handleState = () => setState(getStoredState());
    window.addEventListener("hcm_state_changed", handleState);
    return () => window.removeEventListener("hcm_state_changed", handleState);
  }, []);

  const currentUser = state.currentUser;
  const canPost = currentUser?.role === "admin" || currentUser?.role === "hr";

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await createAnnouncementAsync({
      title,
      content,
      target_role: targetRole,
    });

    setModalOpen(false);
    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Company Announcements (M9)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Broadcast official notices, holiday schedules, and policies to the entire company or specific roles.
          </p>
        </div>

        {canPost && (
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Post Announcement
          </Button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4 max-w-4xl">
        {state.announcements.map((ann) => (
          <Card key={ann.id} className="border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base text-slate-900 dark:text-white">
                    {ann.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                    <span>By {ann.author_name} ({ann.author_role.toUpperCase()})</span>
                    <span>•</span>
                    <span>{formatDate(ann.created_at)}</span>
                  </div>
                </div>
                <Badge variant="outline" className="uppercase text-[10px]">
                  Target: {ann.target_role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>
            </CardContent>
          </Card>
        ))}

        {state.announcements.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-xs text-slate-400">
              No announcements published yet.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Post Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post Company Announcement"
        description="Write notice to publish immediately to employee dashboards."
      >
        <form onSubmit={handlePostAnnouncement} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-600">Announcement Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Office Closed on Friday for Public Holiday"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600">Target Audience</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as any)}
              className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3"
            >
              <option value="all">Everyone (All Roles)</option>
              <option value="hr">HR Operations Only</option>
              <option value="employee">Employees Only</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600">Message Content</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed notice information..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <Button type="submit" className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white">
            Publish Announcement
          </Button>
        </form>
      </Modal>
    </div>
  );
}
