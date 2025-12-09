package com.portfolio.config;

import com.portfolio.models.*;
import com.portfolio.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final GroupRepository groupRepository;
    private final WorkTypeRepository workTypeRepository;
    private final SkillRepository skillRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("🚀 Начинаю инициализацию тестовых данных...");

        // Проверяем, есть ли уже данные
        if (hasData()) {
            log.info("✅ Данные уже инициализированы, пропускаю...");
            return;
        }

        try {
            // 1. Создаем администратора
            createAdminUser();

            // 2. Создаем преподавателей
            List<Teacher> teachers = createTeachers();

            // 3. Создаем группы
            List<Group> groups = createGroups(teachers);

            // 4. Создаем студентов
            List<Student> students = createStudents(groups);

            // 5. Создаем типы работ
            List<WorkType> workTypes = createWorkTypes();

            // 6. Создаем навыки
            List<Skill> skills = createSkills();

            // 7. Создаем портфолио студентов
            createPortfolioItems(students, workTypes, skills);

            log.info("✅ Инициализация тестовых данных завершена успешно!");
            printSummary();

        } catch (Exception e) {
            log.error("❌ Ошибка при инициализации данных: {}", e.getMessage(), e);
        }
    }

    private boolean hasData() {
        return teacherRepository.count() > 0 || studentRepository.count() > 0;
    }

    private void createAdminUser() {
        Teacher admin = Teacher.builder()
                .idName("admin")
                .email("admin@portfolio.ru")
                .passwordHash(passwordEncoder.encode("Admin123!"))
                .role(Role.ADMIN)
                .bio("Системный администратор портфолио")
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=admin")
                .isActive(true)
                .build();

        teacherRepository.save(admin);
        log.info("👑 Создан администратор: admin@portfolio.ru / Admin123!");
    }

    private List<Teacher> createTeachers() {
        List<Teacher> teachers = Arrays.asList(
                Teacher.builder()
                        .idName("ivanov_ii")
                        .email("ivanov@portfolio.ru")
                        .passwordHash(passwordEncoder.encode("Teacher123!"))
                        .role(Role.TEACHER)
                        .bio("Профессор кафедры информационных технологий")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=ivanov")
                        .isActive(true)
                        .build(),

                Teacher.builder()
                        .idName("petrova_ap")
                        .email("petrova@portfolio.ru")
                        .passwordHash(passwordEncoder.encode("Teacher123!"))
                        .role(Role.TEACHER)
                        .bio("Доцент кафедры веб-разработки")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=petrova")
                        .isActive(true)
                        .build(),

                Teacher.builder()
                        .idName("sidorov_ms")
                        .email("sidorov@portfolio.ru")
                        .passwordHash(passwordEncoder.encode("Teacher123!"))
                        .role(Role.TEACHER)
                        .bio("Преподаватель баз данных и машинного обучения")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=sidorov")
                        .isActive(true)
                        .build()
        );

        teacherRepository.saveAll(teachers);
        log.info("👨‍🏫 Создано {} преподавателей", teachers.size());
        return teachers;
    }

    private List<Group> createGroups(List<Teacher> teachers) {
        List<Group> groups = Arrays.asList(
                Group.builder()
                        .name("ИТ-201")
                        .code("IT-201")
                        .teacher(teachers.get(0))
                        .build(),

                Group.builder()
                        .name("ИТ-202")
                        .code("IT-202")
                        .teacher(teachers.get(1))
                        .build(),

                Group.builder()
                        .name("ИТ-301")
                        .code("IT-301")
                        .teacher(teachers.get(2))
                        .build(),

                Group.builder()
                        .name("Веб-разработка 4 курс")
                        .code("WEB-401")
                        .teacher(teachers.get(1))
                        .build(),

                Group.builder()
                        .name("Машинное обучение 3 курс")
                        .code("ML-301")
                        .teacher(teachers.get(2))
                        .build()
        );

        groupRepository.saveAll(groups);
        log.info("👥 Создано {} групп", groups.size());
        return groups;
    }

    private List<Student> createStudents(List<Group> groups) {
        List<Student> students = Arrays.asList(
                // Студенты группы IT-201
                Student.builder()
                        .idName("sidorov_alex")
                        .email("sidorov.alex@student.ru")
                        .passwordHash(passwordEncoder.encode("Student123!"))
                        .role(Role.STUDENT)
                        .bio("Студент 2 курса, увлекаюсь backend-разработкой на Java")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=alex")
                        .isActive(true)
                        .group(groups.get(0))
                        .build(),

                Student.builder()
                        .idName("ivanova_maria")
                        .email("ivanova.maria@student.ru")
                        .passwordHash(passwordEncoder.encode("Student123!"))
                        .role(Role.STUDENT)
                        .bio("Студентка 2 курса, специализируюсь на frontend-разработке")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=maria")
                        .isActive(true)
                        .group(groups.get(0))
                        .build(),

                // Студенты группы IT-202
                Student.builder()
                        .idName("petrov_maxim")
                        .email("petrov.maxim@student.ru")
                        .passwordHash(passwordEncoder.encode("Student123!"))
                        .role(Role.STUDENT)
                        .bio("Студент 2 курса, интересуюсь базами данных и DevOps")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=maxim")
                        .isActive(true)
                        .group(groups.get(1))
                        .build(),

                Student.builder()
                        .idName("smirnova_anna")
                        .email("smirnova.anna@student.ru")
                        .passwordHash(passwordEncoder.encode("Student123!"))
                        .role(Role.STUDENT)
                        .bio("Студентка 2 курса, изучаю Python и машинное обучение")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=anna")
                        .isActive(true)
                        .group(groups.get(1))
                        .build(),

                // Студенты группы IT-301
                Student.builder()
                        .idName("kozlov_dmitry")
                        .email("kozlov.dmitry@student.ru")
                        .passwordHash(passwordEncoder.encode("Student123!"))
                        .role(Role.STUDENT)
                        .bio("Студент 3 курса, fullstack разработчик")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=dmitry")
                        .isActive(true)
                        .group(groups.get(2))
                        .build(),

                Student.builder()
                        .idName("fedorova_elena")
                        .email("fedorova.elena@student.ru")
                        .passwordHash(passwordEncoder.encode("Student123!"))
                        .role(Role.STUDENT)
                        .bio("Студентка 3 курса, специалист по кибербезопасности")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=elena")
                        .isActive(true)
                        .group(groups.get(2))
                        .build(),

                // Студенты группы WEB-401
                Student.builder()
                        .idName("morozov_artem")
                        .email("morozov.artem@student.ru")
                        .passwordHash(passwordEncoder.encode("Student123!"))
                        .role(Role.STUDENT)
                        .bio("Студент 4 курса, senior frontend разработчик (React)")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=artem")
                        .isActive(true)
                        .group(groups.get(3))
                        .build(),

                // Студенты группы ML-301
                Student.builder()
                        .idName("volkova_olga")
                        .email("volkova.olga@student.ru")
                        .passwordHash(passwordEncoder.encode("Student123!"))
                        .role(Role.STUDENT)
                        .bio("Студентка 3 курса, data scientist")
                        .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=olga")
                        .isActive(true)
                        .group(groups.get(4))
                        .build()
        );

        studentRepository.saveAll(students);
        log.info("👨‍🎓 Создано {} студентов", students.size());
        return students;
    }

    private List<WorkType> createWorkTypes() {
        List<WorkType> workTypes = Arrays.asList(
                WorkType.builder()
                        .name("Учебный проект")
                        .description("Проекты, выполненные в рамках учебной программы")
                        .build(),

                WorkType.builder()
                        .name("Курсовая работа")
                        .description("Научно-исследовательские курсовые работы")
                        .build(),

                WorkType.builder()
                        .name("Дипломная работа")
                        .description("Выпускные квалификационные работы")
                        .build(),

                WorkType.builder()
                        .name("Научная статья")
                        .description("Публикации в научных журналах и конференциях")
                        .build(),

                WorkType.builder()
                        .name("Сертификат")
                        .description("Сертификаты о прохождении курсов и тренингов")
                        .build(),

                WorkType.builder()
                        .name("Личный проект")
                        .description("Внеучебные проекты и pet-projects")
                        .build(),

                WorkType.builder()
                        .name("Хакатон")
                        .description("Проекты, созданные на хакатонах")
                        .build(),

                WorkType.builder()
                        .name("Стажировка")
                        .description("Работы, выполненные во время стажировки")
                        .build(),

                WorkType.builder()
                        .name("Волонтерский проект")
                        .description("Социальные и волонтерские проекты")
                        .build(),

                WorkType.builder()
                        .name("Исследовательская работа")
                        .description("Научно-исследовательские проекты")
                        .build()
        );

        workTypeRepository.saveAll(workTypes);
        log.info("📝 Создано {} типов работ", workTypes.size());
        return workTypes;
    }

    private List<Skill> createSkills() {
        List<Skill> skills = Arrays.asList(
                // Backend навыки
                Skill.builder().name("Java").category("Backend").build(),
                Skill.builder().name("Spring Boot").category("Backend").build(),
                Skill.builder().name("Python").category("Backend").build(),
                Skill.builder().name("Django").category("Backend").build(),
                Skill.builder().name("Node.js").category("Backend").build(),
                Skill.builder().name("C#").category("Backend").build(),
                Skill.builder().name(".NET").category("Backend").build(),
                Skill.builder().name("Go").category("Backend").build(),
                Skill.builder().name("PHP").category("Backend").build(),
                Skill.builder().name("Laravel").category("Backend").build(),

                // Frontend навыки
                Skill.builder().name("JavaScript").category("Frontend").build(),
                Skill.builder().name("TypeScript").category("Frontend").build(),
                Skill.builder().name("React").category("Frontend").build(),
                Skill.builder().name("Vue.js").category("Frontend").build(),
                Skill.builder().name("Angular").category("Frontend").build(),
                Skill.builder().name("HTML/CSS").category("Frontend").build(),
                Skill.builder().name("SASS/SCSS").category("Frontend").build(),
                Skill.builder().name("Next.js").category("Frontend").build(),
                Skill.builder().name("Redux").category("Frontend").build(),
                Skill.builder().name("Material-UI").category("Frontend").build(),

                // Database навыки
                Skill.builder().name("PostgreSQL").category("Database").build(),
                Skill.builder().name("MySQL").category("Database").build(),
                Skill.builder().name("MongoDB").category("Database").build(),
                Skill.builder().name("Redis").category("Database").build(),
                Skill.builder().name("SQL").category("Database").build(),
                Skill.builder().name("Firebase").category("Database").build(),

                // DevOps навыки
                Skill.builder().name("Docker").category("DevOps").build(),
                Skill.builder().name("Kubernetes").category("DevOps").build(),
                Skill.builder().name("AWS").category("DevOps").build(),
                Skill.builder().name("Git").category("DevOps").build(),
                Skill.builder().name("CI/CD").category("DevOps").build(),
                Skill.builder().name("Linux").category("DevOps").build(),
                Skill.builder().name("Nginx").category("DevOps").build(),

                // Data Science навыки
                Skill.builder().name("Machine Learning").category("Data Science").build(),
                Skill.builder().name("Data Analysis").category("Data Science").build(),
                Skill.builder().name("Pandas").category("Data Science").build(),
                Skill.builder().name("NumPy").category("Data Science").build(),
                Skill.builder().name("TensorFlow").category("Data Science").build(),
                Skill.builder().name("PyTorch").category("Data Science").build(),
                Skill.builder().name("Statistics").category("Data Science").build(),

                // Design навыки
                Skill.builder().name("Figma").category("Design").build(),
                Skill.builder().name("Adobe XD").category("Design").build(),
                Skill.builder().name("UI/UX Design").category("Design").build(),
                Skill.builder().name("Photoshop").category("Design").build(),

                // Soft Skills
                Skill.builder().name("Командная работа").category("Soft Skills").build(),
                Skill.builder().name("Английский язык").category("Soft Skills").build(),
                Skill.builder().name("Презентации").category("Soft Skills").build(),
                Skill.builder().name("Тайм-менеджмент").category("Soft Skills").build(),
                Skill.builder().name("Лидерство").category("Soft Skills").build()
        );

        skillRepository.saveAll(skills);
        log.info("💡 Создано {} навыков", skills.size());
        return skills;
    }

    private void createPortfolioItems(List<Student> students, List<WorkType> workTypes, List<Skill> skills) {
        // Портфолио для первого студента
        PortfolioItem item1 = PortfolioItem.builder()
                .title("Система управления студенческими портфолио")
                .description("Полнофункциональное веб-приложение для управления электронными портфолио студентов с использованием Spring Boot и React")
                .projectUrl("https://github.com/sidorovalex/portfolio-system")
                .completionDate(LocalDate.of(2024, 5, 15))
                .isVerified(true)
                .workType(workTypes.get(0)) // Учебный проект
                .student(students.get(0))
                .skills(new HashSet<>(Arrays.asList(
                        skills.get(0),  // Java
                        skills.get(1),  // Spring Boot
                        skills.get(12), // React
                        skills.get(21), // PostgreSQL
                        skills.get(26)  // Docker
                )))
                .build();

        PortfolioItem item2 = PortfolioItem.builder()
                .title("Курсовая работа: Анализ алгоритмов сортировки")
                .description("Исследование и сравнение эффективности различных алгоритмов сортировки на больших объемах данных")
                .fileUrl("/uploads/algorithms_report.pdf")
                .completionDate(LocalDate.of(2024, 1, 20))
                .isVerified(true)
                .workType(workTypes.get(1)) // Курсовая работа
                .student(students.get(0))
                .skills(new HashSet<>(Arrays.asList(
                        skills.get(0),  // Java
                        skills.get(29), // Алгоритмы
                        skills.get(34)  // Анализ данных
                )))
                .build();

        // Портфолио для второго студента
        PortfolioItem item3 = PortfolioItem.builder()
                .title("Интернет-магазин на React")
                .description("Frontend часть интернет-магазина с корзиной товаров, фильтрацией и адаптивным дизайном")
                .projectUrl("https://github.com/ivanovamaria/react-shop")
                .completionDate(LocalDate.of(2024, 4, 10))
                .isVerified(true)
                .workType(workTypes.get(0)) // Учебный проект
                .student(students.get(1))
                .skills(new HashSet<>(Arrays.asList(
                        skills.get(11), // JavaScript
                        skills.get(12), // React
                        skills.get(15), // HTML/CSS
                        skills.get(18), // Redux
                        skills.get(32)  // Figma
                )))
                .build();

        // Портфолио для третьего студента
        PortfolioItem item4 = PortfolioItem.builder()
                .title("Сертификат AWS Cloud Practitioner")
                .description("Официальный сертификат Amazon Web Services Cloud Practitioner")
                .fileUrl("/uploads/aws_certificate.pdf")
                .completionDate(LocalDate.of(2024, 3, 5))
                .isVerified(true)
                .workType(workTypes.get(4)) // Сертификат
                .student(students.get(2))
                .skills(new HashSet<>(Arrays.asList(
                        skills.get(28), // AWS
                        skills.get(26)  // Docker
                )))
                .build();

        // Портфолио для четвертого студента
        PortfolioItem item5 = PortfolioItem.builder()
                .title("Дипломная работа: Прогнозирование цен на недвижимость")
                .description("Модель машинного обучения для прогнозирования цен на недвижимость с использованием нейронных сетей")
                .projectUrl("https://github.com/smirnovaanna/house-price-prediction")
                .completionDate(LocalDate.of(2024, 6, 1))
                .isVerified(false) // Еще не проверено
                .workType(workTypes.get(2)) // Дипломная работа
                .student(students.get(3))
                .skills(new HashSet<>(Arrays.asList(
                        skills.get(2),  // Python
                        skills.get(33), // Машинное обучение
                        skills.get(35), // TensorFlow
                        skills.get(23), // Pandas
                        skills.get(22)  // MySQL
                )))
                .build();

        // Портфолио для пятого студента
        PortfolioItem item6 = PortfolioItem.builder()
                .title("Личный проект: Мобильное приложение для трекинга привычек")
                .description("Кроссплатформенное мобильное приложение на React Native для отслеживания полезных привычек")
                .projectUrl("https://github.com/kozlovdmitry/habit-tracker")
                .completionDate(LocalDate.of(2024, 2, 28))
                .isVerified(true)
                .workType(workTypes.get(5)) // Личный проект
                .student(students.get(4))
                .skills(new HashSet<>(Arrays.asList(
                        skills.get(11), // JavaScript
                        skills.get(12), // React
                        skills.get(19), // React Native
                        skills.get(25), // Firebase
                        skills.get(32)  // Figma
                )))
                .build();

        // Портфолио для шестого студента
        PortfolioItem item7 = PortfolioItem.builder()
                .title("Хакатон: Приложение для экологического мониторинга")
                .description("Приложение-победитель хакатона по экологическим технологиям, позволяющее отслеживать уровень загрязнения воздуха")
                .projectUrl("https://github.com/fedorovaelena/eco-monitor")
                .completionDate(LocalDate.of(2024, 4, 22))
                .isVerified(true)
                .workType(workTypes.get(6)) // Хакатон
                .student(students.get(5))
                .skills(new HashSet<>(Arrays.asList(
                        skills.get(2),  // Python
                        skills.get(11), // JavaScript
                        skills.get(16), // Vue.js
                        skills.get(27), // IoT
                        skills.get(38)  // Английский язык
                )))
                .build();

        portfolioItemRepository.saveAll(Arrays.asList(item1, item2, item3, item4, item5, item6, item7));
        log.info("📁 Создано {} элементов портфолио", 7);
    }

    private void printSummary() {
        log.info("📊 ИТОГ ИНИЦИАЛИЗАЦИИ ДАННЫХ:");
        log.info("   👑 Администраторы: {}", teacherRepository.countByRole(Role.ADMIN));
        log.info("   👨‍🏫 Преподаватели: {}", teacherRepository.countByRole(Role.TEACHER));
        log.info("   👨‍🎓 Студенты: {}", studentRepository.count());
        log.info("   👥 Группы: {}", groupRepository.count());
        log.info("   📝 Типы работ: {}", workTypeRepository.count());
        log.info("   💡 Навыки: {}", skillRepository.count());
        log.info("   📁 Элементы портфолио: {}", portfolioItemRepository.count());

        log.info("\n🔑 ТЕСТОВЫЕ УЧЕТНЫЕ ЗАПИСИ:");
        log.info("   👑 Администратор: admin@portfolio.ru / Admin123!");
        log.info("   👨‍🏫 Преподаватель: ivanov@portfolio.ru / Teacher123!");
        log.info("   👨‍🎓 Студент: sidorov.alex@student.ru / Student123!");

        log.info("\n🌐 API ДОСТУПНО ПО АДРЕСАМ:");
        log.info("   📍 Основное API: http://localhost:8080/api");
        log.info("   📚 Swagger UI: http://localhost:8080/swagger-ui.html");
        log.info("   📄 OpenAPI Docs: http://localhost:8080/api-docs");
    }
}