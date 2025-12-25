
import React, { useState, useRef } from 'react';
import { 
  Search, Plus, Upload, Tag as TagIcon, MessageSquare, UserCircle, 
  Check, History, Zap, Download, Edit3, Trash2, Phone, Home, MapPin, CreditCard, Calendar, User, School, BookOpen, AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, TagType, StudentEvent, StudentEventType } from '../types';
import Modal from './Modal';

interface StudentViewProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  onUpdateTags: (id: string, tags: TagType[]) => void;
  onAddEvent: (studentId: string, event: Omit<StudentEvent, 'id'>) => void;
  onDeleteStudent: (id: string) => void;
  onStartTalk: (student: Student) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const StudentView: React.FC<StudentViewProps> = ({ students, setStudents, onUpdateTags, onAddEvent, onDeleteStudent, onStartTalk, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [tagPopoverId, setTagPopoverId] = useState<string | null>(null);
  const [eventStudentId, setEventStudentId] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = students.filter(s => 
    s.name.includes(searchTerm) || 
    s.studentId.includes(searchTerm) || 
    s.dormId.includes(searchTerm) ||
    s.major.includes(searchTerm) ||
    s.grade.includes(searchTerm)
  );

  const availableTags: TagType[] = ['心理关注', '贫困资助', '学业预警', '党员', '入党积极分子', '班委'];
  const eventTypes: StudentEventType[] = ['意外事件', '违纪错误', '荣誉奖励', '其他记录'];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const extension = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let rawData: any[][] = [];
        if (extension === 'xlsx' || extension === 'xls') {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
        } else {
          const decoder = new TextDecoder('gb18030');
          const text = decoder.decode(e.target?.result as ArrayBuffer);
          rawData = text.split('\n').map(line => line.split(',').map(cell => cell.trim()));
        }
        if (rawData.length < 2) throw new Error('数据为空');
        const imported: Student[] = rawData.slice(1).filter(row => row[0]).map((c, i) => ({
          id: `imp-${Date.now()}-${i}`,
          name: String(c[0] || ''),
          gender: c[1] === '女' ? '女' : '男',
          department: String(c[2] || ''),
          grade: String(c[3] || ''),
          major: String(c[4] || ''),
          className: String(c[5] || ''),
          studentId: String(c[6] || ''),
          idCard: String(c[7] || ''),
          address: String(c[8] || ''),
          origin: String(c[9] || ''),
          birthday: String(c[10] || ''),
          phone: String(c[11] || ''),
          fatherName: String(c[12] || ''),
          fatherPhone: String(c[13] || ''),
          motherName: String(c[14] || ''),
          motherPhone: String(c[15] || ''),
          dormId: String(c[16] || ''),
          tags: [],
          events: []
        }));
        setStudents(prev => [...prev, ...imported]);
        showToast(`成功导入 ${imported.length} 名学生档案`);
      } catch (err) {
        showToast('导入失败，请检查文件格式', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleStudentFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: any = {};
    fd.forEach((value, key) => data[key] = value);

    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...data } : s));
      showToast('档案已更新');
    } else {
      const newStudent: Student = {
        ...data,
        id: `s-${Date.now()}`,
        tags: [],
        events: []
      };
      setStudents(prev => [newStudent, ...prev]);
      showToast('新学生档案已创建');
    }
    setIsAddModalOpen(false);
    setEditingStudent(null);
  };

  const downloadTemplate = () => {
    const headers = ["姓名", "性别", "院系", "年级", "专业", "班级", "学号", "身份证号", "家庭地址", "籍贯", "出生日期", "手机号", "父亲姓名", "父亲联系方式", "母亲姓名", "母亲联系方式", "宿舍号"];
    const csvContent = "\ufeff" + headers.join(",") + "\n张三,男,信息工程学院,2021级,软件工程,软工2101,20210001,110...,北京,北京,2003-01-01,138...,父,139...,母,139...,南-101";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "学生多维信息模版.csv";
    a.click();
  };

  const toggleTag = (sId: string, tag: TagType) => {
    const s = students.find(x => x.id === sId);
    if (!s) return;
    const newTags = s.tags.includes(tag) ? s.tags.filter(t => t !== tag) : [...s.tags, tag];
    onUpdateTags(sId, newTags);
  };

  const handleExecuteDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const DetailItem = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm"><Icon size={14} /></div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value || '--'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="搜索姓名、学号、专业、年级..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none text-sm outline-none font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditingStudent(null); setIsAddModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-900/10 hover:bg-blue-700 transition-all"><Plus size={18} /> 新增学生</button>
          <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-blue-600 font-bold text-xs"><Download size={18} /> 下载模板</button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-2xl font-bold text-xs"><Upload size={18} /> 批量导入</button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="w-full text-sm text-left border-collapse min-w-[1300px]">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="sticky-col-left left-0 px-6 py-5 font-black text-slate-600 bg-slate-50">学生姓名</th>
                <th className="px-6 py-5 font-black text-slate-600">归属/年级</th>
                <th className="px-6 py-5 font-black text-slate-600">专业/班级</th>
                <th className="px-6 py-5 font-black text-slate-600">宿舍/手机</th>
                <th className="px-6 py-5 font-black text-slate-600">最新动态</th>
                <th className="sticky-col-right right-0 px-6 py-5 font-black text-slate-600 bg-slate-50 text-right">档案操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="group hover:bg-slate-50/50">
                  <td className={`sticky-col-left left-0 px-6 py-4 font-bold text-slate-800 bg-white group-hover:bg-slate-50 transition-all ${tagPopoverId === s.id ? 'z-[60]' : 'z-10'}`}>
                    <div className="flex items-center gap-3">
                      <span className="cursor-pointer hover:text-blue-600" onClick={() => setSelectedStudent(s)}>{s.name}</span>
                      <div className="relative">
                        <button onClick={() => setTagPopoverId(tagPopoverId === s.id ? null : s.id)} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all"><Plus size={14} /></button>
                        {tagPopoverId === s.id && (
                          <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-slate-200 shadow-2xl rounded-2xl p-3 w-48 animate-in zoom-in duration-150">
                            <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">快速标记状态</p>
                            <div className="space-y-1">
                              {availableTags.map(tag => (
                                <button key={tag} onClick={() => toggleTag(s.id, tag)} className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-all flex items-center justify-between ${s.tags.includes(tag) ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}>
                                  {tag} {s.tags.includes(tag) && <Check size={14} />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-800 font-medium">{s.department}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase">{s.grade}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-800 font-medium">{s.major}</p>
                    <p className="text-xs text-slate-400 font-mono">{s.className}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black self-start mb-1">{s.dormId}</span>
                      <span className="text-xs text-slate-400 font-mono">{s.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {s.events[0] ? (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${s.events[0].type === '荣誉奖励' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{s.events[0].type}</span>
                        <span className="text-xs text-slate-500 truncate max-w-[120px]">{s.events[0].title}</span>
                      </div>
                    ) : <span className="text-slate-300 text-xs">暂无重大记录</span>}
                  </td>
                  <td className="sticky-col-right right-0 px-6 py-4 bg-white group-hover:bg-slate-50 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingStudent(s); setIsAddModalOpen(true); }} className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-800 hover:text-white transition-all" title="编辑档案"><Edit3 size={16} /></button>
                      <button onClick={() => setEventStudentId(s.id)} className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm" title="更新大事记"><Zap size={16} /></button>
                      <button onClick={() => onStartTalk(s)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="发起谈话"><MessageSquare size={16} /></button>
                      <button onClick={() => setSelectedStudent(s)} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white transition-all" title="查看全景档案"><History size={16} /></button>
                      <button onClick={() => setStudentToDelete({id: s.id, name: s.name})} className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="彻底删除"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 删除确认 Modal */}
      <Modal isOpen={!!studentToDelete} onClose={() => setStudentToDelete(null)} title="档案永久删除确认" theme="blue" maxWidth="max-w-md">
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full mx-auto flex items-center justify-center border-4 border-rose-100 animate-pulse">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-slate-800">您确定要删除吗？</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              即将删除学生 <span className="text-rose-600 font-black">[{studentToDelete?.name}]</span> 的档案。<br/>
              这不仅会删除个人信息，还将清理其所有的<span className="font-bold">谈心谈话记录</span>和<span className="font-bold">荣誉奖励档案</span>。此操作不可逆。
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setStudentToDelete(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">取消</button>
            <button onClick={handleExecuteDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-900/20 hover:bg-rose-700 active:scale-95 transition-all">确认永久删除</button>
          </div>
        </div>
      </Modal>

      {selectedStudent && (
        <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title={`${selectedStudent.name} 的全维数字成长档案`} maxWidth="max-w-5xl">
           <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="p-8 bg-slate-50 rounded-[3rem] text-center border border-slate-100">
                <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 shadow-xl flex items-center justify-center border-4 border-white"><UserCircle size={70} className="text-slate-200" /></div>
                <h4 className="text-2xl font-black text-slate-800">{selectedStudent.name}</h4>
                <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">{selectedStudent.grade} · {selectedStudent.major}</p>
                <div className="flex flex-wrap justify-center gap-1.5 mt-6">
                  {selectedStudent.tags.map(t => <span key={t} className="px-2 py-1 bg-white text-rose-500 rounded-lg text-[10px] font-black border border-rose-100">{t}</span>)}
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">家庭联系档案</p>
                <div className="p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase">父亲信息</p>
                    <p className="text-sm font-bold text-indigo-900">{selectedStudent.fatherName} · {selectedStudent.fatherPhone}</p>
                  </div>
                  <div className="pt-3 border-t border-indigo-100/50">
                    <p className="text-[10px] font-black text-indigo-400 uppercase">母亲信息</p>
                    <p className="text-sm font-bold text-indigo-900">{selectedStudent.motherName} · {selectedStudent.motherPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 space-y-8">
              <section>
                <h5 className="font-black text-slate-800 flex items-center gap-2 mb-4"><School className="text-blue-500" size={18} /> 学籍与归属信息</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailItem label="所属院系" value={selectedStudent.department} icon={School} />
                  <DetailItem label="入学年级" value={selectedStudent.grade} icon={Calendar} />
                  <DetailItem label="所属专业" value={selectedStudent.major} icon={BookOpen} />
                  <DetailItem label="行政班级" value={selectedStudent.className} icon={Home} />
                  <DetailItem label="学号" value={selectedStudent.studentId} icon={CreditCard} />
                  <DetailItem label="宿舍号" value={selectedStudent.dormId} icon={Home} />
                </div>
              </section>

              <section>
                <h5 className="font-black text-slate-800 flex items-center gap-2 mb-4"><User className="text-indigo-500" size={18} /> 身份与基础信息</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailItem label="性别" value={selectedStudent.gender} icon={User} />
                  <DetailItem label="身份证号" value={selectedStudent.idCard} icon={CreditCard} />
                  <DetailItem label="籍贯" value={selectedStudent.origin} icon={MapPin} />
                  <DetailItem label="出生日期" value={selectedStudent.birthday} icon={Calendar} />
                  <DetailItem label="手机号" value={selectedStudent.phone} icon={Phone} />
                  <DetailItem label="家庭地址" value={selectedStudent.address} icon={MapPin} />
                </div>
              </section>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingStudent(null); }} title={editingStudent ? "编辑多维档案" : "录入全维度档案"} maxWidth="max-w-4xl">
        <form onSubmit={handleStudentFormSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <section className="space-y-4 col-span-full">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-blue-500 pl-3">学籍归属信息</p>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input name="department" required placeholder="所属院系" defaultValue={editingStudent?.department} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="grade" required placeholder="入学年级 (例: 2021级)" defaultValue={editingStudent?.grade} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="major" required placeholder="所属专业" defaultValue={editingStudent?.major} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="className" required placeholder="行政班级" defaultValue={editingStudent?.className} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="studentId" required placeholder="学号" defaultValue={editingStudent?.studentId} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="dormId" required placeholder="宿舍号" defaultValue={editingStudent?.dormId} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
               </div>
            </section>

            <section className="space-y-4 col-span-full">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">个人身份明细</p>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input name="name" required placeholder="姓名" defaultValue={editingStudent?.name} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <select name="gender" defaultValue={editingStudent?.gender || "男"} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold">
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                  <input name="idCard" required placeholder="身份证号" defaultValue={editingStudent?.idCard} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="birthday" type="date" placeholder="出生日期" defaultValue={editingStudent?.birthday} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="phone" required placeholder="手机号" defaultValue={editingStudent?.phone} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="origin" required placeholder="籍贯" defaultValue={editingStudent?.origin} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="address" required placeholder="详细家庭住址" defaultValue={editingStudent?.address} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold col-span-full" />
               </div>
            </section>

            <section className="space-y-4 col-span-full">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-rose-500 pl-3">家属联系档案</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-rose-50/50 rounded-[2rem] border border-rose-100 space-y-4">
                    <input name="fatherName" placeholder="父亲姓名" defaultValue={editingStudent?.fatherName} className="w-full p-4 bg-white rounded-2xl outline-none font-bold" />
                    <input name="fatherPhone" placeholder="父亲手机" defaultValue={editingStudent?.fatherPhone} className="w-full p-4 bg-white rounded-2xl outline-none font-bold" />
                  </div>
                  <div className="p-4 bg-rose-50/50 rounded-[2rem] border border-rose-100 space-y-4">
                    <input name="motherName" placeholder="母亲姓名" defaultValue={editingStudent?.motherName} className="w-full p-4 bg-white rounded-2xl outline-none font-bold" />
                    <input name="motherPhone" placeholder="母亲手机" defaultValue={editingStudent?.motherPhone} className="w-full p-4 bg-white rounded-2xl outline-none font-bold" />
                  </div>
               </div>
            </section>
          </div>
          <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all uppercase tracking-widest">
            {editingStudent ? "确认档案更新" : "封存入库"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default StudentView;
