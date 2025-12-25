
import React, { useMemo } from 'react';
import { Users, Home, AlertCircle, Award, ArrowRight, Zap, BellRing, Trophy, FileText, Upload, ChevronRight, School, Layers } from 'lucide-react';
import { Student, TalkRecord, ViewType, CounselorInfo } from '../types';

interface WelcomeViewProps {
  counselor: CounselorInfo;
  students: Student[];
  talks: TalkRecord[];
  onNavigate: (view: ViewType) => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ counselor, students, talks, onNavigate }) => {
  const stats = [
    { id: 'students', label: '学生总数', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', view: 'students' },
    { id: 'dormitory', label: '已排宿舍', value: Array.from(new Set(students.map(s => s.dormId))).filter(Boolean).length, icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50', view: 'dormitory' },
    { id: 'focus', label: '重点关注', value: students.filter(s => s.tags.includes('心理关注') || s.tags.includes('学业预警')).length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', view: 'students' },
    { id: 'party', label: '党员人数', value: students.filter(s => s.tags.includes('党员')).length, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50', view: 'students' },
  ];

  // 计算所有的专业+年级组合，作为直达端口
  const portalGroups = useMemo(() => {
    const groups: Record<string, { grade: string, major: string, count: number }> = {};
    students.forEach(s => {
      const key = `${s.grade}-${s.major}`;
      if (!groups[key]) {
        groups[key] = { grade: s.grade, major: s.major, count: 0 };
      }
      groups[key].count++;
    });
    return Object.values(groups).sort((a, b) => b.grade.localeCompare(a.grade));
  }, [students]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-800 p-12 text-white shadow-2xl">
        <div className="relative z-10 space-y-6 max-w-2xl">
          <h1 className="text-4xl font-black tracking-tight italic">下午好，{counselor.name}</h1>
          <p className="text-blue-100 text-lg leading-relaxed opacity-90">
            您当前负责 <span className="font-bold text-white">{portalGroups.length}</span> 个专业/年级方向。班级管理一切正常，云端数据已实时同步。
          </p>
          <div className="flex gap-4 pt-4">
            <button onClick={() => onNavigate('students')} className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all border border-white/20">
              学生名册 <ArrowRight size={18} />
            </button>
            <button onClick={() => onNavigate('talks')} className="bg-amber-400 hover:bg-amber-500 text-amber-950 px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-amber-900/20">
              发起谈话 <Zap size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, idx) => (
          <button 
            key={idx} 
            onClick={() => onNavigate(item.view as ViewType)}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all group text-left"
          >
            <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon size={28} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{item.label}</p>
              <p className="text-2xl font-black text-slate-800 mt-0.5">{item.value}</p>
            </div>
          </button>
        ))}
      </div>

      {/* 专业年级管理直达端口 */}
      <section className="space-y-4">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 ml-2">
          <School className="text-blue-600" size={24} /> 专业年级管理端口
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portalGroups.map((p, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Layers size={22} />
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase">{p.grade}</span>
              </div>
              <h4 className="text-lg font-black text-slate-800 mb-1">{p.major}</h4>
              <p className="text-xs text-slate-400 mb-6">{p.count} 名在籍学生</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => onNavigate('students')}
                  className="flex-1 py-2 text-[10px] font-black text-slate-500 bg-slate-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest"
                >
                  名册
                </button>
                <button 
                  onClick={() => onNavigate('dormitory')}
                  className="flex-1 py-2 text-[10px] font-black text-slate-500 bg-slate-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest"
                >
                  宿舍
                </button>
                <button 
                  onClick={() => onNavigate('talks')}
                  className="flex-1 py-2 text-[10px] font-black text-slate-500 bg-slate-50 rounded-xl hover:bg-rose-600 hover:text-white transition-all uppercase tracking-widest"
                >
                  谈心
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <Zap className="text-amber-500" size={24} /> 快速操作指令
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: '导入班级名册', desc: '支持 Excel/CSV 快速同步', icon: Upload, view: 'students' },
              { title: '登记查寝状态', desc: '快速记录卫生与安全', icon: Home, view: 'dormitory' },
              { title: '综合素质测评', desc: '根据档案自动生成评分', icon: FileText, view: 'development' },
              { title: '荣誉登记系统', desc: '班级荣誉墙实时更新', icon: Trophy, view: 'development' },
            ].map((guide, i) => (
              <div 
                key={i} 
                onClick={() => onNavigate(guide.view as ViewType)}
                className="group p-5 rounded-[2rem] border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition-all cursor-pointer flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <guide.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{guide.title}</h4>
                  <p className="text-xs text-slate-400">{guide.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <BellRing className="text-blue-600" size={24} /> 预警动态
          </h3>
          <div className="space-y-4">
            {students.filter(s => s.tags.includes('心理关注')).slice(0, 3).map((s, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-100">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-rose-900">重点关注提醒：{s.name}</p>
                  <p className="text-xs text-rose-700/70 mt-1">该生近期无谈心记录，建议回访。</p>
                </div>
              </div>
            ))}
            <button onClick={() => onNavigate('talks')} className="w-full py-3 rounded-2xl bg-slate-50 text-slate-500 font-bold text-sm hover:bg-blue-50 hover:text-blue-600 transition-all">
              进入档案室处理
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeView;
