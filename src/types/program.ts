interface Program {
  createdBy: Record<string, unknown>;
  description: string;
  end: string;
  id: string;
  levels: unknown[];
  name: string;
  registrationEnd: Date;
  registrationStart: Date;
  start: string;
}

interface Level {
  end: Date;
  id: string;
  name: string;
  start: Date;
  tasks: Task[];
}

interface Task {
  date: Date;
  id: string;
  lessons: Lesson[];
}
interface Lesson {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface Subscription {
  id: string;
  level: Level;
  program: Program;
  state: 'active';
  subscriptionDate: string;
}
