import { useState, useEffect } from 'react';
import {
  UserProfile,
  Course,
  LessonRecall,
  Task,
  Test,
  TestAttempt,
  ProjectState,
  Submission,
  StudentProgress,
  AppNotification,
  Announcement,
  PresenceState,
  AnalyticsDaily,
  ActivityType,
  isAdminEmail,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_COURSES,
  INITIAL_RECALLS,
  INITIAL_TASKS,
  INITIAL_TESTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROGRESS,
  INITIAL_SUBMISSIONS,
  INITIAL_PRESENCE,
  INITIAL_ANALYTICS,
} from '../data/mockDatabase';
import {
  db,
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from './firebase';

const STORAGE_KEYS = {
  PROFILES: 'l2c_profiles',
  COURSES: 'l2c_courses',
  RECALLS: 'l2c_recalls',
  TASKS: 'l2c_tasks',
  TESTS: 'l2c_tests',
  TEST_ATTEMPTS: 'l2c_test_attempts',
  PROJECTS: 'l2c_projects',
  SUBMISSIONS: 'l2c_submissions',
  PROGRESS: 'l2c_progress',
  NOTIFICATIONS: 'l2c_notifications',
  ANNOUNCEMENTS: 'l2c_announcements',
  PRESENCE: 'l2c_presence',
  CURRENT_USER_ID: 'l2c_active_user_id',
  SUPABASE_CONFIG: 'l2c_supabase_cfg',
  DB_VERSION: 'l2c_db_version',
};

const CURRENT_VERSION = 'v5_firebase_cloud_sync_realtime';

// Helper to strip undefined properties for Firestore compliance
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// Global real-time subscribers listener registry
type StorageListener = (entity?: string) => void;
const storageListeners = new Set<StorageListener>();

export function subscribeToStorage(listener: StorageListener): () => void {
  storageListeners.add(listener);
  return () => {
    storageListeners.delete(listener);
  };
}

export function useStorageSync(entityFilters?: string[]): number {
  const [version, setVersion] = useState(0);
  const filterKey = entityFilters ? entityFilters.slice().sort().join(',') : '';
  useEffect(() => {
    return subscribeToStorage((entity) => {
      // Never re-render whole views on presence heartbeat ticks
      if (entity === 'presence') return;
      if (!entityFilters || !entity || entityFilters.includes(entity)) {
        setVersion(v => v + 1);
      }
    });
  }, [filterKey]);
  return version;
}

function notifySubscribers(entity?: string) {
  storageListeners.forEach(cb => {
    try {
      cb(entity);
    } catch (e) {
      console.error('Storage subscriber error:', e);
    }
  });
}

// Auto-run cleanup if outdated legacy demo courses, profiles, or fake presence exist
(function autoCleanOutdatedStorage() {
  try {
    const version = localStorage.getItem(STORAGE_KEYS.DB_VERSION);
    if (version !== CURRENT_VERSION) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.RECALLS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.TEST_ATTEMPTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
      localStorage.setItem(STORAGE_KEYS.PRESENCE, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'usr_student_default');
      localStorage.setItem(STORAGE_KEYS.DB_VERSION, CURRENT_VERSION);
    }
  } catch (e) {
    // Ignore storage errors in restricted contexts
  }
})();

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultVal;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return defaultVal;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

let cloudSyncInitialized = false;
let cloudSyncStatus: 'connecting' | 'connected' | 'offline' = 'connecting';

export function getCloudSyncStatus(): 'connecting' | 'connected' | 'offline' {
  return cloudSyncStatus;
}

export const StorageService = {
  // Cloud Sync Real-time Initialization
  initCloudSync(): void {
    if (cloudSyncInitialized) return;
    cloudSyncInitialized = true;

    testFirestoreConnection().then(connected => {
      cloudSyncStatus = connected ? 'connected' : 'offline';
      notifySubscribers('status');
    });

    // 1. Sync Courses Realtime
    try {
      onSnapshot(
        collection(db, 'courses'),
        snapshot => {
          if (!snapshot.empty) {
            const cloudCourses: Course[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data() as Course;
              if (data && data.id) {
                cloudCourses.push(data);
              }
            });
            cloudCourses.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
            setStored(STORAGE_KEYS.COURSES, cloudCourses);
            notifySubscribers('courses');
          }
        },
        err => {
          handleFirestoreError(err, OperationType.GET, 'courses');
        }
      );
    } catch (e) {
      console.warn('Firestore courses sync error:', e);
    }

    // 2. Sync Recalls Realtime
    try {
      onSnapshot(
        collection(db, 'recalls'),
        snapshot => {
          if (!snapshot.empty) {
            const cloudRecalls: LessonRecall[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data() as LessonRecall;
              if (data && data.id) {
                cloudRecalls.push(data);
              }
            });
            cloudRecalls.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
            setStored(STORAGE_KEYS.RECALLS, cloudRecalls);
            notifySubscribers('recalls');
          }
        },
        err => {
          handleFirestoreError(err, OperationType.GET, 'recalls');
        }
      );
    } catch (e) {
      console.warn('Firestore recalls sync error:', e);
    }

    // 3. Sync Announcements Realtime
    try {
      onSnapshot(
        collection(db, 'announcements'),
        snapshot => {
          if (!snapshot.empty) {
            const cloudAnn: Announcement[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data() as Announcement;
              if (data && data.id) {
                cloudAnn.push(data);
              }
            });
            cloudAnn.sort(
              (a, b) =>
                new Date(b.created_at || '').getTime() -
                new Date(a.created_at || '').getTime()
            );
            setStored(STORAGE_KEYS.ANNOUNCEMENTS, cloudAnn);
            notifySubscribers('announcements');
          }
        },
        err => {
          handleFirestoreError(err, OperationType.GET, 'announcements');
        }
      );
    } catch (e) {
      console.warn('Firestore announcements sync error:', e);
    }

    // 4. Sync Tasks Realtime
    try {
      onSnapshot(
        collection(db, 'tasks'),
        snapshot => {
          if (!snapshot.empty) {
            const cloudTasks: Task[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data() as Task;
              if (data && data.id) {
                cloudTasks.push(data);
              }
            });
            setStored(STORAGE_KEYS.TASKS, cloudTasks);
            notifySubscribers('tasks');
          }
        },
        err => {
          handleFirestoreError(err, OperationType.GET, 'tasks');
        }
      );
    } catch (e) {
      console.warn('Firestore tasks sync error:', e);
    }

    // 5. Sync Tests Realtime
    try {
      onSnapshot(
        collection(db, 'tests'),
        snapshot => {
          if (!snapshot.empty) {
            const cloudTests: Test[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data() as Test;
              if (data && data.id) {
                cloudTests.push(data);
              }
            });
            setStored(STORAGE_KEYS.TESTS, cloudTests);
            notifySubscribers('tests');
          }
        },
        err => {
          handleFirestoreError(err, OperationType.GET, 'tests');
        }
      );
    } catch (e) {
      console.warn('Firestore tests sync error:', e);
    }

    // 6. Sync Submissions Realtime
    try {
      onSnapshot(
        collection(db, 'submissions'),
        snapshot => {
          if (!snapshot.empty) {
            const cloudSubs: Submission[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data() as Submission;
              if (data && data.id) {
                cloudSubs.push(data);
              }
            });
            setStored(STORAGE_KEYS.SUBMISSIONS, cloudSubs);
            notifySubscribers('submissions');
          }
        },
        err => {
          handleFirestoreError(err, OperationType.GET, 'submissions');
        }
      );
    } catch (e) {
      console.warn('Firestore submissions sync error:', e);
    }

    // 7. Sync Presence Realtime (Live Active Users across the web)
    try {
      onSnapshot(
        collection(db, 'presence'),
        snapshot => {
          const now = Date.now();
          const thresholdMs = 60 * 1000;
          const livePresence: PresenceState[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as PresenceState;
            if (data && data.last_seen) {
              const time = new Date(data.last_seen).getTime();
              if (!isNaN(time) && now - time <= thresholdMs) {
                livePresence.push(data);
              }
            }
          });
          setStored(STORAGE_KEYS.PRESENCE, livePresence);
          notifySubscribers('presence');
        },
        err => {
          handleFirestoreError(err, OperationType.GET, 'presence');
        }
      );
    } catch (e) {
      console.warn('Firestore presence sync error:', e);
    }

    // 8. Sync Profiles Realtime
    try {
      onSnapshot(
        collection(db, 'profiles'),
        snapshot => {
          if (!snapshot.empty) {
            const cloudProfiles: UserProfile[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data() as UserProfile;
              if (data && data.id) {
                cloudProfiles.push(data);
              }
            });
            setStored(STORAGE_KEYS.PROFILES, cloudProfiles);
            notifySubscribers('profiles');
          }
        },
        err => {
          handleFirestoreError(err, OperationType.GET, 'profiles');
        }
      );
    } catch (e) {
      console.warn('Firestore profiles sync error:', e);
    }

    // 9. Sync Student Progress Realtime
    try {
      onSnapshot(
        collection(db, 'progress'),
        snapshot => {
          if (!snapshot.empty) {
            const cloudProgress: StudentProgress[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data() as StudentProgress;
              if (data && data.id) {
                cloudProgress.push(data);
              }
            });
            setStored(STORAGE_KEYS.PROGRESS, cloudProgress);
            notifySubscribers('progress');
          }
        },
        err => {
          handleFirestoreError(err, OperationType.GET, 'progress');
        }
      );
    } catch (e) {
      console.warn('Firestore progress sync error:', e);
    }

    // 10. Sync Test Attempts Realtime
    try {
      onSnapshot(
        collection(db, 'test_attempts'),
        snapshot => {
          if (!snapshot.empty) {
            const cloudAttempts: TestAttempt[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data() as TestAttempt;
              if (data && data.id) {
                cloudAttempts.push(data);
              }
            });
            setStored(STORAGE_KEYS.TEST_ATTEMPTS, cloudAttempts);
            notifySubscribers('tests');
          }
        },
        err => {
          handleFirestoreError(err, OperationType.GET, 'test_attempts');
        }
      );
    } catch (e) {
      console.warn('Firestore test attempts sync error:', e);
    }
  },

  subscribe: subscribeToStorage,

  // Profiles & Auth
  getProfiles(): UserProfile[] {
    return getStored<UserProfile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  },

  getProfile(id: string): UserProfile | undefined {
    return this.getProfiles().find(p => p.id === id);
  },

  saveProfile(profile: UserProfile): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);
    const now = new Date().toISOString();
    let updatedProfile: UserProfile;
    if (index >= 0) {
      updatedProfile = { ...profile, updated_at: now };
      profiles[index] = updatedProfile;
    } else {
      updatedProfile = { ...profile, created_at: now, updated_at: now };
      profiles.push(updatedProfile);
    }
    setStored(STORAGE_KEYS.PROFILES, profiles);
    notifySubscribers('profiles');

    // Sync to Firestore
    try {
      setDoc(doc(db, 'profiles', updatedProfile.id), sanitizeForFirestore(updatedProfile)).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `profiles/${updatedProfile.id}`);
      });
    } catch (e) {
      console.warn('Cloud write error profile:', e);
    }
  },

  getCurrentUserId(): string {
    return getStored<string>(STORAGE_KEYS.CURRENT_USER_ID, 'usr_student_default');
  },

  setCurrentUserId(id: string): void {
    setStored(STORAGE_KEYS.CURRENT_USER_ID, id);
  },

  // Real Day Streak calculation based on actual calendar days
  recordDailyActivity(userId: string): number {
    const profile = this.getProfile(userId);
    if (!profile) return 1;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = profile.last_active_date;

    if (lastActive === today) {
      return profile.streak_days || 1;
    }

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const currentDate = new Date(today);
      const diffTime = currentDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        profile.streak_days = (profile.streak_days || 0) + 1;
      } else if (diffDays > 1) {
        profile.streak_days = 1;
      }
    } else {
      profile.streak_days = 1;
    }

    profile.last_active_date = today;
    this.saveProfile(profile);
    return profile.streak_days;
  },

  // Real XP awarding (starts from 0, only earned by real actions)
  awardXP(userId: string, points: number, reason?: string): void {
    if (points <= 0) return;
    const profile = this.getProfile(userId);
    if (!profile) return;

    profile.xp_points = (profile.xp_points || 0) + points;
    this.saveProfile(profile);

    this.addNotification({
      user_id: userId,
      type: 'announcement',
      title: `+${points} XP Earned!`,
      body: reason || `You earned ${points} XP towards your mastery.`,
      read_at: null,
    });
  },

  // Courses
  getCourses(): Course[] {
    return getStored<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  },

  getCourse(id: string): Course | undefined {
    return this.getCourses().find(c => c.id === id);
  },

  saveCourse(course: Course): Course {
    const courses = this.getCourses();
    const existingIndex = courses.findIndex(c => c.id === course.id);
    const now = new Date().toISOString();
    let updatedCourse: Course;
    if (existingIndex >= 0) {
      updatedCourse = { ...course, updated_at: now };
      courses[existingIndex] = updatedCourse;
    } else {
      updatedCourse = {
        ...course,
        created_at: now,
        updated_at: now,
      };
      courses.unshift(updatedCourse);
    }
    setStored(STORAGE_KEYS.COURSES, courses);
    notifySubscribers('courses');

    // Sync to Firestore cloud
    try {
      setDoc(doc(db, 'courses', updatedCourse.id), sanitizeForFirestore(updatedCourse)).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `courses/${updatedCourse.id}`);
      });
    } catch (e) {
      console.warn('Cloud sync error saving course:', e);
    }

    return updatedCourse;
  },

  deleteCourse(courseId: string): void {
    const courses = this.getCourses().filter(c => c.id !== courseId);
    setStored(STORAGE_KEYS.COURSES, courses);
    notifySubscribers('courses');

    // Sync deletion to Firestore cloud
    try {
      deleteDoc(doc(db, 'courses', courseId)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `courses/${courseId}`);
      });
    } catch (e) {
      console.warn('Cloud sync error deleting course:', e);
    }

    // Clean linked recalls, tasks, tests
    const recalls = this.getRecalls().filter(r => r.course_id !== courseId);
    setStored(STORAGE_KEYS.RECALLS, recalls);

    const tasks = this.getTasks().filter(t => t.course_id !== courseId);
    setStored(STORAGE_KEYS.TASKS, tasks);

    const tests = this.getTests().filter(t => t.course_id !== courseId);
    setStored(STORAGE_KEYS.TESTS, tests);
  },

  deleteRecall(recallId: string): void {
    const recalls = this.getRecalls().filter(r => r.id !== recallId);
    setStored(STORAGE_KEYS.RECALLS, recalls);
    notifySubscribers('recalls');

    try {
      deleteDoc(doc(db, 'recalls', recallId)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `recalls/${recallId}`);
      });
    } catch (e) {
      console.warn('Cloud sync error deleting recall:', e);
    }
  },

  deleteTask(taskId: string): void {
    const tasks = this.getTasks().filter(t => t.id !== taskId);
    setStored(STORAGE_KEYS.TASKS, tasks);
    notifySubscribers('tasks');

    try {
      deleteDoc(doc(db, 'tasks', taskId)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `tasks/${taskId}`);
      });
    } catch (e) {
      console.warn('Cloud sync error deleting task:', e);
    }
  },

  deleteTest(testId: string): void {
    const tests = this.getTests().filter(t => t.id !== testId);
    setStored(STORAGE_KEYS.TESTS, tests);
    notifySubscribers('tests');

    try {
      deleteDoc(doc(db, 'tests', testId)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `tests/${testId}`);
      });
    } catch (e) {
      console.warn('Cloud sync error deleting test:', e);
    }
  },

  // Lesson Recalls
  getRecalls(courseId?: string): LessonRecall[] {
    const all = getStored<LessonRecall[]>(STORAGE_KEYS.RECALLS, INITIAL_RECALLS);
    if (!courseId) return all;
    return all.filter(r => r.course_id === courseId);
  },

  getRecall(id: string): LessonRecall | undefined {
    return this.getRecalls().find(r => r.id === id);
  },

  saveRecall(recall: LessonRecall): LessonRecall {
    const recalls = this.getRecalls();
    const index = recalls.findIndex(r => r.id === recall.id);
    const now = new Date().toISOString();
    let updatedRecall: LessonRecall;
    if (index >= 0) {
      updatedRecall = { ...recall, updated_at: now };
      recalls[index] = updatedRecall;
    } else {
      updatedRecall = { ...recall, created_at: now, updated_at: now };
      recalls.unshift(updatedRecall);
    }
    setStored(STORAGE_KEYS.RECALLS, recalls);
    notifySubscribers('recalls');

    try {
      setDoc(doc(db, 'recalls', updatedRecall.id), sanitizeForFirestore(updatedRecall)).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `recalls/${updatedRecall.id}`);
      });
    } catch (e) {
      console.warn('Cloud sync error saving recall:', e);
    }

    return updatedRecall;
  },

  // Tasks
  getTasks(courseId?: string): Task[] {
    const all = getStored<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    if (!courseId) return all;
    return all.filter(t => t.course_id === courseId);
  },

  getTask(id: string): Task | undefined {
    return this.getTasks().find(t => t.id === id);
  },

  saveTask(task: Task): Task {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    const now = new Date().toISOString();
    let updatedTask: Task;
    if (index >= 0) {
      updatedTask = { ...task, updated_at: now };
      tasks[index] = updatedTask;
    } else {
      updatedTask = { ...task, created_at: now, updated_at: now };
      tasks.unshift(updatedTask);
    }
    setStored(STORAGE_KEYS.TASKS, tasks);
    notifySubscribers('tasks');

    try {
      setDoc(doc(db, 'tasks', updatedTask.id), sanitizeForFirestore(updatedTask)).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `tasks/${updatedTask.id}`);
      });
    } catch (e) {
      console.warn('Cloud sync error saving task:', e);
    }

    return updatedTask;
  },

  // Tests / Quizzes
  getTests(courseId?: string): Test[] {
    const all = getStored<Test[]>(STORAGE_KEYS.TESTS, INITIAL_TESTS);
    if (!courseId) return all;
    return all.filter(t => t.course_id === courseId);
  },

  getTest(id: string): Test | undefined {
    return this.getTests().find(t => t.id === id);
  },

  saveTest(test: Test): Test {
    const tests = this.getTests();
    const index = tests.findIndex(t => t.id === test.id);
    if (index >= 0) {
      tests[index] = test;
    } else {
      tests.unshift(test);
    }
    setStored(STORAGE_KEYS.TESTS, tests);
    notifySubscribers('tests');

    try {
      setDoc(doc(db, 'tests', test.id), sanitizeForFirestore(test)).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `tests/${test.id}`);
      });
    } catch (e) {
      console.warn('Cloud sync error saving test:', e);
    }

    return test;
  },

  // Test Attempts
  getTestAttempts(userId?: string): TestAttempt[] {
    const all = getStored<TestAttempt[]>(STORAGE_KEYS.TEST_ATTEMPTS, []);
    if (!userId) return all;
    return all.filter(a => a.user_id === userId);
  },

  saveTestAttempt(attempt: TestAttempt): void {
    const attempts = this.getTestAttempts();
    attempts.unshift(attempt);
    setStored(STORAGE_KEYS.TEST_ATTEMPTS, attempts);
    notifySubscribers('tests');

    // Sync to Firestore
    try {
      setDoc(doc(db, 'test_attempts', attempt.id), sanitizeForFirestore(attempt)).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `test_attempts/${attempt.id}`);
      });
    } catch (e) {
      console.warn('Cloud sync error test attempt:', e);
    }

    // If passed, award XP to profile
    if (attempt.passed) {
      const profile = this.getProfile(attempt.user_id);
      if (profile) {
        profile.xp_points += attempt.score;
        this.saveProfile(profile);
      }
    }
  },

  // Projects (Code Lab State)
  getProjects(userId: string): ProjectState[] {
    const all = getStored<ProjectState[]>(STORAGE_KEYS.PROJECTS, []);
    return all.filter(p => p.user_id === userId);
  },

  getProject(id: string): ProjectState | undefined {
    const all = getStored<ProjectState[]>(STORAGE_KEYS.PROJECTS, []);
    return all.find(p => p.id === id);
  },

  saveProject(project: ProjectState): ProjectState {
    const all = getStored<ProjectState[]>(STORAGE_KEYS.PROJECTS, []);
    const index = all.findIndex(p => p.id === project.id);
    const now = new Date().toISOString();
    if (index >= 0) {
      all[index] = { ...project, updated_at: now };
    } else {
      all.unshift({ ...project, created_at: now, updated_at: now });
    }
    setStored(STORAGE_KEYS.PROJECTS, all);
    return project;
  },

  deleteProject(id: string): void {
    const all = getStored<ProjectState[]>(STORAGE_KEYS.PROJECTS, []);
    const filtered = all.filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PROJECTS, filtered);
  },

  // Submissions
  getSubmissions(userId?: string, taskId?: string): Submission[] {
    let all = getStored<Submission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    if (userId) {
      all = all.filter(s => s.user_id === userId);
    }
    if (taskId) {
      all = all.filter(s => s.task_id === taskId);
    }
    return all;
  },

  saveSubmission(submission: Submission): Submission {
    const all = getStored<Submission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    const index = all.findIndex(s => s.id === submission.id);
    if (index >= 0) {
      all[index] = submission;
    } else {
      all.unshift(submission);
    }
    setStored(STORAGE_KEYS.SUBMISSIONS, all);
    notifySubscribers('submissions');

    // Sync to Firestore
    try {
      setDoc(doc(db, 'submissions', submission.id), sanitizeForFirestore(submission)).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `submissions/${submission.id}`);
      });
    } catch (e) {
      console.warn('Cloud write error submission:', e);
    }

    // Update student progress and XP if passed
    if (submission.passed) {
      const profile = this.getProfile(submission.user_id);
      if (profile) {
        profile.xp_points += submission.score;
        this.saveProfile(profile);
      }
    }

    return submission;
  },

  // Progress
  getProgress(userId?: string): StudentProgress[] {
    const all = getStored<StudentProgress[]>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
    if (!userId) return all;
    return all.filter(p => p.user_id === userId);
  },

  updateProgress(userId: string, courseId: string, recallId: string, percent: number): void {
    const all = getStored<StudentProgress[]>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
    const index = all.findIndex(p => p.user_id === userId && p.recall_id === recallId);
    const now = new Date().toISOString();
    const status = percent >= 100 ? 'completed' : percent > 0 ? 'in_progress' : 'not_started';

    let item: StudentProgress;
    if (index >= 0) {
      item = {
        ...all[index],
        percent: Math.max(all[index].percent, percent),
        status: percent >= 100 ? 'completed' : all[index].status,
        completed_at: percent >= 100 ? (all[index].completed_at || now) : undefined,
        updated_at: now,
      };
      all[index] = item;
    } else {
      item = {
        id: `prog_${Date.now()}`,
        user_id: userId,
        course_id: courseId,
        recall_id: recallId,
        status,
        percent,
        completed_at: percent >= 100 ? now : undefined,
        updated_at: now,
      };
      all.push(item);
    }
    setStored(STORAGE_KEYS.PROGRESS, all);
    notifySubscribers('progress');

    // Sync to Firestore
    try {
      setDoc(doc(db, 'progress', item.id), sanitizeForFirestore(item)).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `progress/${item.id}`);
      });
    } catch (e) {
      console.warn('Cloud sync error progress:', e);
    }
  },

  // Notifications
  getNotifications(userId: string): AppNotification[] {
    const all = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return all.filter(n => n.user_id === userId);
  },

  markNotificationRead(id: string): void {
    const all = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const notif = all.find(n => n.id === id);
    if (notif) {
      notif.read_at = new Date().toISOString();
      setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  },

  markAllNotificationsRead(userId: string): void {
    const all = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const now = new Date().toISOString();
    all.forEach(n => {
      if (n.user_id === userId) {
        n.read_at = now;
      }
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'created_at'>): AppNotification {
    const all = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    all.unshift(newNotif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    return newNotif;
  },

  saveNotification(notif: Partial<AppNotification>): AppNotification {
    return this.addNotification({
      user_id: notif.user_id || 'broadcast',
      title: notif.title || 'Notification',
      body: notif.body || '',
      type: notif.type || 'announcement',
      read_at: null,
      link_target: notif.link_target,
    });
  },

  // Announcements
  getAnnouncements(): Announcement[] {
    return getStored<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  },

  addAnnouncement(ann: Omit<Announcement, 'id' | 'created_at'>): Announcement {
    const all = this.getAnnouncements();
    const newAnn: Announcement = {
      ...ann,
      id: `ann_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    all.unshift(newAnn);
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, all);
    notifySubscribers('announcements');

    // Broadcast live across the web through Firestore
    try {
      setDoc(doc(db, 'announcements', newAnn.id), sanitizeForFirestore(newAnn)).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `announcements/${newAnn.id}`);
      });
    } catch (e) {
      console.warn('Cloud sync error broadcasting announcement:', e);
    }

    return newAnn;
  },

  deleteAnnouncement(annId: string): void {
    const all = this.getAnnouncements().filter(a => a.id !== annId);
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, all);
    notifySubscribers('announcements');

    try {
      deleteDoc(doc(db, 'announcements', annId)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `announcements/${annId}`);
      });
    } catch (e) {
      console.warn('Cloud sync error deleting announcement:', e);
    }
  },

  // Presence & Heartbeat - strictly real active people (no false online users)
  getPresence(): PresenceState[] {
    const list = getStored<PresenceState[]>(STORAGE_KEYS.PRESENCE, INITIAL_PRESENCE);
    const now = Date.now();
    const thresholdMs = 60 * 1000; // 60 seconds heartbeat window
    // Filter strictly genuine users who were active within the last 60 seconds
    const active = list.filter(p => {
      if (!p || !p.last_seen) return false;
      const time = new Date(p.last_seen).getTime();
      return !isNaN(time) && (now - time) <= thresholdMs;
    });
    return active;
  },

  updateUserPresence(user: UserProfile, activity: ActivityType): void {
    if (!user || !user.id) return;
    const list = this.getPresence();
    const now = new Date().toISOString();
    const idx = list.findIndex(p => p.user_id === user.id);
    let item: PresenceState;
    if (idx >= 0) {
      item = {
        ...list[idx],
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        activity,
        last_seen: now,
      };
      list[idx] = item;
    } else {
      item = {
        id: `pres_${user.id}`,
        user_id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        activity,
        last_seen: now,
        connected_at: now,
      };
      list.push(item);
    }
    setStored(STORAGE_KEYS.PRESENCE, list);
    notifySubscribers('presence');

    // Sync presence to Firestore
    try {
      setDoc(doc(db, 'presence', user.id), sanitizeForFirestore(item)).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `presence/${user.id}`);
      });
    } catch (e) {
      console.warn('Cloud sync error updating presence:', e);
    }
  },

  removeUserPresence(userId: string): void {
    const list = this.getPresence().filter(p => p.user_id !== userId);
    setStored(STORAGE_KEYS.PRESENCE, list);
    notifySubscribers('presence');

    try {
      deleteDoc(doc(db, 'presence', userId)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `presence/${userId}`);
      });
    } catch (e) {
      console.warn('Cloud sync error removing presence:', e);
    }
  },

  getAnalytics(): AnalyticsDaily {
    const presence = this.getPresence();
    const profiles = this.getProfiles();
    const submissions = this.getSubmissions();
    const attempts = this.getTestAttempts();
    const progress = this.getProgress();

    return {
      date: new Date().toISOString().split('T')[0],
      registered_users: profiles.length,
      online_users: presence.length,
      active_users: profiles.length,
      lessons_completed: progress.filter(p => p.status === 'completed').length,
      tasks_submitted: submissions.length,
      tests_taken: attempts.length,
      code_lab_sessions: submissions.length + attempts.length,
    };
  },

  // Automated Task Grading Engine
  gradeTaskSolution(task: Task, files: Record<string, string>): {
    score: number;
    maxScore: number;
    passed: boolean;
    feedback: string;
    results: { check_id: string; passed: boolean; message: string }[];
  } {
    const html = files['index.html'] || '';
    const css = files['style.css'] || '';
    const js = files['script.js'] || '';

    // Create sandbox DOM parser
    let doc: Document | null = null;
    try {
      const parser = new DOMParser();
      doc = parser.parseFromString(html, 'text/html');
    } catch {
      doc = null;
    }

    const results = task.requirements.map(req => {
      let passed = false;
      let message = '';

      if (!doc) {
        return {
          check_id: req.id,
          passed: false,
          message: 'HTML document parsing failed',
        };
      }

      if (req.target === 'header') {
        const header = doc.querySelector('header');
        passed = !!header;
        message = passed ? 'Semantic <header> element found' : 'Missing <header> element';
      } else if (req.target === 'h1') {
        const h1 = doc.querySelector('h1');
        passed = !!h1 && (h1.textContent || '').trim().length > 0;
        message = passed ? `Heading <h1> found: "${h1?.textContent?.trim()}"` : 'Missing <h1> element with text';
      } else if (req.target === 'img[alt]') {
        const img = doc.querySelector('img');
        passed = !!img && (img.getAttribute('alt') || '').trim().length > 0;
        message = passed ? `Image found with alt="${img?.getAttribute('alt')}"` : 'Missing <img> with alt attribute';
      } else if (req.target === 'button#connect-btn') {
        const btn = doc.querySelector('button#connect-btn') || doc.querySelector('button');
        passed = !!btn;
        message = passed ? 'Action button element found' : 'Missing <button id="connect-btn">';
      } else if (req.target === 'nav') {
        const nav = doc.querySelector('nav');
        passed = !!nav;
        message = passed ? 'Semantic <nav> element found' : 'Missing <nav> element';
      } else if (req.target === '#logo') {
        const logo = doc.querySelector('#logo') || doc.querySelector('.logo');
        passed = !!logo;
        message = passed ? 'Logo element found' : 'Missing element with id="logo"';
      } else if (req.target === '.card') {
        const cards = doc.querySelectorAll('.card');
        passed = cards.length >= 2 || html.includes('card');
        message = passed ? `Found card elements (${cards.length})` : 'Missing card elements with class .card';
      } else {
        // Generic fallback check in HTML or CSS
        const lowerHtml = html.toLowerCase();
        const lowerTarget = req.target.toLowerCase();
        passed = lowerHtml.includes(lowerTarget) || css.toLowerCase().includes(lowerTarget);
        message = passed ? `Requirement satisfied: ${req.description}` : `Could not verify: ${req.description}`;
      }

      return {
        check_id: req.id,
        passed,
        message,
      };
    });

    const passedChecks = results.filter(r => r.passed).length;
    const totalChecks = Math.max(results.length, 1);
    const score = Math.round((passedChecks / totalChecks) * task.points);
    const passed = (score / task.points) >= 0.7;

    const feedback = passed
      ? `Terrific job! You passed ${passedChecks}/${totalChecks} automated requirement checks. Points awarded: ${score}/${task.points}. Keep up the great work in the WhatsApp class!`
      : `You completed ${passedChecks}/${totalChecks} checks. Review the failed items and check the hints to resubmit!`;

    return {
      score,
      maxScore: task.points,
      passed,
      feedback,
      results,
    };
  },

  // Plan A: Supabase SQL Schema and RLS Code Generator
  getSupabaseSchemaSql(): string {
    return `-- ===================================================
-- LEARN2CODE: SUPABASE POSTGRESQL SCHEMA (PLAN A)
-- Generated for Learn2Code Educational Platform
-- ===================================================

-- 1. Create Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  streak_days INT DEFAULT 0,
  xp_points INT DEFAULT 0,
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  badge_color TEXT DEFAULT 'from-blue-600 to-indigo-600',
  status TEXT CHECK (status IN ('published', 'draft', 'archived')) DEFAULT 'published',
  order_index INT DEFAULT 1,
  level TEXT DEFAULT 'Beginner',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Lesson Recalls table
CREATE TABLE IF NOT EXISTS public.lesson_recalls (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  whatsapp_session_title TEXT NOT NULL,
  whatsapp_date TEXT NOT NULL,
  body TEXT NOT NULL,
  key_takeaways TEXT[],
  published BOOLEAN DEFAULT true,
  order_index INT DEFAULT 1,
  task_id TEXT,
  test_id TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  recall_id TEXT REFERENCES public.lesson_recalls(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  points INT DEFAULT 50,
  starter_code JSONB,
  auto_grade_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Tests & Questions
CREATE TABLE IF NOT EXISTS public.tests (
  id TEXT PRIMARY KEY,
  recall_id TEXT REFERENCES public.lesson_recalls(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  pass_score INT DEFAULT 75,
  time_limit_seconds INT DEFAULT 300,
  attempts_allowed INT DEFAULT 3,
  published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  test_id TEXT REFERENCES public.tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  type TEXT DEFAULT 'single_choice',
  order_index INT DEFAULT 1,
  points INT DEFAULT 25,
  options JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 6. Submissions & Code Lab Projects
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id TEXT,
  project_files JSONB NOT NULL,
  status TEXT CHECK (status IN ('draft', 'submitted', 'graded', 'returned')) DEFAULT 'submitted',
  score INT DEFAULT 0,
  max_score INT DEFAULT 50,
  passed BOOLEAN DEFAULT false,
  feedback TEXT,
  auto_grade_results JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id TEXT,
  name TEXT NOT NULL,
  files JSONB NOT NULL,
  active_file TEXT DEFAULT 'index.html',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Progress & Presence
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  recall_id TEXT REFERENCES public.lesson_recalls(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'in_progress',
  percent INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity TEXT DEFAULT 'idle',
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_recalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, self write
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = auth_user_id);

-- Courses, Recalls, Tasks, Tests: Viewable by all authenticated/anon students
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (status = 'published');
CREATE POLICY "Recalls viewable by everyone" ON public.lesson_recalls FOR SELECT USING (published = true);
CREATE POLICY "Tasks viewable by everyone" ON public.tasks FOR SELECT USING (published = true);
CREATE POLICY "Tests viewable by everyone" ON public.tests FOR SELECT USING (published = true);

-- Admin creation policies (Only role = 'admin' or 'teacher')
CREATE POLICY "Admins can insert courses" ON public.courses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'teacher'))
);
CREATE POLICY "Admins can insert recalls" ON public.lesson_recalls FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'teacher'))
);
CREATE POLICY "Admins can insert tasks" ON public.tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'teacher'))
);

-- Submissions & Projects: Students only see/edit their own
CREATE POLICY "Users can view own submissions" ON public.submissions FOR SELECT USING (
  user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'teacher'))
);
CREATE POLICY "Users can insert own submissions" ON public.submissions FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Users manage own projects" ON public.projects FOR ALL USING (
  user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Users manage own progress" ON public.progress FOR ALL USING (
  user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);
`;
  },
};
