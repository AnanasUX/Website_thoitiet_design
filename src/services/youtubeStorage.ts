/**
 * YouTube Local Storage & Cache Management Service
 * Quản lý dữ liệu kênh, video, bài đã lưu (bookmark), lịch sử xem (history) theo từng userId độc lập
 * Đảm bảo tài khoản này không xem được dữ liệu của tài khoản khác
 */

import { YouTubeSubscribedChannel, YouTubeVideoItem } from './youtubeApi';

export interface YouTubeSyncMeta {
  lastSyncedAt: string;
  channelCount: number;
  videoCount: number;
  status: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
  linkedAccount?: string;
}

const STORAGE_PREFIX = 'yt_personal_v1';

function sanitizeUserId(userId?: string): string {
  if (!userId) return 'guest';
  return userId.toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
}

function getKey(userId: string | undefined, subKey: string): string {
  return `${STORAGE_PREFIX}_${sanitizeUserId(userId)}_${subKey}`;
}

// ── Quản lý danh sách kênh đã đăng ký ──
export function getSavedSubscriptions(userId?: string): YouTubeSubscribedChannel[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getKey(userId, 'channels'));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSubscriptions(userId: string | undefined, channels: YouTubeSubscribedChannel[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getKey(userId, 'channels'), JSON.stringify(channels));
  } catch (err) {
    console.warn('[YouTube Storage] Không thể lưu danh sách kênh:', err);
  }
}

// ── Quản lý danh sách video tổng hợp từ các kênh ──
export function getCachedVideos(userId?: string): YouTubeVideoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getKey(userId, 'videos'));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCachedVideos(userId: string | undefined, videos: YouTubeVideoItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Lưu tối đa 200 video để tránh tràn localStorage
    const truncated = videos.slice(0, 200);
    localStorage.setItem(getKey(userId, 'videos'), JSON.stringify(truncated));
  } catch (err) {
    console.warn('[YouTube Storage] Không thể lưu video đệm:', err);
  }
}

// ── Quản lý Video đã lưu (Bookmarks) ──
export function getBookmarkedVideos(userId?: string): YouTubeVideoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getKey(userId, 'saved'));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function isVideoBookmarked(userId: string | undefined, videoId: string): boolean {
  const saved = getBookmarkedVideos(userId);
  return saved.some(v => v.videoId === videoId);
}

export function toggleBookmarkVideo(userId: string | undefined, video: YouTubeVideoItem): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = getBookmarkedVideos(userId);
    const existingIndex = saved.findIndex(v => v.videoId === video.videoId);
    let nextSaved: YouTubeVideoItem[];
    let isNowSaved = false;

    if (existingIndex >= 0) {
      nextSaved = saved.filter(v => v.videoId !== video.videoId);
      isNowSaved = false;
    } else {
      nextSaved = [{ ...video, isSaved: true }, ...saved];
      isNowSaved = true;
    }

    localStorage.setItem(getKey(userId, 'saved'), JSON.stringify(nextSaved.slice(0, 100)));
    return isNowSaved;
  } catch (err) {
    console.warn('[YouTube Storage] Lỗi lưu bookmark video:', err);
    return false;
  }
}

// ── Quản lý Video đã xem gần đây (Watch History) ──
export function getWatchHistory(userId?: string): YouTubeVideoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getKey(userId, 'history'));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordWatchHistory(userId: string | undefined, video: YouTubeVideoItem): void {
  if (typeof window === 'undefined' || !video.videoId) return;
  try {
    const history = getWatchHistory(userId);
    // Loại bỏ nếu đã có trong danh sách để đẩy lên đầu
    const filtered = history.filter(v => v.videoId !== video.videoId);
    const updated: YouTubeVideoItem[] = [
      { ...video, watchedAt: new Date().toISOString() },
      ...filtered
    ].slice(0, 60); // Lưu tối đa 60 video gần nhất
    localStorage.setItem(getKey(userId, 'history'), JSON.stringify(updated));
  } catch (err) {
    console.warn('[YouTube Storage] Không thể ghi nhận lịch sử xem:', err);
  }
}

export function clearWatchHistory(userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getKey(userId, 'history'));
  } catch {}
}

// ── Quản lý Metadata Đồng bộ ──
export function getSyncMeta(userId?: string): YouTubeSyncMeta | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getKey(userId, 'meta'));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSyncMeta(userId: string | undefined, meta: YouTubeSyncMeta): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getKey(userId, 'meta'), JSON.stringify(meta));
  } catch {}
}

// ── Xóa toàn bộ dữ liệu người dùng khi Ngắt kết nối (Disconnect) ──
export function clearAllUserData(userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getKey(userId, 'channels'));
    localStorage.removeItem(getKey(userId, 'videos'));
    localStorage.removeItem(getKey(userId, 'saved'));
    localStorage.removeItem(getKey(userId, 'history'));
    localStorage.removeItem(getKey(userId, 'meta'));
  } catch {}
}
