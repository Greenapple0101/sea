/**
 * API 유틸리티
 * - 자동 토큰 관리 (accessToken 헤더 추가)
 * - 401 에러 시 자동 토큰 갱신 및 재시도
 * - refresh token 실패 시 자동 로그아웃
 */

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

interface ApiCallOptions extends RequestInit {
  skipAuth?: boolean; // 인증 헤더를 건너뛸지 여부 (로그인/회원가입 등)
}

/**
 * 토큰 갱신 함수
 */
async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const responseData = await response.json();
  const { data } = responseData;
  const newAccessToken = data.access_token;
  const newRefreshToken = data.refresh_token;

  // 새 accessToken을 localStorage에 저장
  localStorage.setItem('accessToken', newAccessToken);

  // refreshToken도 새로 발급된 경우 저장
  if (newRefreshToken) {
    localStorage.setItem('refreshToken', newRefreshToken);
  }

  return newAccessToken;
}

/**
 * API 호출 함수
 * - 자동으로 accessToken을 헤더에 추가
 * - 401 에러 발생 시 토큰 갱신 후 재시도
 * - refresh 실패 시 로그아웃 처리
 */
export async function apiCall(url: string, options: ApiCallOptions = {}): Promise<Response> {
  const { skipAuth = false, headers = {}, ...restOptions } = options;

  // 기본 헤더 설정
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // skipAuth가 false이고 accessToken이 있으면 헤더에 추가
  if (!skipAuth) {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      (defaultHeaders as Record<string, string>).Authorization = `Bearer ${accessToken}`;
    }
  }

  // 첫 번째 시도
  let response = await fetch(url, {
    ...restOptions,
    headers: defaultHeaders,
  });

  // 401 에러가 아니면 바로 반환
  if (response.status !== 401 || skipAuth) {
    return response;
  }

  // 401 에러 발생: 토큰 갱신 시도
  if (!isRefreshing) {
    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();
      isRefreshing = false;
      processQueue(null);

      // 새 토큰으로 원래 요청 재시도
      (defaultHeaders as Record<string, string>).Authorization = `Bearer ${newAccessToken}`;
      response = await fetch(url, {
        ...restOptions,
        headers: defaultHeaders,
      });

      return response;
    } catch (error) {
      isRefreshing = false;
      processQueue(error as Error);

      // refresh 실패: 로그아웃 처리
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // 로그인 페이지로 리다이렉트
      window.location.href = '/';

      throw error;
    }
  } else {
    // 이미 토큰 갱신 중이면 큐에 추가하고 대기
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(() => {
      // 토큰 갱신이 완료되면 원래 요청 재시도
      const accessToken = localStorage.getItem('accessToken');
      (defaultHeaders as Record<string, string>).Authorization = `Bearer ${accessToken}`;
      return fetch(url, {
        ...restOptions,
        headers: defaultHeaders,
      });
    }) as Promise<Response>;
  }
}

/**
 * GET 요청 헬퍼
 */
export async function get(url: string, options?: ApiCallOptions): Promise<Response> {
  return apiCall(url, { ...options, method: 'GET' });
}

/**
 * POST 요청 헬퍼
 */
export async function post(url: string, data?: unknown, options?: ApiCallOptions): Promise<Response> {
  return apiCall(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT 요청 헬퍼
 */
export async function put(url: string, data?: unknown, options?: ApiCallOptions): Promise<Response> {
  return apiCall(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE 요청 헬퍼
 */
export async function del(url: string, options?: ApiCallOptions): Promise<Response> {
  return apiCall(url, { ...options, method: 'DELETE' });
}

/**
 * PATCH 요청 헬퍼
 */
export async function patch(url: string, data?: unknown, options?: ApiCallOptions): Promise<Response> {
  return apiCall(url, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}
