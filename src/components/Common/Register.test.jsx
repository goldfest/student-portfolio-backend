import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Register from './Register';
import userEvent from '@testing-library/user-event';

// Мокаем контекст
const mockRegisterStudent = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    registerStudent: mockRegisterStudent,
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

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Router>
        <Register />
      </Router>
    );
  };

  test('рендерит форму регистрации', () => {
    renderComponent();
    
    expect(screen.getByText('Регистрация студента')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Например: ivanov_i')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('example@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/расскажите о себе/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://example.com/avatar.jpg')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /зарегистрироваться/i })).toBeInTheDocument();
  });

  test('отправка формы с валидными данными', async () => {
    mockRegisterStudent.mockResolvedValueOnce({});
    
    renderComponent();
    
    // Находим все элементы
    const idNameInput = screen.getByPlaceholderText('Например: ivanov_i');
    const emailInput = screen.getByPlaceholderText('example@email.com');
    
    // Находим поля пароля по name атрибутам через querySelector
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
    const bioTextarea = screen.getByPlaceholderText(/расскажите о себе/i);
    const avatarInput = screen.getByPlaceholderText('https://example.com/avatar.jpg');
    
    expect(passwordInput).toBeTruthy();
    expect(confirmPasswordInput).toBeTruthy();
    
    // Заполняем форму
    await userEvent.type(idNameInput, 'ivanov_i');
    await userEvent.type(emailInput, 'ivanov@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.type(bioTextarea, 'Моя биография');
    await userEvent.type(avatarInput, 'https://example.com/avatar.jpg');
    
    // Отправляем форму
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i });
    
    // Используем act для обертки асинхронных действий
    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockRegisterStudent).toHaveBeenCalledWith({
        idName: 'ivanov_i',
        email: 'ivanov@example.com',
        password: 'password123',
        bio: 'Моя биография',
        avatarUrl: 'https://example.com/avatar.jpg',
      });
    });
  });

  test('отображает ошибку при неудачной регистрации', async () => {
    const errorMessage = 'Email уже используется';
    mockRegisterStudent.mockRejectedValueOnce({
      response: { data: errorMessage }
    });
    
    renderComponent();
    
    // Заполняем поля
    await userEvent.type(screen.getByPlaceholderText('Например: ivanov_i'), 'ivanov_i');
    await userEvent.type(screen.getByPlaceholderText('example@email.com'), 'existing@example.com');
    
    // Находим и заполняем поля пароля
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
    
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    
    // Отправляем форму
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('кнопка входа для существующих пользователей', () => {
    renderComponent();
    
    const loginButton = screen.getByRole('button', { name: /уже есть аккаунт\? войти/i });
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('отображение подсказок для полей', () => {
    renderComponent();
    
    expect(screen.getByText(/уникальный идентификатор для вашего профиля/i)).toBeInTheDocument();
    expect(screen.getByText(/максимум 500 символов/i)).toBeInTheDocument();
  });
});