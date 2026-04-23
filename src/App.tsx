import { useState, useEffect } from 'react';
import { Trash2, CheckCircle2, Circle, Sparkles, Trash } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [allTags, setAllTags] = useState<string[]>(() => {
    const saved = localStorage.getItem('allTags');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  // Temporary states for search modal
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const [tempSelectedTag, setTempSelectedTag] = useState<string | null>(null);
  const [tempStatusFilter, setTempStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('allTags', JSON.stringify(allTags));
  }, [allTags]);

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const startEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setEditText(todo.text);
    setEditPriority(todo.priority);
    setEditTags([...todo.tags]);
  };

  const saveEdit = () => {
    if (!editingTodo) return;
    const text = editText.trim();
    if (!text) return;

    setTodos(todos.map(todo =>
      todo.id === editingTodo.id
        ? {
            ...todo,
            text,
            priority: editPriority,
            tags: editTags
          }
        : todo
    ));
    setEditingTodo(null);
  };

  const cancelEdit = () => {
    setEditingTodo(null);
  };



  const addTodo = () => {
    const text = inputValue.trim();
    if (!text) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now(),
      priority,
      tags,
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
    setPriority('medium');
    setTags([]);
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  // Filter todos based on search term, selected tag, and status
  const filteredTodos = todos.filter(todo => {
    const matchesSearch = searchTerm === '' || todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === null || todo.tags.includes(selectedTag);
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'pending' && !todo.completed) ||
      (statusFilter === 'completed' && todo.completed);
    return matchesSearch && matchesTag && matchesStatus;
  });

  // Calculate counts based on filtered todos
  const completedCount = filteredTodos.filter((t) => t.completed).length;
  const pendingCount = filteredTodos.length - completedCount;

  const clearCompleted = () => {
    setTodos(todos.filter((t) => !t.completed));
  };

  // Batch operations
  const toggleSelectTodo = (id: string) => {
    setSelectedTodos(prev =>
      prev.includes(id)
        ? prev.filter(todoId => todoId !== id)
        : [...prev, id]
    );
  };

  const selectAllTodos = () => {
    if (selectedTodos.length === filteredTodos.length) {
      setSelectedTodos([]);
    } else {
      setSelectedTodos(filteredTodos.map(todo => todo.id));
    }
  };

  const batchDelete = () => {
    if (selectedTodos.length === 0) return;
    setTodos(todos.filter(todo => !selectedTodos.includes(todo.id)));
    setSelectedTodos([]);
  };

  const batchComplete = () => {
    if (selectedTodos.length === 0) return;
    
    const completedTodos: string[] = [];
    const updatedTodos: string[] = [];
    
    const updatedTodosList = todos.map(todo => {
      if (selectedTodos.includes(todo.id)) {
        if (todo.completed) {
          completedTodos.push(todo.text);
          return todo;
        } else {
          updatedTodos.push(todo.text);
          return { ...todo, completed: true };
        }
      }
      return todo;
    });
    
    setTodos(updatedTodosList);
    setSelectedTodos([]);
    
    // Show notification
    if (completedTodos.length > 0 && updatedTodos.length > 0) {
      alert(`已更新 ${updatedTodos.length} 个任务为完成状态。\n${completedTodos.length} 个任务已经是完成状态，无需更新：\n${completedTodos.join('\n')}`);
    } else if (completedTodos.length > 0) {
      alert(`选中的 ${completedTodos.length} 个任务已经是完成状态，无需更新。`);
    } else if (updatedTodos.length > 0) {
      alert(`已成功更新 ${updatedTodos.length} 个任务为完成状态。`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-purple-100">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-purple-500" size={32} />
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              我的待办清单
            </h1>
            <Sparkles className="text-purple-500" size={32} />
          </div>
          <p className="text-gray-500">记录你的每一个重要任务</p>
          <p className="text-gray-400 text-sm mt-2">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
        </div>



        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-lg shadow-purple-100/50 p-4 mb-6">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="今天要做什么？"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-300 focus:outline-none transition-colors text-gray-700 placeholder-gray-400"
            />
            <div className="flex gap-3">
              <button
                onClick={addTodo}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-200 active:scale-95 flex items-center gap-2"
                disabled={!inputValue.trim()}
              >
                <span>➕ 添加任务</span>
              </button>
              <button
                onClick={() => {
                  setTempSearchTerm(searchTerm);
                  setTempSelectedTag(selectedTag);
                  setTempStatusFilter(statusFilter);
                  setShowSearchModal(true);
                }}
                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-gray-200 active:scale-95 flex items-center gap-2"
              >
                <span>🔍 搜索</span>
              </button>
            </div>
          </div>
          
          {/* Priority Selector */}
          <div className="flex gap-3 mb-4">
            <span className="text-sm font-medium text-gray-600 flex items-center">优先级:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPriority('high')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                高
              </button>
              <button
                onClick={() => setPriority('medium')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                中
              </button>
              <button
                onClick={() => setPriority('low')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${priority === 'low' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                低
              </button>
            </div>
          </div>
          
          {/* Tags Input */}
          <div className="flex gap-3">
            <span className="text-sm font-medium text-gray-600 flex items-center">标签:</span>
            <div className="flex-1 flex gap-2 flex-wrap">
              {/* All available tags */}
              {allTags.map((tag) => {
                // Check if any todo is using this tag
                const isTagUsed = todos.some(todo => todo.tags.includes(tag));
                
                return (
                  <div key={tag} className="relative group">
                    <button
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        tags.includes(tag) ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                    {!isTagUsed && (
                      <button
                        onClick={() => setAllTags(allTags.filter(t => t !== tag))}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gray-200 hover:bg-red-200 text-gray-600 hover:text-red-600 rounded-full text-xs flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                        title="删除标签"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
              
              {/* Add new tag */}
              <button
                onClick={() => {
                  const tag = prompt('请输入新标签名称:');
                  if (tag && tag.trim() && !allTags.includes(tag.trim())) {
                    setAllTags([...allTags, tag.trim()]);
                  }
                }}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 border border-dashed border-gray-300 hover:border-purple-300 flex items-center gap-1"
                title="添加标签"
              >
                <span>+</span>
                <span>添加</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats and Clear Button */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setStatusFilter('all')}
              className={`bg-white rounded-xl px-4 py-2 shadow-md shadow-purple-100/30 transition-all duration-200 ${statusFilter === 'all' ? 'ring-2 ring-purple-300' : ''}`}
            >
              <span className="text-gray-500 text-sm">全部</span>
              <span className="ml-2 text-blue-600 font-bold text-lg">
                {filteredTodos.length}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`bg-white rounded-xl px-4 py-2 shadow-md shadow-purple-100/30 transition-all duration-200 ${statusFilter === 'pending' ? 'ring-2 ring-purple-300' : ''}`}
            >
              <span className="text-gray-500 text-sm">待完成</span>
              <span className="ml-2 text-blue-600 font-bold text-lg">
                {pendingCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`bg-white rounded-xl px-4 py-2 shadow-md shadow-purple-100/30 transition-all duration-200 ${statusFilter === 'completed' ? 'ring-2 ring-purple-300' : ''}`}
            >
              <span className="text-gray-500 text-sm">已完成</span>
              <span className="ml-2 text-emerald-500 font-bold text-lg">
                {completedCount}
              </span>
            </button>
          </div>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-red-200"
            >
              <Trash size={16} />
              清空已完成
            </button>
          )}
        </div>

        {/* Current Filter Conditions */}
        {(searchTerm || selectedTag || statusFilter !== 'all') && (
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-100/50 p-4 mb-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {/* Keyword Filter */}
              {searchTerm && (
                <div className="bg-purple-50 text-purple-700 rounded-full px-3 py-1 flex items-center gap-2">
                  <span className="text-xs font-medium">关键词: {searchTerm}</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-purple-100 rounded-full transition-colors"
                    title="清除关键词"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {/* Tag Filter */}
              {selectedTag && (
                <div className="bg-purple-50 text-purple-700 rounded-full px-3 py-1 flex items-center gap-2">
                  <span className="text-xs font-medium">标签: {selectedTag}</span>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="w-4 h-4 flex items-center justify-center hover:bg-purple-100 rounded-full transition-colors"
                    title="清除标签"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {/* Status Filter */}
              {statusFilter !== 'all' && (
                <div className="bg-purple-50 text-purple-700 rounded-full px-3 py-1 flex items-center gap-2">
                  <span className="text-xs font-medium">状态: {statusFilter === 'pending' ? '待完成' : '已完成'}</span>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-purple-100 rounded-full transition-colors"
                    title="清除状态"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {/* Clear All Button */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTag(null);
                  setStatusFilter('all');
                }}
                className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                清除全部筛选
              </button>
            </div>
            
            {/* Result Info */}
            <div className="text-sm text-gray-500">
              共找到 {filteredTodos.length} 个匹配任务（共 {todos.length} 个总任务）
            </div>
          </div>
        )}

        {/* Todo List */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg shadow-purple-100/50">
              <div className="text-gray-300 mb-2">
                <CheckCircle2 size={48} className="mx-auto" />
              </div>
              <p className="text-gray-400">暂无待办事项</p>
              <p className="text-gray-300 text-sm mt-1">添加一个新任务开始吧</p>
            </div>
          ) : (
            <>
              {/* Batch Operations Bar */}
              {selectedTodos.length > 0 && (
                <div className="bg-white rounded-xl shadow-md shadow-purple-100/30 p-3 flex justify-between items-center">
                  <span className="text-sm text-gray-600">已选择 {selectedTodos.length} 个任务</span>
                  <div className="flex gap-2">
                    <button
                      onClick={batchComplete}
                      className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      标记完成
                    </button>
                    <button
                      onClick={batchDelete}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      批量删除
                    </button>
                  </div>
                </div>
              )}
              
              {/* Select All Checkbox */}
              <div className="bg-white rounded-xl shadow-md shadow-purple-100/30 p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTodos.length === filteredTodos.length && filteredTodos.length > 0}
                    onChange={selectAllTodos}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-600">全选</span>
                </div>
              </div>
              
              {/* Todo Items */}
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`group bg-white rounded-xl shadow-md shadow-purple-100/30 p-4 transition-all duration-200 hover:shadow-lg hover:shadow-purple-100/50 ${
                    todo.completed ? 'opacity-70' : ''
                  }`}
                >
                  {editingTodo && editingTodo.id === todo.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="flex-1 px-3 py-2 rounded-lg border-2 border-purple-300 focus:outline-none text-gray-700"
                        />
                      </div>
                      
                      {/* Edit Priority Selector */}
                      <div className="flex gap-3">
                        <span className="text-sm font-medium text-gray-600 flex items-center">优先级:</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditPriority('high')}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              editPriority === 'high' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            高
                          </button>
                          <button
                            onClick={() => setEditPriority('medium')}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              editPriority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            中
                          </button>
                          <button
                            onClick={() => setEditPriority('low')}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              editPriority === 'low' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            低
                          </button>
                        </div>
                      </div>
                      
                      {/* Edit Tags Input */}
                      <div className="flex gap-3">
                        <span className="text-sm font-medium text-gray-600 flex items-center">标签:</span>
                        <div className="flex-1 flex gap-2 flex-wrap">
                          {/* All available tags */}
                          {allTags.map((tag) => {
                            // Check if any todo is using this tag
                            const isTagUsed = todos.some(todo => todo.tags.includes(tag));
                            
                            return (
                              <div key={tag} className="relative group">
                                <button
                                  onClick={() => setEditTags(prev =>
                                    prev.includes(tag)
                                      ? prev.filter(t => t !== tag)
                                      : [...prev, tag]
                                  )}
                                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                    editTags.includes(tag) ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {tag}
                                </button>
                                {!isTagUsed && (
                                  <button
                                    onClick={() => setAllTags(allTags.filter(t => t !== tag))}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-gray-200 hover:bg-red-200 text-gray-600 hover:text-red-600 rounded-full text-xs flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                    title="删除标签"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          
                          {/* Add new tag */}
                          <button
                            onClick={() => {
                              const tag = prompt('请输入新标签名称:');
                              if (tag && tag.trim() && !allTags.includes(tag.trim())) {
                                setAllTags([...allTags, tag.trim()]);
                              }
                            }}
                            className="px-3 py-1 rounded-full text-xs font-medium transition-all bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 border border-dashed border-gray-300 hover:border-purple-300 flex items-center gap-1"
                            title="添加标签"
                          >
                            <span>+</span>
                            <span>添加</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Edit Actions */}
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTodos.includes(todo.id)}
                        onChange={() => toggleSelectTodo(todo.id)}
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                      />
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="flex-shrink-0 transition-transform duration-200 hover:scale-110 mt-1"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="text-emerald-500" size={24} />
                        ) : (
                          <Circle className="text-gray-300 hover:text-purple-400" size={24} />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-gray-700 transition-all duration-200 ${
                              todo.completed
                                ? 'line-through text-gray-400'
                                : ''
                            }`}
                          >
                            {todo.text}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              todo.priority === 'high' ? 'bg-red-100 text-red-600' :
                              todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-green-100 text-green-600'
                            }`}
                          >
                            {todo.priority === 'high' ? '高' :
                             todo.priority === 'medium' ? '中' : '低'}
                          </span>
                          {todo.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-purple-50 text-purple-700 rounded-full px-2 py-1"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => startEdit(todo)}
                          className="flex-shrink-0 p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="flex-shrink-0 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {filteredTodos.length > 0 && (
          <div className="text-center mt-6 text-gray-400 text-sm">
            共 {filteredTodos.length} 个任务
          </div>
        )}

        {/* Search Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">搜索任务</h3>
              <div className="space-y-4">
                {/* Search Input */}
                <div className="flex gap-3">
                  <span className="text-sm font-medium text-gray-600 flex items-center">关键词:</span>
                  <input
                    type="text"
                    value={tempSearchTerm}
                    onChange={(e) => setTempSearchTerm(e.target.value)}
                    placeholder="输入关键词"
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-300 focus:outline-none"
                  />
                </div>
                
                {/* Tag Filter */}
                <div className="flex gap-3">
                  <span className="text-sm font-medium text-gray-600 flex items-center">标签:</span>
                  <div className="flex-1 flex gap-2 flex-wrap">
                    <button
                      onClick={() => setTempSelectedTag(null)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        tempSelectedTag === null ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      全部
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setTempSelectedTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          tempSelectedTag === tag ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Status Filter */}
                <div className="flex gap-3">
                  <span className="text-sm font-medium text-gray-600 flex items-center">状态:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTempStatusFilter('all')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        tempStatusFilter === 'all' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      全部
                    </button>
                    <button
                      onClick={() => setTempStatusFilter('pending')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        tempStatusFilter === 'pending' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      待完成
                    </button>
                    <button
                      onClick={() => setTempStatusFilter('completed')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        tempStatusFilter === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      已完成
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setTempSearchTerm('');
                      setTempSelectedTag(null);
                      setTempStatusFilter('all');
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    重置
                  </button>
                  <button
                    onClick={() => {
                      setSearchTerm(tempSearchTerm);
                      setSelectedTag(tempSelectedTag);
                      setStatusFilter(tempStatusFilter);
                      setShowSearchModal(false);
                    }}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                  >
                    确定
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
