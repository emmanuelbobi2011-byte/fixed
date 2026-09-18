export type Role = 'student' | 'teacher' | 'admin';

export type ActivityType = 'idle' | 'learning' | 'task' | 'test' | 'code_lab';

export type MediaType = 'picture' | 'video' | 'presentation' | 'gif';
export type CourseType = 'HTML' | 'CSS' | 'JS' | 'Fullstack';

export const ADMIN_EMAILS = [
  'emmanuelbobi2011@gmail.com',
  'euniceajayi2010@gmail.com',
].map(e => e.toLowerCase());

export function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export interface UserProfile {
  id: string;
  auth_user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  role: Role;
  bio?: string;
  email: string;
  streak_days: number;
  xp_points: number;
  whatsapp_number?: string;
  last_active_date?: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug?: string;
  description: string;
  image_url: string;
  media_type?: MediaType;
  media_url?: string;
  course_type?: CourseType;
  badge_color?: string;
  code_example?: string;
  code_example_title?: string;
  code_example_explanation?: string;
  status: 'published' | 'draft' | 'archived';
  order_index: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  recall_id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  size: string;
  slide_count?: number;
  slide_previews?: string[];
  created_at: string;
}

export interface LessonRecall {
  id: string;
  course_id: string;
  title: string;
  whatsapp_session_title: string;
  whatsapp_date: string;
  body: string;
  key_takeaways: string[];
  media_type?: 'picture' | 'video' | 'presentation' | 'gif';
  media_url?: string;
  code_example?: string;
  code_example_title?: string;
  code_example_explanation?: string;
  published: boolean;
  order_index: number;
  materials: Material[];
  task_id?: string;
  test_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskRequirement {
  id: string;
  description: string;
  type: 'html_tag' | 'css_property' | 'js_behavior' | 'output_match';
  rule_type?: string;
  target: string;
  rule_target?: string;
  points?: number;
  hint?: string;
}

export interface AutoGradeConfig {
  required_files: string[];
  checks: TaskRequirement[];
}

export interface Task {
  id: string;
  recall_id: string;
  course_id: string;
  title: string;
  instructions: string;
  requirements: TaskRequirement[];
  points: number;
  starter_code?: {
    html: string;
    css: string;
    js: string;
  };
  auto_grade_config: AutoGradeConfig;
  published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  explanation?: string;
}
export type TestOption = QuestionOption;

export interface Question {
  id: string;
  test_id: string;
  question_text: string;
  type: 'single_choice' | 'multiple_choice';
  order_index: number;
  points: number;
  options: QuestionOption[];
}
export type TestQuestion = Question;

export interface Test {
  id: string;
  recall_id: string;
  course_id: string;
  title: string;
  instructions: string;
  description?: string;
  xp_reward?: number;
  pass_score: number; // percentage (e.g. 70%)
  time_limit_seconds: number; // e.g. 300 (5 mins)
  attempts_allowed: number;
  published: boolean;
  questions: Question[];
  created_by: string;
  created_at: string;
}

export interface TestAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
  points_awarded: number;
}

export interface TestAttempt {
  id: string;
  test_id: string;
  user_id: string;
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
  answers: TestAnswer[];
  started_at: string;
  submitted_at: string;
}

export interface ProjectState {
  id: string;
  user_id: string;
  task_id?: string;
  name: string;
  files: Record<string, string>; // filename -> content
  active_file: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  task_id: string;
  user_id: string;
  project_id: string;
  project_files: Record<string, string>;
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  score: number;
  max_score: number;
  passed: boolean;
  feedback: string;
  auto_grade_results: {
    check_id: string;
    passed: boolean;
    message: string;
  }[];
  submitted_at: string;
  graded_at?: string;
}

export interface StudentProgress {
  id: string;
  user_id: string;
  course_id: string;
  recall_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  percent: number;
  completed_at?: string;
  updated_at: string;
}

export interface PresenceState {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  activity: ActivityType;
  last_seen: string;
  connected_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'recall' | 'task' | 'test' | 'grade' | 'announcement' | 'whatsapp';
  read_at: string | null;
  link_target?: {
    view: string;
    id?: string;
  };
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  tag: 'WhatsApp Session' | 'Platform Update' | 'Challenge' | 'General';
  published: boolean;
  created_by: string;
  created_at: string;
}

export interface AnalyticsDaily {
  date: string;
  registered_users: number;
  online_users: number;
  active_users: number;
  lessons_completed: number;
  tasks_submitted: number;
  tests_taken: number;
  code_lab_sessions: number;
}
