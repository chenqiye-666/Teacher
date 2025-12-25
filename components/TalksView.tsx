
import React, { useState, useMemo, useRef } from 'react';
import { 
  MessageSquareHeart, Search, Calendar, MapPin, Plus, BookOpen, UserCircle, 
  History, Sparkles, ImageIcon, X, ShieldAlert, GraduationCap, Heart, Compass, MessageSquare,
  CheckCircle2, ChevronRight, School, Camera, Layers, ChevronLeft, ArrowRight, Grid
} from 'lucide-react';
import { Student, TalkRecord, TalkType } from '../types';
import Modal from './Modal';

interface TalksViewProps {
  students: Student[];
  talks: TalkRecord[];
  onAddTalk: (record: Omit<TalkRecord, 'id'>) => void;
}

const TalksView: React.FC<TalksViewProps> = ({ students, talks, onAddTalk }) => {
  const [isLanding, setIsLanding] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [archiveStudentId, setArchiveStudentId] = useState<string | null>(null);
  const [talkImage, setTalkImage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // 筛选状态
  const [filterGrade, setFilterGrade] = useState<string>('全部年级');
  const [filterMajor, setFilterMajor] = useState<string>('全部专业');

  const grades = useMemo(() => Array.from(new Set(students.map(s => s.grade))), [students]);
  const majors = useMemo(() => Array.from(new Set(students.map(s => s.major))), [students]);

  const [talkSearchText, setTalkSearchText] = useState('');
  const [selectedStudentForTalk, setSelectedStudentForTalk] = useState<Student | null>(null);

  const studentsWithTalks = useMemo(() => {
    const studentIdsWithTalks = new Set(talks.map(t => t.studentId));
    return students.filter(s => {
      const hasTalks = studentIdsWithTalks.has(s.id);
      const matchesSearch = s.name.includes(searchTerm) || s.studentId.includes(searchTerm);
      const matchesGrade = filterGrade === '全部年级' || s.grade === filterGrade;
      const matchesMajor = filterMajor === '全部专业' || s.major === filterMajor;
      
      return hasTalks && (searchTerm ? matchesSearch : true) && matchesGrade && matchesMajor;
    });
  }, [students, talks, searchTerm, filterGrade, filterMajor]);

  const filteredStudentsForNewTalk = useMemo(() => {
    if (!talkSearchText.trim()) return [];
    return students.filter(s => 
      s.name.includes(talkSearchText) || 
      s.studentId.includes(talkSearchText) || 
      s.className.includes(talkSearchText)
    ).slice(0, 5);
  }, [talkSearchText, students]);

  const getStudentTalks = (studentId: string) => talks.filter(t => t.studentId === studentId);

  const categoryConfig: Record<TalkType, { icon: any, color: string, bg: string }> = {
    '日常谈话': { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
    '学业预警': { icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50' },
    '心理疏导': { icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
    '职业规划': { icon: Compass, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    '违纪约谈': { icon: ShieldAlert, color: 'text-slate-600', bg: 'bg-slate-50' },
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTalkImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddTalkSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudentForTalk) return;
    const fd = new FormData(e.currentTarget);
    onAddTalk({
      studentId: selectedStudentForTalk.id,
      studentName: selectedStudentForTalk.name,
      type: fd.get('type') as TalkType,
      date: fd.get('date') as string,
      location: fd.get('location') as string,
      content: fd.get('content') as string,
      followUp: fd.get('followUp') as string,
      img: talkImage || undefined,
    });
    setIsAddModalOpen(false);
    setSelectedStudentForTalk(null);
    setTalkImage(null);
    setTalkSearchText('');
  };

  if (isLanding) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="text-center space-y-4 py-10">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl shadow-indigo-100">
            <MessageSquareHeart size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">谈心谈话档案库端口</h2>
          <p className="text-slate-400 font-medium">请选择您要进入管理的专业年级档案室</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div 
            onClick={() => { setFilterGrade('全部年级'); setFilterMajor('全部专业'); setIsLanding(false); }}
            className="p-8 bg-white rounded-[3rem] border-2 border-slate-100 hover:border-indigo-500 cursor-pointer group transition-all flex flex-col items-center text-center shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all mb-4">
              <Grid size={24} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-1">全局档案室</h4>
            <p className="text-xs text-slate-400 mb-6 font-medium italic">浏览所有谈心访谈档案</p>
            <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
              开启管理 <ArrowRight size={14} />
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
              <h4 className="text-xl font-black text-slate-800 mb-1">{g} 档案端口</h4>
              <p className="text-xs text-slate-400 mb-6 font-medium italic">管理本年级所有访谈轴</p>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                进入档案室 <ArrowRight size={14} />
              </div>
            </div>
          ))}

          {majors.map(m => (
            <div 
              key={m}
              onClick={() => { setFilterGrade('全部年级'); setFilterMajor(m); setIsLanding(false); }}
              className="p-8 bg-white rounded-[3rem] border-2 border-slate-100 hover:border-rose-500 cursor-pointer group transition-all flex flex-col items-center text-center shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all mb-4">
                <BookOpen size={24} />
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-1">{m} 档案端口</h4>
              <p className="text-xs text-slate-400 mb-6 font-medium italic">管理本专业专属访谈档案</p>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                进入档案室 <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={() => setIsLanding(true)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest group"
        >
          <ChevronLeft size={16} /> 返回分类档案端口
        </button>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100">当前档案室：{filterGrade} · {filterMajor}</span>
          <button onClick={() => setIsAddModalOpen(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-indigo-900/10"><Plus size={14} className="inline mr-1" /> 新增访谈</button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="在当前档案室中搜索姓名、学号..." 
          className="w-full pl-14 pr-6 py-5 bg-white rounded-[2rem] border-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studentsWithTalks.map(s => {
          const sTalks = getStudentTalks(s.id);
          const lastTalk = sTalks[0];
          const config = lastTalk ? categoryConfig[lastTalk.type] : { color: 'text-slate-400', bg: 'bg-slate-50', icon: MessageSquare };
          const Icon = config.icon;

          return (
            <div key={s.id} onClick={() => setArchiveStudentId(s.id)} className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all border border-slate-100">
                  <UserCircle size={40} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800">{s.name}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase">{s.grade} · {s.major}</p>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className={`p-4 rounded-2xl ${config.bg} border border-white flex items-center gap-3 shadow-sm`}>
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${config.color} shadow-sm`}><Icon size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">最新谈话类别</p>
                    <p className={`text-sm font-bold ${config.color}`}>{lastTalk?.type || '未分类'}</p>
                  </div>
                </div>
                
                <div className="space-y-3 px-1 pt-2">
                  <div className="flex justify-between text-xs font-bold"><span className="text-slate-400 uppercase tracking-widest">累计沟通</span><span className="text-indigo-600">{sTalks.length} 次访谈</span></div>
                  <div className="flex justify-between text-xs font-bold"><span className="text-slate-400 uppercase tracking-widest">最后档案日期</span><span className="text-slate-600 font-mono">{lastTalk?.date || '--'}</span></div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 flex justify-center">
                <span className="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-2 tracking-[0.2em] group-hover:translate-x-1 transition-transform">
                  查看数字成长轨迹 <History size={12} />
                </span>
              </div>
            </div>
          );
        })}
        {studentsWithTalks.length === 0 && (
          <div className="col-span-full py-32 text-center space-y-6 opacity-30">
            <MessageSquareHeart size={80} className="mx-auto text-slate-300" />
            <div className="space-y-2">
              <p className="text-2xl font-black uppercase tracking-[0.3em] text-slate-400">未发现匹配档案</p>
              <p className="text-sm font-bold text-slate-400 italic">默认仅展示已谈话的学生，请尝试切换筛选端口</p>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={!!archiveStudentId} onClose={() => setArchiveStudentId(null)} title={`${students.find(s=>s.id===archiveStudentId)?.name} 的访谈档案全集`} theme="blue" maxWidth="max-w-3xl">
        <div className="space-y-8 py-4">
          {getStudentTalks(archiveStudentId || '').map((t, idx) => {
             const config = categoryConfig[t.type];
             const Icon = config.icon;
             return (
              <div key={idx} className="relative pl-10 border-l-4 border-indigo-100 pb-10 last:pb-0">
                <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-white border-4 border-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-100"></div>
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`flex items-center gap-2 px-3 py-1.5 ${config.bg} ${config.color} text-[10px] font-black rounded-xl border border-white uppercase tracking-wider`}>
                      <Icon size={12} /> {t.type}
                    </div>
                    <span className="text-xs font-mono text-slate-400">{t.date} · {t.location}</span>
                  </div>
                  <div className="space-y-6">
                    <p className="text-slate-800 leading-relaxed font-medium italic border-l-4 border-slate-100 pl-4 py-1">“{t.content}”</p>
                    {t.img && (
                      <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-inner max-h-80 bg-slate-50">
                        <img src={t.img} alt="talk scene" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {t.followUp && (
                      <div className="flex gap-4 pt-6 border-t border-slate-50">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0"><Sparkles size={20} /></div>
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">跟进计划与建议</p>
                          <p className="text-emerald-900 text-sm font-bold leading-relaxed">{t.followUp}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
             );
          })}
        </div>
      </Modal>

      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setTalkImage(null); setSelectedStudentForTalk(null); setTalkSearchText(''); }} title="开启深度谈心访谈" theme="blue">
        <form onSubmit={handleAddTalkSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">定位学生档案</label>
            {!selectedStudentForTalk ? (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  placeholder="输入姓名、学号、专业..." 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
                  value={talkSearchText}
                  onChange={(e) => setTalkSearchText(e.target.value)}
                />
                {filteredStudentsForNewTalk.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 space-y-1">
                      {filteredStudentsForNewTalk.map(s => (
                        <div key={s.id} onClick={() => setSelectedStudentForTalk(s)} className="flex items-center justify-between p-4 hover:bg-indigo-50 cursor-pointer rounded-xl group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300"><UserCircle size={24}/></div>
                            <div>
                              <p className="font-black text-slate-800">{s.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{s.grade} · {s.major}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm"><UserCircle size={28}/></div>
                  <div>
                    <p className="font-black text-indigo-900 text-lg">{selectedStudentForTalk.name}</p>
                    <p className="text-[10px] text-indigo-600/60 font-black uppercase tracking-widest">{selectedStudentForTalk.major} ({selectedStudentForTalk.grade})</p>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedStudentForTalk(null)} className="p-2 text-indigo-300 hover:text-indigo-600"><X size={18} /></button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">谈话类别</label>
              <select name="type" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700">
                <option value="日常谈话">日常谈话</option>
                <option value="心理疏导">心理疏导</option>
                <option value="学业预警">学业预警</option>
                <option value="职业规划">职业规划</option>
                <option value="违纪约谈">违纪约谈</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">日期</label>
              <input type="date" name="date" required className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">照片补录</label>
            <div onClick={() => imageInputRef.current?.click()} className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all overflow-hidden relative group">
              {talkImage ? (
                <>
                  <img src={talkImage} className="w-full h-full object-cover" alt="talk preview" />
                  <button onClick={(e) => { e.stopPropagation(); setTalkImage(null); }} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-indigo-600"><X size={14}/></button>
                </>
              ) : (
                <>
                  <Camera size={28} className="text-slate-200 mb-2 group-hover:text-indigo-400" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">点击上传访谈现场照片</p>
                </>
              )}
              <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          <div>
            <textarea name="content" required placeholder="记录沟通核心内容..." rows={4} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-medium text-sm"></textarea>
          </div>

          <button type="submit" disabled={!selectedStudentForTalk} className={`w-full py-5 rounded-[2rem] font-black text-sm tracking-widest uppercase shadow-xl transition-all ${selectedStudentForTalk ? 'bg-indigo-600 text-white shadow-indigo-900/20 hover:bg-indigo-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
            <CheckCircle2 size={20} className="inline mr-2" /> 正式登记入档
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TalksView;
