export enum TaskStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED'
}

export interface Task {
  id: string;
  jobHandler: string;
  description: string;
  cron: string;
  createTime: string; // ISO Date string
  status: TaskStatus;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface FilterState {
  jobHandler: string;
  dateStart: string;
  dateEnd: string;
  status: TaskStatus | 'ALL';
}