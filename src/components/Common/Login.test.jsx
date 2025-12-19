import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './Login';
import userEvent from '@testing-library/user-event';

// Мокаем контекст
const mockLogin = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    currentUser: null,
    logout: jest.fn(),
  }),
}));

// Мокаем навигацию
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Игнорируем предупреждения React Router
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.warn.mockRestore();
  console.error.mockRestore();
});

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Router>
        <Login />
      </Router>
    );
  };

  test('рендерит форму входа', () => {
    renderComponent();
    
    expect(screen.getByText('Вход в систему')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите ваш email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите ваш пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  test('успешный вход', async () => {
    mockLogin.mockResolvedValueOnce({});
    
    await act(async () => {
      renderComponent();
    });
    
    const emailInput = screen.getByPlaceholderText('Введите ваш email');
    const passwordInput = screen.getByPlaceholderText('Введите ваш пароль');
    const submitButton = screen.getByRole('button', { name: /войти/i });

    await act(async () => {
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('отображает ошибку при неудачном входе', async () => {
    const errorMessage = 'Неверные учетные данные';
    mockLogin.mockRejectedValueOnce({
      response: { data: errorMessage }
    });
    
    await act(async () => {
      renderComponent();
    });
    
    const emailInput = screen.getByPlaceholderText('Введите ваш email');
    const passwordInput = screen.getByPlaceholderText('Введите ваш пароль');
    const submitButton = screen.getByRole('button', { name: /войти/i });

    await act(async () => {
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('переход на страницу регистрации', async () => {
    await act(async () => {
      renderComponent();
    });
    
    const registerButton = screen.getByRole('button', { name: /зарегистрироваться как студент/i });
    
    await act(async () => {
      fireEvent.click(registerButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('отображается состояние загрузки кнопки', async () => {
    // Создаем промис, который не разрешается сразу
    let resolveLogin;
    mockLogin.mockImplementation(() => new Promise((resolve) => {
      resolveLogin = resolve;
    }));
    
    await act(async () => {
      renderComponent();
    });
    
    const emailInput = screen.getByPlaceholderText('Введите ваш email');
    const passwordInput = screen.getByPlaceholderText('Введите ваш пароль');
    let submitButton = screen.getByRole('button', { name: /войти/i });

    await act(async () => {
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
    });

    // Проверяем состояние загрузки сразу после клика
    submitButton = screen.getByRole('button', { name: /вход\.\.\./i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Вход...');

    // Разрешаем промис
    await act(async () => {
      resolveLogin();
    });
  });
});