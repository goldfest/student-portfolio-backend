export const mockAuthContext = {
  login: jest.fn().mockResolvedValue({}),
  registerStudent: jest.fn().mockResolvedValue({}),
  currentUser: null,
  logout: jest.fn(),
};

export const mockNavigate = jest.fn();

export const mockApiResponse = {
  success: { data: { token: 'test-token', user: { id: 1, email: 'test@test.com' } } },
  error: { response: { data: 'Неверные учетные данные' } }
};