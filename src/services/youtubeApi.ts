/**
 * YouTube Data API v3 Client Service
 * Đáp ứng đầy đủ tiêu chuẩn kết nối Google OAuth 2.0 & YouTube Data API v3
 * - Quét toàn bộ kênh đã đăng ký (mine=true, maxResults=50, phân trang nextPageToken)
 * - Lấy video từ playlist tải lên (channels.list -> contentDetails -> playlistItems.list)
 * - Xử lý chuẩn HTTP 401, 403 (Quota/Forbidden), 404 và lỗi mạng
 * - TUYỆT ĐỐI không dùng dữ liệu giả thay thế khi API thất bại
 */

export interface YouTubeSubscribedChannel {
  channelId: string;
  channelTitle: string;
  channelThumbnail: string;
  subscriptionId?: string;
  description?: string;
  customUrl?: string;
  linkedGoogleAccount: string;
  lastSyncedAt: string;
  totalVideos?: number;
}

export interface YouTubeVideoItem {
  channelId: string;
  uploadsPlaylistId?: string;
  videoId: string;
  videoTitle: string;
  videoDescription: string;
  videoThumbnail: string;
  publishedAt: string;
  channelTitle: string;
  channelThumbnail?: string;
  duration?: string;
  mediaType?: 'video' | 'short';
  isSaved?: boolean;
  watchedAt?: string;
}

export class YouTubeApiError extends Error {
  statusCode: number;
  code: 'AUTH_EXPIRED' | 'QUOTA_EXCEEDED' | 'FORBIDDEN' | 'NOT_FOUND' | 'NETWORK_ERROR' | 'UNKNOWN';

  constructor(message: string, statusCode: number, code: YouTubeApiError['code']) {
    super(message);
    this.name = 'YouTubeApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Xử lý response từ YouTube API và map lỗi HTTP chính xác
 */
async function handleApiResponse(res: Response, context: string): Promise<any> {
  if (res.ok) {
    return res.json();
  }

  let errorMessage = `${context} thất bại (HTTP ${res.status})`;
  let errorCode: YouTubeApiError['code'] = 'UNKNOWN';

  try {
    const errorBody = await res.json();
    if (errorBody?.error?.message) {
      errorMessage = errorBody.error.message;
    }
  } catch {}

  if (res.status === 401) {
    errorCode = 'AUTH_EXPIRED';
    errorMessage = 'Phiên kết nối Google đã hết hạn. Vui lòng kết nối lại tài khoản.';
  } else if (res.status === 403) {
    if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('limit')) {
      errorCode = 'QUOTA_EXCEEDED';
      errorMessage = 'Đã đạt giới hạn Quota truy vấn của YouTube API hôm nay. Vui lòng thử lại sau.';
    } else {
      errorCode = 'FORBIDDEN';
      errorMessage = 'Tài khoản chưa cấp quyền truy cập YouTube. Vui lòng cấp quyền truy cập danh sách kênh.';
    }
  } else if (res.status === 404) {
    errorCode = 'NOT_FOUND';
    errorMessage = 'Không tìm thấy dữ liệu yêu cầu trên YouTube.';
  }

  throw new YouTubeApiError(errorMessage, res.status, errorCode);
}

/**
 * Lấy toàn bộ danh sách kênh người dùng đã đăng ký qua YouTube Data API v3
 * Tự động lặp với nextPageToken cho đến khi hết kết quả
 */
export async function fetchUserSubscriptions(
  accessToken: string,
  linkedGoogleAccount: string
): Promise<YouTubeSubscribedChannel[]> {
  if (!accessToken) {
    throw new YouTubeApiError('Thiếu access token xác thực', 401, 'AUTH_EXPIRED');
  }

  const allChannels: YouTubeSubscribedChannel[] = [];
  let pageToken: string | undefined = undefined;
  const now = new Date().toISOString();

  do {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      mine: 'true',
      maxResults: '50',
      order: 'alphabetical'
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    let res: Response;
    try {
      res = await fetch(`https://www.googleapis.com/youtube/v3/subscriptions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      });
    } catch (err: any) {
      throw new YouTubeApiError('Lỗi kết nối mạng khi tải danh sách kênh YouTube', 0, 'NETWORK_ERROR');
    }

    const data = await handleApiResponse(res, 'Tải danh sách kênh đăng ký');

    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        const snippet = item.snippet || {};
        const chId = snippet.resourceId?.channelId || item.id || '';
        const chTitle = snippet.title || 'Kênh YouTube';
        const thumb = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '';

        allChannels.push({
          channelId: chId,
          channelTitle: chTitle,
          channelThumbnail: thumb,
          subscriptionId: item.id,
          description: snippet.description || '',
          customUrl: snippet.customUrl,
          linkedGoogleAccount,
          lastSyncedAt: now
        });
      }
    }

    pageToken = data.nextPageToken || undefined;
  } while (pageToken);

  return allChannels;
}

/**
 * Lấy ID playlist uploads của một kênh qua channels.list (part=contentDetails)
 */
export async function getChannelUploadsPlaylistId(
  accessToken: string,
  channelId: string
): Promise<string> {
  if (!channelId) return '';
  // Kênh chuẩn YouTube: ID bắt đầu bằng UC, playlist uploads tương ứng là UU
  if (channelId.startsWith('UC')) {
    return 'UU' + channelId.substring(2);
  }

  try {
    const params = new URLSearchParams({
      part: 'contentDetails',
      id: channelId
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || '';
  } catch {
    return '';
  }
}

/**
 * Lấy danh sách video từ playlist tải lên (Uploads) của một kênh cụ thể
 */
export async function fetchVideosFromPlaylist(
  accessToken: string,
  uploadsPlaylistId: string,
  channelInfo: { channelId: string; channelTitle: string; channelThumbnail?: string },
  maxResults = 15,
  pageToken?: string
): Promise<{ videos: YouTubeVideoItem[]; nextPageToken?: string }> {
  if (!uploadsPlaylistId) {
    return { videos: [] };
  }

  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    playlistId: uploadsPlaylistId,
    maxResults: String(Math.min(maxResults, 50))
  });
  if (pageToken) {
    params.append('pageToken', pageToken);
  }

  let res: Response;
  try {
    res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });
  } catch {
    throw new YouTubeApiError('Lỗi kết nối mạng khi tải danh sách video của kênh', 0, 'NETWORK_ERROR');
  }

  const data = await handleApiResponse(res, `Tải video từ playlist ${uploadsPlaylistId}`);
  const videos: YouTubeVideoItem[] = [];

  if (data.items && Array.isArray(data.items)) {
    for (const item of data.items) {
      const snippet = item.snippet || {};
      const vidId = snippet.resourceId?.videoId || item.contentDetails?.videoId;
      if (!vidId) continue;

      const thumb = snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;
      const title = snippet.title || 'Video YouTube';
      const isShort = title.toLowerCase().includes('#shorts') || title.toLowerCase().includes('#short');

      videos.push({
        channelId: channelInfo.channelId,
        uploadsPlaylistId,
        videoId: vidId,
        videoTitle: title,
        videoDescription: snippet.description || '',
        videoThumbnail: thumb,
        publishedAt: snippet.publishedAt || new Date().toISOString(),
        channelTitle: channelInfo.channelTitle,
        channelThumbnail: channelInfo.channelThumbnail || '',
        mediaType: isShort ? 'short' : 'video'
      });
    }
  }

  return {
    videos,
    nextPageToken: data.nextPageToken || undefined
  };
}

/**
 * Tải video mới nhất từ tập hợp các kênh đã đăng ký (giới hạn số kênh và số video mỗi kênh để tối ưu quota)
 */
export async function fetchLatestVideosFromSubscriptions(
  accessToken: string,
  channels: YouTubeSubscribedChannel[],
  channelLimit = 8,
  videosPerChannel = 6
): Promise<YouTubeVideoItem[]> {
  if (!channels || channels.length === 0) return [];

  const targetChannels = channels.slice(0, channelLimit);
  const results = await Promise.allSettled(
    targetChannels.map(async (ch) => {
      const uploadPlId = await getChannelUploadsPlaylistId(accessToken, ch.channelId);
      if (!uploadPlId) return [];
      const res = await fetchVideosFromPlaylist(accessToken, uploadPlId, {
        channelId: ch.channelId,
        channelTitle: ch.channelTitle,
        channelThumbnail: ch.channelThumbnail
      }, videosPerChannel);
      return res.videos;
    })
  );

  const aggregated: YouTubeVideoItem[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      aggregated.push(...r.value);
    }
  }

  // Sắp xếp video mới nhất lên đầu
  aggregated.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return aggregated;
}

/**
 * Thu hồi quyền truy cập Google OAuth (Revoke Token)
 */
export async function revokeGoogleToken(accessToken: string): Promise<boolean> {
  if (!accessToken) return true;
  try {
    const res = await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return res.ok;
  } catch {
    return false;
  }
}
