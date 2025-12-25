
import React, { useState, useRef, useMemo } from 'react';
import { 
  Trophy, Heart, Plus, ExternalLink, Image as ImageIcon, Award, 
  X, Search, UserCircle, CheckCircle2, ChevronRight, School, Camera, Calendar, Medal, Layers, BookOpen, ChevronLeft, Grid, ArrowRight
} from 'lucide-react';
import { Student, HonorRecord, StoryRecord, StudentEvent } from '../types';
import Modal from './Modal';

interface DevelopmentViewProps {
  honors: HonorRecord[];
  setHonors: React.Dispatch<React.SetStateAction<HonorRecord[]>>;
  stories: StoryRecord[];
  setStories: React.Dispatch<React.SetStateAction<StoryRecord[]>>;
  students: Student[];
  onAddStudentEvent: (studentId: string, event: Omit<StudentEvent, 'id'>) => void;
}

const DevelopmentView: React.FC<DevelopmentViewProps> = ({ honors, setHonors, stories, setStories, students, onAddStudentEvent }) => {
  const [isLanding, setIsLanding] = useState(true);
  const [isHonorModalOpen, setIsHonorModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedHonorDetail, setSelectedHonorDetail] = useState<HonorRecord | null>(null);
  
  // 筛选状态
  const [filterGrade, setFilterGrade] = useState<string>('全部年级');
  const [filterMajor, setFilterMajor] = useState<string>('全部专业');

  const grades = useMemo(() => Array.from(new Set(students.map(s => s.grade))), [students]);
  const majors = useMemo(() => Array.from(new Set(students.map(s => s.major))), [students]);

  // 根据学生年级专业过滤荣誉
  const filteredHonors = useMemo(() => {
    return honors.filter(h => {
      const student = students.find(s => s.id === h.studentId);
      if (!student) return true;
      const matchesGrade = filterGrade === '全部年级' || student.grade === filterGrade;
      const matchesMajor = filterMajor === '全部专业' || student.major === filterMajor;
      return matchesGrade && matchesMajor;
    });
  }, [honors, students, filterGrade, filterMajor]);

  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [honorImage, setHonorImage] = useState<string | null>(null);
  
  const storyImageInputRef = useRef<HTMLInputElement>(null);
  const honorImageInputRef = useRef<HTMLInputElement>(null);

  const [honorSearchText, setHonorSearchText] = useState('');
  const [selectedStudentForHonor, setSelectedStudentForHonor] = useState<Student | null>(null);

  const filteredStudentsForHonor = useMemo(() => {
    if (!honorSearchText.trim()) return [];
    return students.filter(s => 
      s.name.includes(honorSearchText) || 
      s.studentId.includes(honorSearchText) || 
      s.className.includes(honorSearchText)
    ).slice(0, 5); 
  }, [honorSearchText, students]);

  const handleHonorSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudentForHonor) return;

    const fd = new FormData(e.currentTarget);
    const title = fd.get('title') as string;
    const level = fd.get('level') as string;
    const date = fd.get('date') as string;

    const newHonor: HonorRecord = {
      id: `h${Date.now()}`,
      title,
      level,
      studentId: selectedStudentForHonor.id,
      studentName: selectedStudentForHonor.name,
      date,
      img: honorImage || undefined
    };

    setHonors(prev => [newHonor, ...prev]);

    onAddStudentEvent(selectedStudentForHonor.id, {
      type: '荣誉奖励',
      title: `${title} (${level})`,
      date,
      detail: '从荣誉殿堂模块录入，已关联电子证书照片。',
    });

    setIsHonorModalOpen(false);
    setSelectedStudentForHonor(null);
    setHonorSearchText('');
    setHonorImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleStorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newStory = {
      id: `s${Date.now()}`,
      title: fd.get('title') as string,
      author: fd.get('author') as string,
      tags: (fd.get('tags') as string).split(/[，,]/).map(t => t.trim()).filter(Boolean),
      img: storyImage || 'https://picsum.photos/id/102/400/300',
      summary: fd.get('summary') as string,
    };
    setStories(prev => [newStory, ...prev]);
    setIsStoryModalOpen(false);
    setStoryImage(null);
  };

  if (isLanding) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="text-center space-y-4 py-10">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl shadow-amber-100">
            <Trophy size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">发展记录与荣誉端口</h2>
          <p className="text-slate-400 font-medium">请选择您要进入管理的专业年级发展大厅</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div 
            onClick={() => { setFilterGrade('全部年级'); setFilterMajor('全部专业'); setIsLanding(false); }}
            className="p-8 bg-white rounded-[3rem] border-2 border-slate-100 hover:border-amber-500 cursor-pointer group transition-all flex flex-col items-center text-center shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all mb-4">
              <Grid size={24} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-1">全局荣誉墙</h4>
            <p className="text-xs text-slate-400 mb-6 font-medium italic">浏览所有班级的发展记录与荣誉</p>
            <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
              进入大厅 <ArrowRight size={14} />
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
              <h4 className="text-xl font-black text-slate-800 mb-1">{g} 发展厅</h4>
              <p className="text-xs text-slate-400 mb-6 font-medium italic">浏览本年级学生荣誉与故事</p>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                进入大厅 <ArrowRight size={14} />
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
              <h4 className="text-xl font-black text-slate-800 mb-1">{m} 荣誉墙</h4>
              <p className="text-xs text-slate-400 mb-6 font-medium italic">聚焦本专业学生的卓越成长</p>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                进入大厅 <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={() => setIsLanding(true)}
          className="flex items-center gap-2 text-slate-400 hover:text-amber-600 font-black text-[10px] uppercase tracking-widest group"
        >
          <ChevronLeft size={16} /> 返回选择端口
        </button>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg border border-amber-100">当前视角：{filterGrade} · {filterMajor}</span>
          <button onClick={() => setIsHonorModalOpen(true)} className="px-6 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"><Plus size={14} className="inline mr-1" /> 补录荣誉</button>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg"><Trophy size={24} /></div>
          <div><h2 className="text-2xl font-black text-slate-800 tracking-tight">荣誉殿堂</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">记录高光时刻 · 点击卡片查看大图</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredHonors.map((h) => (
            <div key={h.id} onClick={() => setSelectedHonorDetail(h)} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden cursor-pointer">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {h.img ? (
                 <div className="h-32 w-full mb-4 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                    <img src={h.img} alt="Honor" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4 group-hover:rotate-12 transition-transform shadow-inner shadow-amber-200/50">
                  <Award size={32} />
                </div>
              )}
              <h4 className="font-black text-slate-800 text-lg leading-tight line-clamp-2 min-h-[3rem]">{h.title}</h4>
              <p className="text-amber-600 font-black text-[10px] mt-2 uppercase tracking-widest bg-amber-50 inline-block px-2 py-0.5 rounded-lg border border-amber-100/50">{h.level}</p>
              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-300"><UserCircle size={12}/></div> {h.studentName}</span>
                <span className="font-mono">{h.date}</span>
              </div>
            </div>
          ))}
          {filteredHonors.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-20 space-y-4">
              <Trophy size={60} className="mx-auto" />
              <p className="font-black uppercase tracking-widest text-lg">当前筛选条件下暂无荣誉记录</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg"><Heart size={24} /></div>
            <div><h2 className="text-2xl font-black text-slate-800 tracking-tight">时光回廊</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">共享师生故事 · 留存温暖温情</p></div>
          </div>
          <button onClick={() => setIsStoryModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white border border-rose-200 rounded-2xl text-rose-600 font-bold shadow-sm hover:bg-rose-50 transition-all active:scale-95"><ImageIcon size={18} /> 发布新篇章</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {stories.map((s) => (
            <div key={s.id} className="bg-white rounded-[3rem] overflow-hidden border border-slate-50 shadow-sm flex flex-col md:flex-row hover:shadow-2xl transition-all group">
              <div className="md:w-1/3 h-52 md:h-auto overflow-hidden">
                <img src={s.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="story" />
              </div>
              <div className="p-8 md:w-2/3 space-y-4 flex flex-col justify-center">
                <div className="flex flex-wrap gap-2">
                  {s.tags.map(t => <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black uppercase">{t}</span>)}
                </div>
                <h4 className="text-xl font-black text-slate-800 group-hover:text-rose-600 transition-colors">{s.title}</h4>
                <p className="text-sm text-slate-400 font-medium">—— {s.author}</p>
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed italic opacity-80">“{s.summary}”</p>
                <button className="text-rose-600 font-black text-[10px] flex items-center gap-2 uppercase tracking-[0.2em] mt-2 hover:translate-x-2 transition-transform">
                  READ STORY <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedHonorDetail && (
        <Modal isOpen={!!selectedHonorDetail} onClose={() => setSelectedHonorDetail(null)} title="荣誉获奖详情" theme="amber" maxWidth="max-w-3xl">
          <div className="space-y-6">
            <div className="p-8 bg-amber-50 rounded-[3rem] border border-amber-100 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-amber-500 mb-6 border-4 border-amber-100 animate-bounce"><Trophy size={40} /></div>
              <h3 className="text-2xl font-black text-slate-800 leading-tight mb-2">{selectedHonorDetail.title}</h3>
              <div className="px-4 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-900/20">{selectedHonorDetail.level}</div>
            </div>
            {selectedHonorDetail.img && (
              <div className="rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl group bg-slate-50">
                 <img src={selectedHonorDetail.img} alt="Honor Certificate" className="w-full h-auto object-contain max-h-[500px] transition-transform group-hover:scale-[1.02] duration-700" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 bg-slate-50 rounded-[2rem] flex items-center gap-4 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm"><UserCircle size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">获奖学生</p>
                    <p className="text-sm font-bold text-slate-800">{selectedHonorDetail.studentName}</p>
                  </div>
               </div>
               <div className="p-5 bg-slate-50 rounded-[2rem] flex items-center gap-4 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm"><Calendar size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">录入日期</p>
                    <p className="text-sm font-bold text-slate-800 font-mono">{selectedHonorDetail.date}</p>
                  </div>
               </div>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={isHonorModalOpen} onClose={() => { setIsHonorModalOpen(false); setSelectedStudentForHonor(null); setHonorSearchText(''); setHonorImage(null); }} title="荣誉获奖录入" theme="amber" maxWidth="max-w-xl">
        <form onSubmit={handleHonorSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">定位学生档案</label>
            {!selectedStudentForHonor ? (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" placeholder="搜索姓名、专业、班级..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={honorSearchText} onChange={(e) => setHonorSearchText(e.target.value)} />
                {filteredStudentsForHonor.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-2 space-y-1">
                      {filteredStudentsForHonor.map(s => (
                        <div key={s.id} onClick={() => setSelectedStudentForHonor(s)} className="flex items-center justify-between p-4 hover:bg-amber-50 cursor-pointer rounded-xl group transition-all">
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
              <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm"><UserCircle size={28}/></div>
                  <div>
                    <p className="font-black text-amber-900 text-lg">{selectedStudentForHonor.name}</p>
                    <p className="text-[10px] text-amber-600/60 font-black uppercase tracking-widest">{selectedStudentForHonor.major} ({selectedStudentForHonor.grade})</p>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedStudentForHonor(null)} className="p-2 text-amber-300 hover:text-amber-600"><X size={18} /></button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <input name="title" required placeholder="例如：全国大学生数学建模竞赛一等奖" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold" />
            <div className="grid grid-cols-2 gap-4">
              <input name="level" required placeholder="奖励层级" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold" />
              <input type="month" name="date" required className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold" />
            </div>
            <div onClick={() => honorImageInputRef.current?.click()} className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-amber-300 overflow-hidden relative">
              {honorImage ? (
                <img src={honorImage} className="w-full h-full object-cover" alt="preview" />
              ) : (
                <><Camera size={28} className="text-slate-200 mb-2" /><p className="text-[10px] text-slate-400 font-bold uppercase">上传证书原件照片</p></>
              )}
              <input type="file" ref={honorImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setHonorImage)} />
            </div>
          </div>
          <button type="submit" disabled={!selectedStudentForHonor} className={`w-full py-5 rounded-[2rem] font-black text-sm tracking-widest uppercase shadow-xl ${selectedStudentForHonor ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-300'}`}>确认录入</button>
        </form>
      </Modal>
    </div>
  );
};

export default DevelopmentView;
