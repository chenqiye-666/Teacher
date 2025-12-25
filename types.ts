
/**
 * 云端数据库设计建议 (Database Schema Design)
 */

export type TagType = '心理关注' | '贫困资助' | '学业预警' | '党员' | '入党积极分子' | '班委';

export type StudentEventType = '意外事件' | '违纪错误' | '荣誉奖励' | '其他记录';

export interface StudentEvent {
  id: string;
  type: StudentEventType;
  title: string;
  date: string;
  detail: string;
}

export interface Student {
  id: string;
  name: string;
  gender: '男' | '女';
  department: string; // 新增：院系
  grade: string;      // 新增：年级
  major: string;      // 新增：专业
  className: string;
  studentId: string;
  idCard: string;
  address: string;
  origin: string;
  birthday: string;
  phone: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  dormId: string;
  tags: TagType[];
  events: StudentEvent[];
}

export type TalkType = '学业预警' | '心理疏导' | '职业规划' | '日常谈话' | '违纪约谈';

export interface TalkRecord {
  id: string;
  studentId: string;
  studentName: string;
  type: TalkType;
  date: string;
  location: string;
  content: string;
  followUp: string;
  img?: string; 
}

export type DormStatus = '优秀' | '合格' | '整改' | '违纪';

export interface DormInspection {
  id: string;
  dormId: string;
  status: DormStatus;
  time: string;
  note: string;
}

export interface HonorRecord {
  id: string;
  title: string;
  level: string;
  studentId: string;
  studentName: string;
  date: string;
  img?: string; 
}

export interface StoryRecord {
  id: string;
  title: string;
  author: string;
  tags: string[];
  img: string;
  summary: string;
}

export interface CounselorInfo {
  name: string;
  title: string;
  avatar: string;
  themeColor: string;
}

export type ViewType = 'welcome' | 'students' | 'dormitory' | 'talks' | 'development';
