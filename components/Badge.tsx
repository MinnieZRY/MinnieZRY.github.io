import React from 'react';
import { TaskStatus } from '../types';

interface BadgeProps {
  status: TaskStatus;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const styles = {
    [TaskStatus.RUNNING]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    [TaskStatus.STOPPED]: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const labels = {
    [TaskStatus.RUNNING]: '运行中',
    [TaskStatus.STOPPED]: '已停止',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      <span className={`mr-1.5 h-2 w-2 rounded-full ${status === TaskStatus.RUNNING ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
      {labels[status]}
    </span>
  );
};