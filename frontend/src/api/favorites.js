import { getUsername } from './auth';

const FAVORITES_KEY_PREFIX = 'favorite_books';
const FAVORITES_CHANGED_EVENT = 'favorites-changed';

function getStorageKey() {
  return `${FAVORITES_KEY_PREFIX}:${getUsername() || 'guest'}`;
}

export function getFavoriteIds() {
  try {
    const raw = localStorage.getItem(getStorageKey());
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
}

export function isFavoriteBook(bookId) {
  return getFavoriteIds().includes(String(bookId));
}

export function toggleFavoriteBook(bookId) {
  const id = String(bookId);
  const ids = getFavoriteIds();
  const nextIds = ids.includes(id)
    ? ids.filter((favoriteId) => favoriteId !== id)
    : [id, ...ids];

  localStorage.setItem(getStorageKey(), JSON.stringify(nextIds));
  window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT, { detail: nextIds }));
  return nextIds.includes(id);
}

export function subscribeFavoritesChanged(callback) {
  const handler = () => callback(getFavoriteIds());
  window.addEventListener(FAVORITES_CHANGED_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(FAVORITES_CHANGED_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
