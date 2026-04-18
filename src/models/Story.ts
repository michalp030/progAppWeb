export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "doing" | "done";

export interface Story {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  projectId: string;
  createdAt: string;
  status: Status;
  ownerId: string;
}