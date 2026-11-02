import React, { createContext, useContext, useState } from 'react';
import {
  CURRENT_USER,
  COLLEGE_NOTICES,
  PROJECTS_DATA,
  EVENTS_DATA,
  INITIAL_ISSUES,
  CAMPUS_BUILDINGS,
} from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Initialize user & authentication state from localStorage or default demo user
  const [user, setUser] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const explicitAuth = localStorage.getItem('campushub_auth');
      if (explicitAuth === 'false') return null;
      try {
        const saved = localStorage.getItem('campushub_user_profile');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore parse error
      }
    }
    return CURRENT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const explicitAuth = localStorage.getItem('campushub_auth');
      if (explicitAuth === 'true') return true;
      if (explicitAuth === 'false') return false;
    }
    return false;
  });

  const [projects, setProjects] = useState(PROJECTS_DATA);
  const [events, setEvents] = useState(EVENTS_DATA);
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [notices, setNotices] = useState(COLLEGE_NOTICES);
  const [joinedProjects, setJoinedProjects] = useState(['proj-1']);
  const [registeredEvents, setRegisteredEvents] = useState(['ev-1']);
  const [savedItems, setSavedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Authentication methods
  const login = (userData, token = 'campushub-session-token') => {
    const activeUser = userData || CURRENT_USER;
    setUser(activeUser);
    setIsAuthenticated(true);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('campushub_auth', 'true');
      localStorage.setItem('campushub_token', token);
      localStorage.setItem('campushub_user_profile', JSON.stringify(activeUser));
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('campushub_auth', 'false');
      localStorage.removeItem('campushub_token');
      localStorage.removeItem('campushub_user_profile');
    }
  };

  // Project Partner Finder actions
  const joinProject = (projectId) => {
    if (joinedProjects.includes(projectId)) return false;
    setJoinedProjects((prev) => [...prev, projectId]);
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId && proj.spotsFilled < proj.spotsTotal) {
          return {
            ...proj,
            spotsFilled: proj.spotsFilled + 1,
            teamMembers: [
              ...proj.teamMembers,
              { name: user?.name || 'Student', role: 'Collaborator', avatar: user?.avatar },
            ],
          };
        }
        return proj;
      })
    );
    return true;
  };

  const createProject = (newProject) => {
    const id = `proj-${Date.now()}`;
    const formatted = {
      id,
      spotsFilled: 1,
      postedAt: 'Just now',
      teamMembers: [{ name: user?.name || 'Student', role: 'Project Creator', avatar: user?.avatar }],
      ...newProject,
    };
    setProjects((prev) => [formatted, ...prev]);
    setJoinedProjects((prev) => [...prev, id]);
    return formatted;
  };

  // Event RSVP actions
  const toggleEventRsvp = (eventId) => {
    const isRsvp = registeredEvents.includes(eventId);
    if (isRsvp) {
      setRegisteredEvents((prev) => prev.filter((id) => id !== eventId));
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId ? { ...ev, attendeesCount: Math.max(0, ev.attendeesCount - 1) } : ev
        )
      );
      return false;
    } else {
      setRegisteredEvents((prev) => [...prev, eventId]);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId ? { ...ev, attendeesCount: ev.attendeesCount + 1 } : ev
        )
      );
      return true;
    }
  };

  // Issue Reporting actions
  const submitIssue = (newIssue) => {
    const id = `iss-${Date.now()}`;
    const ticketId = `FAC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const formatted = {
      id,
      ticketId,
      status: 'Open',
      reportedBy: user?.name || 'Student',
      createdAt: 'Just now',
      ...newIssue,
    };
    setIssues((prev) => [formatted, ...prev]);
    return formatted;
  };

  // Update profile
  const updateProfile = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('campushub_user_profile', JSON.stringify(merged));
      }
      return merged;
    });
  };

  // Mark notice as read
  const markNoticeAsRead = (noticeId) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === noticeId ? { ...n, read: true } : n))
    );
  };

  const markAllNoticesAsRead = () => {
    setNotices((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        projects,
        events,
        issues,
        notices,
        buildings: CAMPUS_BUILDINGS,
        joinedProjects,
        registeredEvents,
        searchQuery,
        setSearchQuery,
        joinProject,
        createProject,
        toggleEventRsvp,
        submitIssue,
        updateProfile,
        markNoticeAsRead,
        markAllNoticesAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
