"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Shield,
  Search,
  Eye,
  FileCode,
  Lock,
} from "lucide-react";
import { getStoredState } from "@/lib/store";
import { AuditLog } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export default function AuditLogsPage() {
  const [state, setState] = useState(getStoredState());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    const handleState = () => setState(getStoredState());
    window.addEventListener("hcm_state_changed", handleState);
    return () => window.removeEventListener("hcm_state_changed", handleState);
  }, []);

  const currentUser = state.currentUser;
  const isAdmin = currentUser?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-xs text-rose-500">
        Access Denied: Only Admin users are authorized to inspect company audit logs.
      </div>
    );
  }

  const filteredLogs = state.auditLogs.filter((log) => {
    const q = searchTerm.toLowerCase();
    return (
      log.details.toLowerCase().includes(q) ||
      log.actor_email.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Audit Trail & Activity Log (M9)</span>
            <Badge variant="outline" className="text-[10px]">
              Tamper-Proof
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable log recording every create, update, approve, and finalize action with actor identity and state diffs.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search audit trail by actor, action, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Details</th>
                  <th className="p-3 text-right">State Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {log.actor_email}
                      </div>
                      <Badge variant="secondary" className="uppercase text-[9px]">
                        {log.actor_role}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          log.action === "finalize"
                            ? "success"
                            : log.action === "approve"
                            ? "success"
                            : log.action === "reject"
                            ? "destructive"
                            : "default"
                        }
                        className="uppercase text-[9px]"
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono uppercase text-[10px] text-slate-500">
                      {log.entity_type}
                    </td>
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                      {log.details}
                    </td>
                    <td className="p-3 text-right">
                      {(log.before_state || log.after_state) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-7 text-xs"
                        >
                          <FileCode className="h-3.5 w-3.5 mr-1" />
                          Diff JSON
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No audit transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* JSON State Diff Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit State Diff Inspector (JSON)"
        description={`Transaction: ${selectedLog?.action.toUpperCase()} on ${selectedLog?.entity_type} by ${selectedLog?.actor_email}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold font-sans text-slate-500 uppercase text-[10px]">
                Before State:
              </span>
              <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 border overflow-x-auto text-[11px] max-h-64 mt-1">
                {JSON.stringify(selectedLog?.before_state || "null", null, 2)}
              </pre>
            </div>
            <div>
              <span className="font-semibold font-sans text-slate-500 uppercase text-[10px]">
                After State:
              </span>
              <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 border overflow-x-auto text-[11px] max-h-64 mt-1 text-emerald-600 dark:text-emerald-400">
                {JSON.stringify(selectedLog?.after_state || "null", null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
