export const mockStoredCookie = async () => {
  return null;
};

export const mockAutoDetectCookie = async () => {
  return "nutstore_mock_cookie=auto-detected; session=mock";
};

export const mockValidateCookie = async (cookie: string) => {
  return cookie.trim().length > 0;
};
