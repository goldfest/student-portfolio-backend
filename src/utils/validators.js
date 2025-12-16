import * as yup from 'yup';
import { VALIDATION_RULES } from './constants';

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Некорректный формат email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(VALIDATION_RULES.PASSWORD_MIN, `Минимум ${VALIDATION_RULES.PASSWORD_MIN} символов`)
    .required('Пароль обязателен')
});

export const registerStudentSchema = yup.object({
  idName: yup
    .string()
    .min(VALIDATION_RULES.NAME_MIN, `Минимум ${VALIDATION_RULES.NAME_MIN} символа`)
    .max(VALIDATION_RULES.NAME_MAX, `Максимум ${VALIDATION_RULES.NAME_MAX} символов`)
    .required('ID Name обязателен'),
  email: yup
    .string()
    .email('Некорректный формат email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(VALIDATION_RULES.PASSWORD_MIN, `Минимум ${VALIDATION_RULES.PASSWORD_MIN} символов`)
    .required('Пароль обязателен'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Подтвердите пароль'),
  bio: yup
    .string()
    .max(VALIDATION_RULES.BIO_MAX, `Максимум ${VALIDATION_RULES.BIO_MAX} символов`),
  avatarUrl: yup
    .string()
    .url('Некорректный URL')
});

export const studentSchema = yup.object({
  idName: yup
    .string()
    .min(VALIDATION_RULES.NAME_MIN, `Минимум ${VALIDATION_RULES.NAME_MIN} символа`)
    .max(VALIDATION_RULES.NAME_MAX, `Максимум ${VALIDATION_RULES.NAME_MAX} символов`)
    .required('ID Name обязателен'),
  email: yup
    .string()
    .email('Некорректный формат email')
    .required('Email обязателен'),
  bio: yup
    .string()
    .max(VALIDATION_RULES.BIO_MAX, `Максимум ${VALIDATION_RULES.BIO_MAX} символов`),
  avatarUrl: yup
    .string()
    .url('Некорректный URL'),
  isActive: yup
    .boolean()
    .default(true)
});

export const teacherSchema = yup.object({
  idName: yup
    .string()
    .min(VALIDATION_RULES.NAME_MIN, `Минимум ${VALIDATION_RULES.NAME_MIN} символа`)
    .max(VALIDATION_RULES.NAME_MAX, `Максимум ${VALIDATION_RULES.NAME_MAX} символов`)
    .required('ID Name обязателен'),
  email: yup
    .string()
    .email('Некорректный формат email')
    .required('Email обязателен'),
  bio: yup
    .string()
    .max(VALIDATION_RULES.BIO_MAX, `Максимум ${VALIDATION_RULES.BIO_MAX} символов`),
  avatarUrl: yup
    .string()
    .url('Некорректный URL'),
  isActive: yup
    .boolean()
    .default(true)
});

export const portfolioItemSchema = yup.object({
  title: yup
    .string()
    .min(3, 'Минимум 3 символа')
    .max(100, 'Максимум 100 символов')
    .required('Название обязательно'),
  description: yup
    .string()
    .max(1000, 'Максимум 1000 символов'),
  projectUrl: yup
    .string()
    .url('Некорректный URL'),
  completionDate: yup
    .date()
    .max(new Date(), 'Дата не может быть в будущем'),
  workTypeId: yup
    .number()
    .required('Тип работы обязателен'),
  skillIds: yup
    .array()
    .of(yup.number())
});

export const workTypeSchema = yup.object({
  name: yup
    .string()
    .min(3, 'Минимум 3 символа')
    .max(50, 'Максимум 50 символов')
    .required('Название обязательно'),
  description: yup
    .string()
    .max(200, 'Максимум 200 символов')
});

export const skillSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Минимум 2 символа')
    .max(50, 'Максимум 50 символов')
    .required('Название обязательно'),
  category: yup
    .string()
    .max(50, 'Максимум 50 символов')
});

export const groupSchema = yup.object({
  name: yup
    .string()
    .min(3, 'Минимум 3 символа')
    .max(100, 'Максимум 100 символов')
    .required('Название обязательно'),
  teacherId: yup
    .number()
    .required('Преподаватель обязателен')
});