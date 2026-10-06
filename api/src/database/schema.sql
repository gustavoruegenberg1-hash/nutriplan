-- SCHEMA RELACIONAL NUTRIPLAN V2 (17 TABELAS)

PRAGMA foreign_keys = ON;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    age INTEGER,
    gender TEXT,
    weight REAL,
    height REAL,
    activity_level TEXT,
    goal TEXT,
    dietary_notes TEXT,
    bmr REAL,
    tdee REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. RESTRICTIONS
CREATE TABLE IF NOT EXISTS restrictions (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1
);

-- 4. USER_RESTRICTIONS
CREATE TABLE IF NOT EXISTS user_restrictions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    restriction_id TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'ALLERGY',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restriction_id) REFERENCES restrictions(id) ON DELETE CASCADE
);

-- 5. FOODS
CREATE TABLE IF NOT EXISTS foods (
    id TEXT PRIMARY KEY,
    legacy_id TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    source TEXT NOT NULL DEFAULT 'TACO',
    calories_per_100g REAL NOT NULL,
    protein_per_100g REAL NOT NULL,
    carbs_per_100g REAL NOT NULL,
    fat_per_100g REAL NOT NULL,
    fiber_per_100g REAL NOT NULL,
    sodium_mg_per_100g REAL,
    micronutrients_json TEXT,
    tags_json TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    is_verified INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

-- 6. DIETS
CREATE TABLE IF NOT EXISTS diets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. MEALS
CREATE TABLE IF NOT EXISTS meals (
    id TEXT PRIMARY KEY,
    diet_id TEXT NOT NULL,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    target_time TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (diet_id) REFERENCES diets(id) ON DELETE CASCADE
);

-- 8. MEAL_FOODS
CREATE TABLE IF NOT EXISTS meal_foods (
    id TEXT PRIMARY KEY,
    meal_id TEXT NOT NULL,
    food_id TEXT NOT NULL,
    quantity_grams REAL NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE RESTRICT
);

-- 9. EXERCISES
CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    equipment TEXT,
    difficulty_level TEXT DEFAULT 'BEGINNER',
    instructions TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

-- 10. WORKOUTS
CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    split_name TEXT,
    estimated_duration_min INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. WORKOUT_EXERCISES
CREATE TABLE IF NOT EXISTS workout_exercises (
    id TEXT PRIMARY KEY,
    workout_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    sets INTEGER NOT NULL DEFAULT 3,
    reps INTEGER NOT NULL DEFAULT 10,
    weight_kg REAL NOT NULL DEFAULT 0,
    rest_seconds INTEGER NOT NULL DEFAULT 60,
    notes TEXT,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT
);

-- 12. WORKOUT_LOGS (RN24: Histórico imutável preservado mesmo se workout for deletado)
CREATE TABLE IF NOT EXISTS workout_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    workout_id TEXT,
    workout_name TEXT NOT NULL,
    performed_date TEXT NOT NULL,
    duration_min INTEGER NOT NULL DEFAULT 45,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL
);

-- 13. WORKOUT_LOG_EXERCISES
CREATE TABLE IF NOT EXISTS workout_log_exercises (
    id TEXT PRIMARY KEY,
    log_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    sets_completed INTEGER NOT NULL,
    reps_completed INTEGER NOT NULL,
    weight_used_kg REAL NOT NULL,
    notes TEXT,
    FOREIGN KEY (log_id) REFERENCES workout_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT
);

-- 14. WEIGHT_HISTORY
CREATE TABLE IF NOT EXISTS weight_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    weight REAL NOT NULL,
    recorded_at TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 15. GOALS
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    target_value REAL NOT NULL,
    current_value REAL,
    deadline TEXT,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 16. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INFO',
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 17. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id TEXT,
    details_json TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 18. PROFESSIONAL_PROFILES
CREATE TABLE IF NOT EXISTS professional_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    profession TEXT NOT NULL,
    specialty TEXT,
    registry_type TEXT,
    registry_number TEXT,
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    reviewed_by TEXT,
    reviewed_at TEXT,
    review_notes TEXT,
    documents_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 19. PROFESSIONAL_CLIENTS
CREATE TABLE IF NOT EXISTS professional_clients (
    id TEXT PRIMARY KEY,
    professional_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (professional_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(professional_id, client_id)
);

-- 20. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ÍNDICES DE PERFORMANCE E INTEGRIDADE
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rest_user ON user_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_diets_user ON diets(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_diet ON meals(diet_id);
CREATE INDEX IF NOT EXISTS idx_meal_foods_meal ON meal_foods(meal_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_wo_exercises_wo ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_wo_logs_user ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_hist_user ON weight_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prof_user ON professional_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_prof_status ON professional_profiles(status);
CREATE INDEX IF NOT EXISTS idx_pc_prof ON professional_clients(professional_id);
CREATE INDEX IF NOT EXISTS idx_pc_client ON professional_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_msg_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_msg_receiver ON messages(receiver_id);

