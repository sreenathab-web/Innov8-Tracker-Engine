import { WorkflowStatus } from './types';

export const WORKFLOW_STAGES: WorkflowStatus[] = [
  WorkflowStatus.New,
  WorkflowStatus.Reviewing,
  WorkflowStatus.Approved,
  WorkflowStatus.Claimed,
  WorkflowStatus.InProgress,
  WorkflowStatus.Testing,
  WorkflowStatus.Deployed,
  WorkflowStatus.Resolved,
];

export const STATUS_COLORS: Record<WorkflowStatus, { base: string, text: string }> = {
  [WorkflowStatus.New]: { base: "bg-sky-500/10", text: "text-sky-400" },
  [WorkflowStatus.Reviewing]: { base: "bg-amber-500/10", text: "text-amber-400" },
  [WorkflowStatus.Approved]: { base: "bg-emerald-500/10", text: "text-emerald-400" },
  [WorkflowStatus.Claimed]: { base: "bg-purple-500/10", text: "text-purple-400" },
  [WorkflowStatus.InProgress]: { base: "bg-indigo-500/10", text: "text-indigo-400" },
  [WorkflowStatus.Testing]: { base: "bg-pink-500/10", text: "text-pink-400" },
  [WorkflowStatus.Deployed]: { base: "bg-teal-500/10", text: "text-teal-400" },
  [WorkflowStatus.Resolved]: { base: "bg-slate-600/20", text: "text-slate-400" },
};