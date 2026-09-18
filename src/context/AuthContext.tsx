import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Role, ActivityType, PresenceState, isAdminEmail } from '../types';
import { StorageService } from '../services/storage';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  firebaseUpdateProfile,
  signInWithPopup,
  FirebaseUser,
} from '../services/firebase';

interface AuthContextType {
  currentUser: UserProfile;
  firebaseUser: FirebaseUser | null;
  profiles: UserProfile[];
  presenceList: PresenceState[];
  currentActivity: ActivityType;
  isAdmin: boolean;
  isOnline: boolean;
  isAuthenticating: boolean;
  setActivity: (activity: ActivityType) => void;
  switchUser: (userId: string) => void;
  updateCurrentUser: (updated: Partial<UserProfile>) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  signUp: (email: string, password?: string, displayName?: string, avatarUrl?: string, whatsapp?: string) => Promise<UserProfile | null>;
  signIn: (email: string, password?: string) => Promise<UserProfile | null>;
  signInWithGoogle: () => Promise<UserProfile | null>;
  loginAs: (role: Role) => void;
  logout: () => Promise<void>;
  refreshProfiles: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (val: boolean) => void;
  showComingSoonModal: boolean;
  setShowComingSoonModal: (val: boolean) => void;
  comingSoonTitle: string;
  triggerComingSoon: (title: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => StorageService.getProfiles());
  const [currentUserId, setCurrentUserId] = useState<string>(() => StorageService.getCurrentUserId());
  const [currentActivity, setCurrentActivityState] = useState<ActivityType>('learning');
  const [presenceList, setPresenceList] = useState<PresenceState[]>(() => StorageService.getPresence());
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState('Google Authentication');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentUser = profiles.find(p => p.id === currentUserId) || profiles.find(p => p.id === 'usr_student_default') || profiles[0];
  // Strictly enforce: ONLY registered admin emails are eligible for Admin role
  const isAdmin = !!(currentUser && isAdminEmail(currentUser.email));

  const refreshProfiles = useCallback(() => {
    const updated = StorageService.getProfiles();
    setProfiles(updated);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Helper to resolve or sync a UserProfile when authenticated with Firebase
  const syncFirebaseUserToProfile = useCallback((fbUser: FirebaseUser, extraData?: { displayName?: string; avatarUrl?: string; whatsapp?: string }): UserProfile => {
    const cleanEmail = (fbUser.email || '').trim().toLowerCase();
    const isSystemAdmin = isAdminEmail(cleanEmail);
    const existingProfiles = StorageService.getProfiles();
    
    // Look up by auth_user_id or email
    let profile = existingProfiles.find(p => p.auth_user_id === fbUser.uid || p.email.toLowerCase() === cleanEmail);

    const displayName = extraData?.displayName || fbUser.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Learner');
    const avatarUrl = extraData?.avatarUrl || fbUser.photoURL || '';
    const now = new Date().toISOString();

    if (profile) {
      profile.auth_user_id = fbUser.uid;
      profile.email = cleanEmail;
      if (displayName) profile.display_name = displayName;
      if (avatarUrl) profile.avatar_url = avatarUrl;
      if (extraData?.whatsapp) profile.whatsapp_number = extraData.whatsapp;
      // Admin enforcement
      profile.role = isSystemAdmin ? 'admin' : 'student';
      profile.last_active_date = now.split('T')[0];
      profile.updated_at = now;
      StorageService.saveProfile(profile);
    } else {
      const id = isSystemAdmin
        ? (cleanEmail.includes('eunice') ? 'usr_admin_eunice' : 'usr_admin_emmanuel')
        : `usr_${fbUser.uid.slice(0, 12)}`;

      profile = {
        id,
        auth_user_id: fbUser.uid,
        username: (displayName || cleanEmail.split('@')[0] || 'student')
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, ''),
        display_name: isSystemAdmin
          ? (cleanEmail.includes('eunice') ? 'Eunice Ajayi (Admin)' : 'Emmanuel Bobi (Admin)')
          : displayName,
        avatar_url: avatarUrl,
        role: isSystemAdmin ? 'admin' : 'student',
        bio: isSystemAdmin
          ? 'Platform Administrator & Lead Instructor at Learn2Code'
          : 'Enthusiastic Learner on Learn2Code Community Hub',
        email: cleanEmail,
        streak_days: 1,
        xp_points: 0,
        whatsapp_number: extraData?.whatsapp || '',
        last_active_date: now.split('T')[0],
        created_at: now,
        updated_at: now,
      };
      StorageService.saveProfile(profile);
    }

    setCurrentUserId(profile.id);
    StorageService.setCurrentUserId(profile.id);
    StorageService.recordDailyActivity(profile.id);
    StorageService.updateUserPresence(profile, 'learning');
    refreshProfiles();
    return profile;
  }, [refreshProfiles]);

  // Listen to real Firebase Auth State changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        syncFirebaseUserToProfile(user);
      }
    });

    return () => unsubscribe();
  }, [syncFirebaseUserToProfile]);

  // Record daily streak on user launch/session
  useEffect(() => {
    if (currentUser?.id) {
      StorageService.recordDailyActivity(currentUser.id);
    }
  }, [currentUser?.id]);

  const triggerComingSoon = useCallback((title: string) => {
    setComingSoonTitle(title);
    setShowComingSoonModal(true);
  }, []);

  const setActivity = useCallback((activity: ActivityType) => {
    setCurrentActivityState(activity);
    if (currentUser) {
      StorageService.updateUserPresence(currentUser, activity);
      setPresenceList(StorageService.getPresence());
    }
  }, [currentUser]);

  // Presence heartbeat every 20 seconds
  useEffect(() => {
    if (!currentUser?.id) return;
    StorageService.updateUserPresence(currentUser, currentActivity);
    setPresenceList(StorageService.getPresence());

    const interval = setInterval(() => {
      const latest = StorageService.getProfile(currentUser.id) || currentUser;
      StorageService.updateUserPresence(latest, currentActivity);
      setPresenceList(StorageService.getPresence());
    }, 20000);

    return () => clearInterval(interval);
  }, [currentUser?.id, currentActivity]);

  const switchUser = useCallback((userId: string) => {
    const target = StorageService.getProfile(userId);
    if (target) {
      setCurrentUserId(userId);
      StorageService.setCurrentUserId(userId);
      StorageService.recordDailyActivity(userId);
      StorageService.updateUserPresence(target, currentActivity);
      setPresenceList(StorageService.getPresence());
      refreshProfiles();
      showToast(`Active account: ${target.display_name} (${isAdminEmail(target.email) ? 'ADMIN' : 'STUDENT'})`);
    }
  }, [currentActivity, showToast, refreshProfiles]);

  // REAL Firebase Sign Up (Email & Password)
  const signUp = useCallback(
    async (
      email: string,
      password = 'Learn2Code2026!',
      displayName = '',
      avatarUrl = '',
      whatsapp = ''
    ): Promise<UserProfile | null> => {
      setIsAuthenticating(true);
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = displayName.trim() || cleanEmail.split('@')[0];
      const validPassword = password.length >= 6 ? password : `${password}2026!`;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, validPassword);
        const fbUser = userCredential.user;

        // Update profile in Firebase Auth
        try {
          await firebaseUpdateProfile(fbUser, {
            displayName: cleanName,
            photoURL: avatarUrl.trim() || undefined,
          });
        } catch (updateErr) {
          console.warn('Firebase profile name update warning:', updateErr);
        }

        const profile = syncFirebaseUserToProfile(fbUser, {
          displayName: cleanName,
          avatarUrl: avatarUrl.trim(),
          whatsapp: whatsapp.trim(),
        });

        if (isAdminEmail(cleanEmail)) {
          showToast(`Firebase Account Created! Welcome, Instructor ${profile.display_name}.`);
        } else {
          showToast(`Account registered on Firebase! Welcome, ${profile.display_name}.`);
        }
        return profile;
      } catch (err: any) {
        console.error('Firebase SignUp error:', err);
        // If email already in use, attempt automatic sign-in or fallback gracefully
        if (err?.code === 'auth/email-already-in-use') {
          showToast('Email is already registered! Signing in with credentials...');
          return signIn(cleanEmail, validPassword);
        } else {
          const message = err?.message?.replace('Firebase: ', '') || 'Failed to create Firebase account';
          showToast(`Authentication Error: ${message}`);
          return null;
        }
      } finally {
        setIsAuthenticating(false);
      }
    },
    [syncFirebaseUserToProfile, showToast]
  );

  // REAL Firebase Sign In (Email & Password)
  const signIn = useCallback(
    async (email: string, password = 'Learn2Code2026!'): Promise<UserProfile | null> => {
      setIsAuthenticating(true);
      const cleanEmail = email.trim().toLowerCase();
      const validPassword = password.length >= 6 ? password : `${password}2026!`;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, validPassword);
        const fbUser = userCredential.user;
        const profile = syncFirebaseUserToProfile(fbUser);
        if (isAdminEmail(cleanEmail)) {
          showToast(`Verified Firebase Admin: Welcome back, ${profile.display_name}!`);
        } else {
          showToast(`Signed in to Firebase: Welcome, ${profile.display_name}!`);
        }
        return profile;
      } catch (err: any) {
        console.error('Firebase SignIn error:', err);
        // If user not found and it's a valid email, auto-register them seamlessly
        if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
          // Attempt auto-register if password might have been missing or new account
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, validPassword);
            const profile = syncFirebaseUserToProfile(userCredential.user);
            showToast(`Firebase Account Provisioned: Welcome, ${profile.display_name}!`);
            return profile;
          } catch (createErr: any) {
            const msg = err?.message?.replace('Firebase: ', '') || 'Invalid email or password';
            showToast(`Sign In Failed: ${msg}`);
            return null;
          }
        } else {
          const msg = err?.message?.replace('Firebase: ', '') || 'Sign-in error';
          showToast(`Sign In Failed: ${msg}`);
          return null;
        }
      } finally {
        setIsAuthenticating(false);
      }
    },
    [syncFirebaseUserToProfile, showToast]
  );

  // REAL Google Popup Sign In
  const signInWithGoogle = useCallback(async (): Promise<UserProfile | null> => {
    setIsAuthenticating(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = userCredential.user;
      const profile = syncFirebaseUserToProfile(fbUser);
      if (isAdminEmail(profile.email)) {
        showToast(`Google Auth verified: Welcome, Instructor ${profile.display_name}!`);
      } else {
        showToast(`Google Sign In successful: Welcome, ${profile.display_name}!`);
      }
      return profile;
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      // Popup blocked or closed by user
      if (err?.code !== 'auth/popup-closed-by-user') {
        const msg = err?.message?.replace('Firebase: ', '') || 'Failed to sign in with Google';
        showToast(`Google Sign-In: ${msg}`);
      }
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  }, [syncFirebaseUserToProfile, showToast]);

  const loginAs = useCallback(
    (role: Role) => {
      if (role === 'admin') {
        signIn('euniceajayi2010@gmail.com', 'AdminEunice2026!');
      } else {
        signIn('student@learn2code.org', 'Student2026!');
      }
    },
    [signIn]
  );

  const updateCurrentUser = useCallback(
    (updated: Partial<UserProfile>) => {
      const fresh = { ...currentUser, ...updated };
      // Prevent non-admin emails from elevating to admin role
      if (!isAdminEmail(fresh.email)) {
        fresh.role = 'student';
      }
      StorageService.saveProfile(fresh);
      refreshProfiles();
      showToast('Profile updated successfully');
    },
    [currentUser, showToast, refreshProfiles]
  );

  // Real Firebase Sign Out
  const logout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
    if (currentUser) {
      StorageService.removeUserPresence(currentUser.id);
      setPresenceList(StorageService.getPresence());
    }
    setFirebaseUser(null);
    setCurrentUserId('usr_student_default');
    StorageService.setCurrentUserId('usr_student_default');
    refreshProfiles();
    showToast('Signed out of Firebase. Sign in with your real account.');
    setShowAuthModal(true);
  }, [currentUser, showToast, refreshProfiles]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        profiles,
        presenceList,
        currentActivity,
        isAdmin,
        isOnline: true,
        isAuthenticating,
        setActivity,
        switchUser,
        updateCurrentUser,
        updateProfile: updateCurrentUser,
        signUp,
        signIn,
        signInWithGoogle,
        loginAs,
        logout,
        refreshProfiles,
        showAuthModal,
        setShowAuthModal,
        showComingSoonModal,
        setShowComingSoonModal,
        comingSoonTitle,
        triggerComingSoon,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
