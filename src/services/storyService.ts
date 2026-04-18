import type { Story } from "../models/Story";
import { taskService } from "./taskService";

const STORAGE_KEY = "manage-me-stories";

function readStories(): Story[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data) as Story[];
  } catch {
    return [];
  }
}

function saveStories(stories: Story[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}

export const storyService = {
  getAll(): Story[] {
    return readStories();
  },

  getByProject(projectId: string): Story[] {
    return readStories().filter((story) => story.projectId === projectId);
  },

  getById(id: string): Story | undefined {
    return readStories().find((story) => story.id === id);
  },

  create(story: Story): void {
    const stories = readStories();
    stories.push(story);
    saveStories(stories);
  },

  update(updatedStory: Story): void {
    const stories = readStories().map((story) =>
      story.id === updatedStory.id ? updatedStory : story
    );
    saveStories(stories);
  },

  delete(id: string): void {
    const stories = readStories().filter((story) => story.id !== id);
    saveStories(stories);
  },

  updateStatusBasedOnTasks(storyId: string): void {
    const tasks = taskService.getByStory(storyId);
    const currentStory = this.getById(storyId);

    if (!currentStory) {
      return;
    }

    let newStatus = currentStory.status;

    if (tasks.length > 0 && tasks.every((task) => task.status === "done")) {
      newStatus = "done";
    } else if (tasks.some((task) => task.status === "doing")) {
      newStatus = "doing";
    } else {
      newStatus = "todo";
    }

    const stories = readStories().map((story) =>
      story.id === storyId ? { ...story, status: newStatus } : story
    );

    saveStories(stories);
  },
};