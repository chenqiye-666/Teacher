
import React, { useState, useMemo } from 'react';
import { Home, ClipboardList, CheckCircle2, AlertTriangle, XCircle, Info, History, MapPin, Grid, Layers, BookOpen, ChevronLeft, ArrowRight } from 'lucide-react';
import { Student, DormInspection, DormStatus } from '../types';
import Modal from './Modal';

interface DormitoryViewProps {
  students: Student[];
  inspections: DormInspection[];
  onUpdateInspection: (data: Omit<DormInspection, 'id'>) => void;
}

const DormitoryView: React.FC<DormitoryViewProps> = ({ students, inspections, onUpdateInspection }) => {
  const [selectedDorm, setSelectedDorm] = useState<string | null>(null);
  const [historyDormId, setHistoryDormId] = useState<string | null>(null);
  
  // 核心逻辑：增加一个“引导进入”状态
  const [isLanding, setIsLanding] = useState(true);
  const [filterGrade, setFilterGrade] = useState<string>('全部年级');
  const [filterMajor, setFilterMajor] = useState<string>('全部专业');

  const grades = useMemo(() => Array.from(new Set(students.map(s => s.grade))), [students]);
  const majors = useMemo(() => Array.from(new Set(students.map(s => s.major))), [students]);

  const dormGroups = useMemo(() => {
    const groups: Record<string, Student[]> = {};
    students.forEach(s => {
      if (s.dormId) {
        const matchesGrade = filterGrade === '全部年级' || s.grade === filterGrade;
        const matchesMajor = filterMajor === '全部专业' || s.major === filterMajor;
        if (matchesGrade && matchesMajor) {
          if (!groups[s.dormId]) groups[s.dormId] = [];
          groups[s.dormId].push(s);
        }
      }
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [students, filterGrade, filterMajor]);

  const getLatestInspection = (dormId: string) => inspections.find(i => i.dormId === dormId);
  const getDormHistory = (dormId: string) => inspections.filter(i => i.dormId === dormId);

  const statusConfig: Record<DormStatus, { color: string, bg: string, icon: any }> = {
    '优秀': { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
    '合格': { color: 'text-blue-600', bg: 'bg-blue-50', icon: Info },
    '整改': { color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle },
    '违纪': { color: 'text-rose-600', bg: 'bg-rose-50', icon: XCircle },
  };

  // 引导进入页 (Landing Gate)
  if (isLanding) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="text-center space-y-4 py-10">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl shadow-emerald-100">
            <Home size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">宿舍全景管理端口</h2>
          <p className="text-slate-400 font-medium">请选择您要进入管理的专业年级端口</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div 
            onClick={() => { setFilterGrade('全部年级'); setFilterMajor('全部专业'); setIsLanding(false); }}
            className="p-8 bg-white rounded-[3rem] border-2 border-slate-100 hover:border-emerald-500 cursor-pointer group transition-all flex flex-col items-center text-center shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all mb-4">
              <Grid size={24} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-1">全景视图</h4>
            <p className="text-xs text-slate-400 mb-6 font-medium italic">管理所有专业、年级、宿舍</p>
            <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
              进入管理 <ArrowRight size={14} />
            </div>
          </div>

          {grades.map(g => (
            <div 
              key={g}
              onClick={() => { setFilterGrade(g); setFilterMajor('全部专业'); setIsLanding(false); }}
              className="p-8 bg-white rounded-[3rem] border-2 border-slate-100 hover:border-blue-500 cursor-pointer group transition-all flex flex-col items-center text-center shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all mb-4">
                <Layers size={24} />
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-1">{g}</h4>
              <p className="text-xs text-slate-400 mb-6 font-medium italic">管理本年级所有专业宿舍</p>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                进入端口 <ArrowRight size={14} />
              </div>
            </div>
          ))}

          {majors.map(m => (
            <div 
              key={m}
              onClick={() => { setFilterGrade('全部年级'); setFilterMajor(m); setIsLanding(false); }}
              className="p-8 bg-white rounded-[3rem] border-2 border-slate-100 hover:border-indigo-500 cursor-pointer group transition-all flex flex-col items-center text-center shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all mb-4">
                <BookOpen size={24} />
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-1">{m}</h4>
              <p className="text-xs text-slate-400 mb-6 font-medium italic">管理本专业所有年级宿舍</p>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                进入端口 <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={() => setIsLanding(true)}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-black text-[10px] uppercase tracking-widest group"
        >
          <ChevronLeft size={16} /> 返回分类端口
        </button>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100">当前：{filterGrade} · {filterMajor}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dormGroups.map(([dormId, dormStudents]) => {
          const inspection = getLatestInspection(dormId);
          const status = inspection?.status || '合格';
          const config = statusConfig[status];

          return (
            <div key={dormId} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className={`p-5 flex items-center justify-between border-b border-slate-50`}>
                <h4 className="font-black text-slate-800 flex items-center gap-2"><MapPin size={16} className="text-blue-500" />{dormId}</h4>
                <button onClick={() => setHistoryDormId(dormId)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><History size={18} /></button>
              </div>
              <div className="p-5 flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {dormStudents.map(s => (
                    <div key={s.id} className="p-3 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-700 text-center flex flex-col gap-0.5">
                      {s.name}
                      <span className="text-[9px] text-slate-400 truncate">{s.major.substring(0, 4)}</span>
                    </div>
                  ))}
                </div>
                <div className={`p-4 rounded-2xl ${config.bg} border border-white flex items-center justify-between shadow-sm`}>
                  <div className="flex items-center gap-2"><config.icon size={16} className={config.color} /><span className={`text-xs font-black ${config.color}`}>{status}</span></div>
                  <span className="text-[10px] text-slate-400 font-mono">{inspection?.time.split(' ')[0] || '从未检查'}</span>
                </div>
              </div>
              <div className="px-5 pb-5">
                <button onClick={() => setSelectedDorm(dormId)} className="w-full py-3 bg-slate-800 text-white rounded-2xl text-xs font-black shadow-lg shadow-slate-200 hover:bg-slate-900 transition-all">记录/更新查寝</button>
              </div>
            </div>
          );
        })}
        {dormGroups.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-30 space-y-4">
             <Home size={60} className="mx-auto" />
             <p className="font-black uppercase tracking-widest">该筛选条件下暂无宿舍分配</p>
          </div>
        )}
      </div>

      <Modal isOpen={!!historyDormId} onClose={() => setHistoryDormId(null)} title={`${historyDormId} 查寝溯源档案`}>
        <div className="space-y-4">
          {getDormHistory(historyDormId || '').length > 0 ? (
            getDormHistory(historyDormId || '').map(h => (
              <div key={h.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-black ${statusConfig[h.status].color}`}>{h.status}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{h.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 italic">"{h.note || '无备注'}"</p>
                </div>
              </div>
            ))
          ) : <p className="text-center py-10 text-slate-300">暂无历史查寝记录</p>}
        </div>
      </Modal>

      <Modal isOpen={!!selectedDorm} onClose={() => setSelectedDorm(null)} title={`${selectedDorm} 查寝登记`}>
        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onUpdateInspection({
            dormId: selectedDorm!,
            status: fd.get('status') as DormStatus,
            time: new Date().toLocaleString(),
            note: fd.get('note') as string,
          });
          setSelectedDorm(null);
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['优秀', '合格', '整改', '违纪'] as DormStatus[]).map(s => (
              <label key={s} className="flex items-center justify-center p-3 rounded-xl border-2 border-slate-100 hover:border-indigo-600 cursor-pointer transition-all has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-600">
                <input type="radio" name="status" value={s} required className="hidden" defaultChecked={s==='合格'} />
                <span className="text-xs font-bold text-slate-700">{s}</span>
              </label>
            ))}
          </div>
          <textarea name="note" placeholder="记录现场情况..." rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-100 outline-none text-sm bg-slate-50"></textarea>
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100">提交登记</button>
        </form>
      </Modal>
    </div>
  );
};

export default DormitoryView;
