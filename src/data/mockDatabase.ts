import {
  UserProfile,
  Course,
  LessonRecall,
  Task,
  Test,
  Submission,
  StudentProgress,
  AppNotification,
  Announcement,
  PresenceState,
  AnalyticsDaily,
} from '../types';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'usr_admin_eunice',
    auth_user_id: 'auth_eunice',
    username: 'eunice_admin',
    display_name: 'Eunice Ajayi (Admin)',
    avatar_url: '',
    role: 'admin',
    bio: 'Lead Instructor & Administrator at Learn2Code.',
    email: 'euniceajayi2010@gmail.com',
    streak_days: 1,
    xp_points: 0,
    whatsapp_number: '',
    last_active_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'usr_admin_emmanuel',
    auth_user_id: 'auth_emmanuel',
    username: 'emmanuel_admin',
    display_name: 'Emmanuel Bobi (Admin)',
    avatar_url: '',
    role: 'admin',
    bio: 'Instructor & Administrator at Learn2Code.',
    email: 'emmanuelbobi2011@gmail.com',
    streak_days: 1,
    xp_points: 0,
    whatsapp_number: '',
    last_active_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'usr_student_default',
    auth_user_id: 'auth_student_learner',
    username: 'student_learner',
    display_name: 'Student Learner',
    avatar_url: '',
    role: 'student',
    bio: 'Coding student learning web development on Learn2Code.',
    email: 'student@learn2code.org',
    streak_days: 1,
    xp_points: 0,
    whatsapp_number: '',
    last_active_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// No pre-seeded courses: Admin creates their own courses via the form
export const INITIAL_COURSES: Course[] = [];

export const INITIAL_RECALLS: LessonRecall[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_TESTS: Test[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_welcome',
    title: 'Welcome to Learn2Code Companion Hub!',
    body: 'Join our WhatsApp live sessions. Instructors can create courses, attach video/slides/presentations/gifs, and write practical tasks and quizzes for students.',
    tag: 'Platform Update',
    published: true,
    created_by: 'usr_admin_eunice',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_PROGRESS: StudentProgress[] = [];

export const INITIAL_SUBMISSIONS: Submission[] = [];

// No false presence - presence is generated dynamically ONLY by real live sessions
export const INITIAL_PRESENCE: PresenceState[] = [];

export const INITIAL_ANALYTICS: AnalyticsDaily = {
  date: new Date().toISOString().split('T')[0],
  registered_users: 3,
  online_users: 1,
  active_users: 1,
  lessons_completed: 0,
  tasks_submitted: 0,
  tests_taken: 0,
  code_lab_sessions: 0,
};
