import type { Task } from "../models/Task";
import { storyService } from "./storyService";

const STORAGE_KEY = "manage-me-tasks";

function readTasks(): Task[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data) as Task[];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export const taskService = {
  getAll(): Task[] {
    return readTasks();
  },

  getByStory(storyId: string): Task[] {
    return readTasks().filter((task) => task.storyId === storyId);
  },

  getById(id: string): Task | undefined {
    return readTasks().find((task) => task.id === id);
  },

  create(task: Task): void {
    const tasks = readTasks();
    tasks.push(task);
    saveTasks(tasks);

    storyService.updateStatusBasedOnTasks(task.storyId);
  },

  update(updatedTask: Task): void {
    const taskToSave = { ...updatedTask };

    if (taskToSave.ownerId && taskToSave.status === "todo") {
      taskToSave.status = "doing";
      taskToSave.startedAt = new Date().toISOString();
    }

    if (taskToSave.status === "done" && !taskToSave.finishedAt) {
      taskToSave.finishedAt = new Date().toISOString();
    }

    const tasks = readTasks().map((task) =>
      task.id === taskToSave.id ? taskToSave : task
    );

    saveTasks(tasks);
    storyService.updateStatusBasedOnTasks(taskToSave.storyId);
  },

  delete(id: string): void {
    const existingTask = this.getById(id);
    const tasks = readTasks().filter((task) => task.id !== id);

    saveTasks(tasks);

    if (existingTask) {
      storyService.updateStatusBasedOnTasks(existingTask.storyId);
    }
  },
};