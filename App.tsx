
import React, { useState, useCallback, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  MessageSquareHeart, 
  Trophy, 
  Settings,
  Bell,
  Cloud,
  Camera,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import { Student, TalkRecord, DormInspection, CounselorInfo, ViewType, TagType, StudentEvent, HonorRecord, StoryRecord } from './types';
import WelcomeView from './components/WelcomeView';
import StudentView from './components/StudentView';
import DormitoryView from './components/DormitoryView';
import TalksView from './components/TalksView';
import DevelopmentView from './components/DevelopmentView';
import Modal from './components/Modal';

const MOCK_STUDENTS: Student[] = [
  { 
    id: '1', name: '张三', gender: '男', department: '信息工程学院', grade: '2021级', major: '计算机科学与技术', className: '计科2101', studentId: '20210001', 
    idCard: '110101200301011234', address: '北京市朝阳区某街道101号', origin: '北京市', 
    birthday: '2003-01-01', phone: '13800000001', fatherName: '张大三', fatherPhone: '13900000001',
    motherName: '李美兰', motherPhone: '13900000002', dormId: '南区-101', tags: ['学业预警'],
    events: [{ id: 'e1', type: '荣誉奖励', title: '数学竞赛一等奖', date: '2023-09-15', detail: '表现优异' }]
  },
  { 
    id: '2', name: '李华', gender: '女', department: '商学院', grade: '2022级', major: '会计学', className: '会计2202', studentId: '20210002', 
    idCard: '110101200302021234', address: '上海市浦东新区', origin: '上海市', 
    birthday: '2003-02-02', phone: '13800000002', fatherName: '李父', fatherPhone: '13900000003',
    motherName: '王母', motherPhone: '13900000004', dormId: '北区-202', tags: ['党员'],
    events: []
  }
];

interface ToastState {
  message: string;
  type: 'success' | 'error';
  id: number;
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('welcome');
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [talks, setTalks] = useState<TalkRecord[]>([]);
  const [inspections, setInspections] = useState<DormInspection[]>([]);
  const [honors, setHonors] = useState<HonorRecord[]>([
    { id: 'h1', title: '全国数学建模', level: '一等奖', studentId: '1', studentName: '张三', date: '2023-09' }
  ]);
  const [stories, setStories] = useState<StoryRecord[]>([
    { id: 's1', title: '支教岁月', author: '陈老师', tags: ['公益'], img: 'https://picsum.photos/id/101/400/300', summary: '在那座大山深处...' }
  ]);

  const [counselor, setCounselor] = useState<CounselorInfo>({
    name: '陈老师',
    title: '计算机学院辅导员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    themeColor: 'blue'
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    setIsSyncing(true);
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, [students, talks, inspections, honors, stories, counselor]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const handleAddEvent = (studentId: string, event: Omit<StudentEvent, 'id'>) => {
    const newEvent = { ...event, id: `e${Date.now()}` };
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, events: [newEvent, ...s.events] } : s));
    showToast('大事记已更新');
  };

  const handleUpdateStudentTags = (studentId: string, tags: TagType[]) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, tags } : s));
  };

  const handleDeleteStudent = (id: string) => {
    // 级联删除：学生 + 谈心记录 + 荣誉记录
    setStudents(prev => prev.filter(s => s.id !== id));
    setTalks(prev => prev.filter(t => t.studentId !== id));
    setHonors(prev => prev.filter(h => h.studentId !== id));
    showToast('学生档案及其所有关联记录已彻底删除', 'success');
  };

  const handleAddTalk = (record: Omit<TalkRecord, 'id'>) => {
    setTalks(prev => [{ ...record, id: `t${Date.now()}` }, ...prev]);
    showToast('谈心记录已存档');
  };

  const handleUpdateInspection = (data: Omit<DormInspection, 'id'>) => {
    setInspections(prev => [{ ...data, id: `i${Date.now()}` }, ...prev]);
    showToast('查寝结果已更新');
  };

  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const avatarFile = fd.get('avatar') as File;
    
    const updated = {
      name: fd.get('name') as string,
      title: fd.get('title') as string,
      avatar: counselor.avatar,
      themeColor: counselor.themeColor
    };

    if (avatarFile && avatarFile.size > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCounselor({ ...updated, avatar: reader.result as string });
        showToast('个人资料已更新');
      };
      reader.readAsDataURL(avatarFile);
    } else {
      setCounselor(updated);
      showToast('个人资料已更新');
    }
    setIsProfileModalOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Toast 容器 */}
      <div className="fixed top-6 right-6 z-[200] space-y-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border pointer-events-auto animate-in slide-in-from-right duration-300 ${
              toast.type === 'success' 
              ? 'bg-emerald-600 text-white border-emerald-500' 
              : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-bold tracking-tight">{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-2 hover:opacity-70 transition-opacity">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <LayoutDashboard size={22} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">辅导员智汇</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'welcome', label: '欢迎概览', icon: LayoutDashboard },
            { id: 'students', label: '学生管理', icon: Users },
            { id: 'dormitory', label: '宿舍全景', icon: Home },
            { id: 'talks', label: '谈心谈话', icon: MessageSquareHeart },
            { id: 'development', label: '发展记录', icon: Trophy },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeView === item.id 
                ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <item.icon size={20} className={activeView === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isSyncing ? '正在云端同步' : '云端同步正常'}
            </span>
          </div>
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition-all flex items-center gap-3 group"
          >
            <img src={counselor.avatar} alt="avatar" className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-md" />
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">{counselor.name}</p>
              <p className="text-[10px] text-slate-400 font-medium truncate w-24">{counselor.title}</p>
            </div>
            <Settings size={16} className="ml-auto text-slate-300 group-hover:text-blue-400" />
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <h2 className="text-lg font-semibold text-slate-800 tracking-tight">管理后台</h2>
             <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-black rounded-lg border border-slate-200">SaaS EDITION</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100">
              <Cloud size={14} /> 跨设备共享中
            </div>
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 relative">
              <Bell size={20} /><span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 font-bold transition-colors">退出</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeView === 'welcome' && <WelcomeView counselor={counselor} students={students} talks={talks} onNavigate={setActiveView} />}
          {activeView === 'students' && (
            <StudentView 
              students={students} setStudents={setStudents}
              onUpdateTags={handleUpdateStudentTags} 
              onAddEvent={handleAddEvent}
              onDeleteStudent={handleDeleteStudent}
              onStartTalk={(s) => setActiveView('talks')} 
              showToast={showToast} 
            />
          )}
          {activeView === 'dormitory' && (
            <DormitoryView students={students} inspections={inspections} onUpdateInspection={handleUpdateInspection} />
          )}
          {activeView === 'talks' && (
            <TalksView students={students} talks={talks} onAddTalk={handleAddTalk} />
          )}
          {activeView === 'development' && (
            <DevelopmentView 
              honors={honors} setHonors={setHonors}
              stories={stories} setStories={setStories}
              students={students}
              onAddStudentEvent={handleAddEvent}
            />
          )}
        </div>
      </main>

      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="编辑个人资料">
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
             <div className="relative group cursor-pointer">
                <img src={counselor.avatar} className="w-24 h-24 rounded-3xl object-cover border-4 border-slate-50 shadow-xl" alt="counselor avatar" />
                <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <Camera className="text-white" size={24} />
                </div>
                <input type="file" name="avatar" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">点击图片更换头像</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">姓名</label>
              <input name="name" required defaultValue={counselor.name} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">职位/部门</label>
              <input name="title" required defaultValue={counselor.title} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
            <Check size={18} /> 保存修改
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default App;
