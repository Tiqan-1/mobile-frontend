interface Program {
  createdBy: Record<string, unknown>;
  description: string;
  end: string;
  id: string;
  levels: unknown[];
  name: string;
  registrationEnd: string;
  registrationStart: string;
  start: string;
}

interface Level {
  end: string;
  id: string;
  name: string;
  start: string;
  tasks: Task[];
}

interface Task {
  date: string;
  id: string;
  lessons: Lesson;
}
interface Lesson {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface Subcription {
  id: string;
  level: Level;
  program: Program;
  state: 'active';
  subscriptionDate: string;
}
