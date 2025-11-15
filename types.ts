
export enum WorkflowStatus {
  New = "New",
  Reviewing = "Reviewing",
  Approved = "Approved",
  Claimed = "Claimed",
  InProgress = "In-Progress",
  Testing = "Testing",
  Deployed = "Deployed / Completed",
  Resolved = "Resolved",
}

export interface Note {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface Idea {
  id: string;
  dateTime: string;
  employeeName: string;
  employeeEmail: string;
  managerEmail: string;
  department: string;
  context: string;
  appendix?: string;
  toolLinks?: string;
  attachments?: File[];
  status: WorkflowStatus;
  claimedBy?: string;
  notes?: Note[];
}

export interface User {
  name: string;
  email: string;
  password?: string; // Password should not be stored in client-side state long-term
}
