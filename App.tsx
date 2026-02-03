import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight,
  Clock 
} from 'lucide-react';
import { Button } from './components/Button';
import { Input, TextArea } from './components/Input';
import { Select } from './components/Select';
import { Badge } from './components/Badge';
import { Modal } from './components/Modal';
import { Drawer } from './components/Drawer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Task, TaskStatus, FilterState } from './types';

// Predefined JobHandlers
const HANDLER_OPTIONS = [
  { value: '', label: '请选择 JobHandler' },
  { value: 'dataSyncJob', label: 'dataSyncJob (数据同步)' },
  { value: 'dailyBackupJob', label: 'dailyBackupJob (每日备份)' },
  { value: 'emailNotifyJob', label: 'emailNotifyJob (邮件通知)' },
  { value: 'cleanTempJob', label: 'cleanTempJob (清理临时文件)' },
  { value: 'reportGenJob', label: 'reportGenJob (生成报表)' },
];

// Mock Data
const MOCK_TASKS: Task[] = Array.from({ length: 25 }).map((_, i) => {
  const handlerOption = HANDLER_OPTIONS[(i % 5) + 1]; // Cycle through valid options
  return {
    id: `100${i + 1}`,
    jobHandler: handlerOption.value,
    description: `自动执行${handlerOption.label.split('(')[1].replace(')', '')}的相关业务逻辑，确保系统数据一致性。`,
    cron: `0 0/${(i % 5) + 5} * * * ?`,
    createTime: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
    status: i % 3 === 0 ? TaskStatus.STOPPED : TaskStatus.RUNNING,
  };
});

function App() {
  // --- State ---
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [filterState, setFilterState] = useState<FilterState>({
    jobHandler: '',
    dateStart: '',
    dateEnd: '',
    status: 'ALL',
  });
  
  // This state holds the 'active' filters applied by clicking Search
  const [activeFilters, setActiveFilters] = useState<FilterState>(filterState);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
  });

  // Drawer & Edit State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- Helpers ---
  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Logic ---
  const handleQuery = () => {
    setActiveFilters(filterState);
    setPagination(p => ({ ...p, currentPage: 1 }));
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchHandler = task.jobHandler.toLowerCase().includes(activeFilters.jobHandler.toLowerCase());
      const matchStatus = activeFilters.status === 'ALL' || task.status === activeFilters.status;
      
      let matchDate = true;
      const taskDate = task.createTime.split(' ')[0]; // Simple YYYY-MM-DD compare
      if (activeFilters.dateStart && taskDate < activeFilters.dateStart) matchDate = false;
      if (activeFilters.dateEnd && taskDate > activeFilters.dateEnd) matchDate = false;

      return matchHandler && matchStatus && matchDate;
    });
  }, [tasks, activeFilters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredTasks.length / pagination.pageSize);
  const paginatedTasks = filteredTasks.slice(
    (pagination.currentPage - 1) * pagination.pageSize,
    pagination.currentPage * pagination.pageSize
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination(p => ({ ...p, currentPage: newPage }));
    }
  };

  // CRUD Operations
  const handleEdit = (task: Task) => {
    setEditingTask({ ...task });
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditingTask({
      jobHandler: '',
      description: '',
      cron: '',
      status: TaskStatus.STOPPED
    });
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  const saveTask = () => {
    const errors: Record<string, string> = {};
    if (!editingTask.jobHandler?.trim()) errors.jobHandler = "请选择 JobHandler";
    if (!editingTask.description?.trim()) errors.description = "请输入任务描述";
    if (!editingTask.cron?.trim()) errors.cron = "请输入 Cron 表达式";

    // Simple cron validation regex (very basic)
    const cronRegex = /(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7})/;
    if (editingTask.cron && !cronRegex.test(editingTask.cron)) {
       errors.cron = "Cron 表达式格式不正确";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingTask.id) {
      // Update
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...editingTask } as Task : t));
      showToast('success', '任务更新成功');
    } else {
      // Create
      const newTask: Task = {
        ...(editingTask as Task),
        id: Math.floor(Math.random() * 10000).toString(),
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: TaskStatus.STOPPED,
      };
      setTasks(prev => [newTask, ...prev]);
      showToast('success', '任务创建成功');
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setTasks(prev => prev.filter(t => t.id !== deleteId));
      showToast('success', '任务删除成功');
      setDeleteId(null);
    }
  };

  const toggleStatus = (task: Task) => {
    const newStatus = task.status === TaskStatus.RUNNING ? TaskStatus.STOPPED : TaskStatus.RUNNING;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    showToast('success', `任务${newStatus === TaskStatus.RUNNING ? '已启动' : '已停止'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 pb-20">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-slate-900">定时任务</h1>
          </div>
          <div className="text-sm text-slate-500">
            系统状态：<span className="text-emerald-600 font-medium">运行正常</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Search & Actions Bar */}
        <div className="mb-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
            <Input 
              label="JobHandler" 
              placeholder="例如：dataSync" 
              value={filterState.jobHandler}
              onChange={(e) => setFilterState({...filterState, jobHandler: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-2">
               <Input 
                  type="date" 
                  label="开始日期" 
                  value={filterState.dateStart}
                  onChange={(e) => setFilterState({...filterState, dateStart: e.target.value})}
                />
               <Input 
                  type="date" 
                  label="结束日期" 
                  value={filterState.dateEnd}
                  onChange={(e) => setFilterState({...filterState, dateEnd: e.target.value})}
                />
            </div>
            <Select 
              label="状态"
              options={[
                { value: 'ALL', label: '全部状态' },
                { value: TaskStatus.RUNNING, label: '运行中' },
                { value: TaskStatus.STOPPED, label: '已停止' },
              ]}
              value={filterState.status}
              onChange={(e) => setFilterState({...filterState, status: e.target.value as any})}
            />
            <div className="flex gap-2">
              <Button onClick={handleQuery} className="flex-1" icon={<Search className="h-4 w-4" />}>
                查询
              </Button>
              <Button onClick={handleAdd} variant="secondary" className="flex-1" icon={<Plus className="h-4 w-4" />}>
                新增任务
              </Button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">任务 ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">JobHandler</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">任务描述</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Cron 表达式</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">创建时间</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">状态</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-8 w-8 mb-2 text-slate-300" />
                        <p>未找到符合条件的任务。</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">#{task.id}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700 font-mono bg-slate-50/50">{task.jobHandler}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={task.description}>{task.description}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 font-mono">{task.cron}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{task.createTime}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <Badge status={task.status} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => toggleStatus(task)}
                            className={`rounded p-1.5 transition-colors ${task.status === TaskStatus.RUNNING ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            title={task.status === TaskStatus.RUNNING ? "停止" : "启动"}
                          >
                            {task.status === TaskStatus.RUNNING ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                          <button 
                            onClick={() => handleEdit(task)}
                            className="rounded p-1.5 text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteId(task.id)}
                            className="rounded p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-slate-700">
                    显示第 <span className="font-medium">{Math.min(filteredTasks.length, (pagination.currentPage - 1) * pagination.pageSize + 1)}</span> 到 <span className="font-medium">{Math.min(filteredTasks.length, pagination.currentPage * pagination.pageSize)}</span> 条，共 <span className="font-medium">{filteredTasks.length}</span> 条
                  </p>
                  <select 
                    className="block rounded-md border-slate-300 py-1 pl-2 pr-8 text-xs focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    value={pagination.pageSize}
                    onChange={(e) => setPagination({currentPage: 1, pageSize: Number(e.target.value)})}
                  >
                    <option value={5}>5 条/页</option>
                    <option value={10}>10 条/页</option>
                    <option value={20}>20 条/页</option>
                    <option value={50}>50 条/页</option>
                  </select>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                      // Logic to show a window of pages around current
                      let pageNum = idx + 1;
                      if (totalPages > 5 && pagination.currentPage > 3) {
                         pageNum = pagination.currentPage - 3 + idx;
                         if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-slate-300 focus:z-20 focus:outline-offset-0 ${
                            pagination.currentPage === pageNum 
                              ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' 
                              : 'text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === totalPages || totalPages === 0}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Drawer for Add/Edit */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingTask.id ? "编辑任务" : "新增任务"}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDrawerOpen(false)}>取消</Button>
            <Button onClick={saveTask}>保存</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <Select 
            label="JobHandler" 
            options={HANDLER_OPTIONS}
            value={editingTask.jobHandler || ''}
            onChange={(e) => setEditingTask({...editingTask, jobHandler: e.target.value})}
            error={formErrors.jobHandler}
          />
          <TextArea 
            label="任务描述" 
            placeholder="描述该任务的功能..."
            rows={4}
            value={editingTask.description || ''}
            onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
            error={formErrors.description}
          />
          <div>
            <Input 
              label="Cron 表达式" 
              placeholder="例如：0 0 12 * * ?"
              value={editingTask.cron || ''}
              onChange={(e) => setEditingTask({...editingTask, cron: e.target.value})}
              error={formErrors.cron}
            />
          </div>
        </div>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="删除任务"
        message="确认要删除该任务吗？此操作不可撤销，且定时任务将立即停止。"
      />

    </div>
  );
}

export default App;