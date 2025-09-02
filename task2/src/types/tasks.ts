export interface Task {
  _id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  priority: number;
  createdAt: string;
}

export interface TasksResponse {
  items: Task[];
  nextSkip: number | null;
}