import React from 'react';
import { Bookmark } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function BookmarkButton({ resource, className = "" }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const bookmarked = isBookmarked(resource?._id);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleBookmark(resource);
  };

  return (
    <button
      onClick={handleClick}
      title={bookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
      className={`p-1.5 rounded-lg border transition-all ${
        bookmarked
          ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
      } ${className}`}
    >
      <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
    </button>
  );
}
