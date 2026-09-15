import React, { createContext, useContext, useState, useEffect } from 'react';
import { bookmarkService } from '../services/api';
import { useAuth } from './AuthContext';

const BookmarkContext = createContext();

export const BookmarkProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = async () => {
    if (!isAuthenticated) {
      setBookmarks([]);
      return;
    }
    try {
      setLoading(true);
      const res = await bookmarkService.getAll();
      if (res.success) {
        setBookmarks(res.data || []);
      }
    } catch (err) {
      console.error('Fetch bookmarks error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [isAuthenticated]);

  const isBookmarked = (resourceId) => {
    if (!resourceId) return false;
    return bookmarks.some((b) => (b._id || b) === resourceId);
  };

  const toggleBookmark = async (resource) => {
    if (!isAuthenticated) return false;

    const resourceId = resource._id || resource;
    const exists = isBookmarked(resourceId);

    // Optimistic UI update
    if (exists) {
      setBookmarks((prev) => prev.filter((b) => (b._id || b) !== resourceId));
      try {
        await bookmarkService.remove(resourceId);
      } catch (err) {
        // revert
        setBookmarks((prev) => [...prev, resource]);
      }
    } else {
      setBookmarks((prev) => [...prev, resource]);
      try {
        await bookmarkService.add(resourceId);
      } catch (err) {
        // revert
        setBookmarks((prev) => prev.filter((b) => (b._id || b) !== resourceId));
      }
    }
    return true;
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        loading,
        isBookmarked,
        toggleBookmark,
        refetchBookmarks: fetchBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => useContext(BookmarkContext);
