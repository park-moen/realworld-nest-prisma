export const FEATURES = {
  // 현재 활성화된 기능
  USER_SIGNUP: process.env.FF_USER_SIGNUP !== 'false',
  USER_LOGIN: process.env.FF_USER_LOGIN !== 'false',
  REFRESH_TOKEN: process.env.FF_REFRESH_TOKEN !== 'false',

  // 향후 개발할 기능
  AUTH_ACCESS_TOKEN_GUARD:
    process.env.FF_AUTH_ACCESS_TOKEN_GUARD === 'true' || false,
  AUTH_REFRESH_TOKEN_GUARD:
    process.env.FF_AUTH_REFRESH_TOKEN_GUARD === 'true' || false,
} as const;

export type FeatureKey = keyof typeof FEATURES;

// Feature Flag 체크 유틸리티
export function isFeatureEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature];
}

// 개발 환경에서만 활성화된 기능인지 확인하는 체크 유틸리티
export function isDevFeature(feature: FeatureKey): boolean {
  return process.env.NODE_ENV === 'development' && FEATURES[feature];
}
