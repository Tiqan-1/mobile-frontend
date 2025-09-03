export interface Program {
  createdBy: Record<string, unknown>;
  description: string;
  end: Date;
  id: string;
  levels?: Level[];
  name: string;
  registrationEnd: Date;
  registrationStart: Date;
  start: Date;
  thumbnail: string;
}

export interface Level {
  end: Date;
  id: string;
  name: string;
  start: Date;
  tasks?: Task[];
}

export interface Task {
  date: Date;
  id: string;
  lessons: Lesson[];
}
export interface Lesson {
  date: Date;
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'other';
  url: string;
}

export interface Subscription {
  currentLevel?: Level;
  id: string;
  program: Program;
  state: 'active';
  subscriptionDate: string;
}
