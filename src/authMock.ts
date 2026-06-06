export const mockStoredCookie = async () => {
  await Bun.sleep(500);
  return null;
};

export const mockAutoDetectCookie = async () => {
  await Bun.sleep(700);
  return "nutstore_mock_cookie=auto-detected; session=mock";
};

export const mockValidateCookie = async (cookie: string) => {
  await Bun.sleep(400);
  return cookie.trim().length > 0;
};
