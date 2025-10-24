export type Language = 'en' | 'es';

export const translations = {
  en: {
    // Navigation
    login: 'Login',
    signup: 'Sign Up',
    signOut: 'Sign Out',
    
    // Home Page
    appName: 'HealthCoach',
    heroTitle: 'Your AI-Powered',
    heroSubtitle: 'Nutrition Coach',
    heroDescription: 'Track your meals, get instant nutrition insights, and achieve your health goals with AI-powered food analysis.',
    getStarted: 'Get Started Free',
    learnMore: 'Learn More',
    
    // Features
    features: 'Features',
    photoLoggingTitle: 'Photo Logging',
    photoLoggingDesc: 'Simply snap a photo of your meal and let AI do the rest',
    aiAnalysisTitle: 'AI Analysis',
    aiAnalysisDesc: 'Get instant calorie and macro breakdowns powered by AI',
    trackProgressTitle: 'Track Progress',
    trackProgressDesc: 'Monitor your nutrition over time and hit your goals',
    
    // Auth Pages
    welcomeBack: 'Welcome Back',
    signInSubtitle: 'Sign in to your HealthCoach account',
    createAccount: 'Create Account',
    startJourney: 'Start your health journey today',
    verifyEmail: 'Verify Your Email',
    verificationSent: 'We sent a verification code to',
    
    // Form Fields
    email: 'Email',
    password: 'Password',
    verificationCode: 'Verification Code',
    passwordRequirements: 'Must be at least 8 characters with uppercase, lowercase, and numbers',
    
    // Buttons
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    signUp: 'Sign Up',
    creatingAccount: 'Creating account...',
    verifyEmailBtn: 'Verify Email',
    verifying: 'Verifying...',
    
    // Links
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    signInLink: 'Sign in',
    signUpLink: 'Sign up',
    
    // Dashboard
    yourFoodLog: 'Your Food Log',
    trackMeals: 'Track your meals and nutrition',
    addNewMeal: 'Add New Meal',
    addMeal: 'Add Meal',
    noLogsYet: 'No food logs yet. Start tracking your meals!',
    viewDetails: 'View Details',
    
    // Meal Types
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    
    // Footer
    poweredBy: 'Powered by AWS & Next.js',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    account: 'Account',
    back: 'Back',
    cancel: 'Cancel',
    delete: 'Delete',
    deleting: 'Deleting...',
    deleteConfirmTitle: 'Delete Food Log?',
    deleteConfirmMessage: 'This action cannot be undone. The food log will be permanently deleted.',
    calories: 'Calories',
    photos: 'Photos',
    analysis: 'Analysis',
    metadata: 'Information',
    createdAt: 'Created',
    
    // New Log Page
    newFoodLog: 'New Food Log',
    mealType: 'Meal Type',
    dateTime: 'Date & Time',
    photo: 'Photo',
    optional: 'Optional',
    notes: 'Notes',
    clickToUpload: 'Click to upload photo',
    imageSize: 'PNG, JPG up to 10MB',
    addNotes: 'Add any notes about your meal...',
    notesHelper: 'Describe what you ate, portion sizes, or any other details',
    uploading: 'Uploading...',
    creating: 'Creating...',
    createFoodLog: 'Create Food Log',
    invalidImage: 'Please select a valid image file',
    imageTooLarge: 'Image size must be less than 10MB',
    
    // Health Profile
    healthProfile: 'Health Profile',
    myHealthProfile: 'My Health Profile',
    createProfilePrompt: 'Create your health profile to get started',
    editProfile: 'Edit Profile',
    saveProfile: 'Save Profile',
    saving: 'Saving...',
    basicInfo: 'Basic Information',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    preferNotToSay: 'Prefer not to say',
    measurements: 'Measurements',
    currentWeight: 'Current Weight',
    height: 'Height',
    targetWeight: 'Target Weight',
    kg: 'kg',
    cm: 'cm',
    healthConditions: 'Health Conditions',
    medicalConditions: 'Medical Conditions',
    allergies: 'Allergies',
    medications: 'Current Medications',
    familyHistory: 'Family History',
    lifestyle: 'Lifestyle',
    activityLevel: 'Activity Level',
    sedentary: 'Sedentary',
    lightActivity: 'Light Activity',
    moderateActivity: 'Moderate Activity',
    active: 'Active',
    veryActive: 'Very Active',
    smokingStatus: 'Smoking Status',
    never: 'Never',
    former: 'Former',
    current: 'Current',
    alcoholConsumption: 'Alcohol Consumption',
    none: 'None',
    occasional: 'Occasional',
    moderate: 'Moderate',
    frequent: 'Frequent',
    healthGoals: 'Health Goals',
    loseWeight: 'Lose Weight',
    buildMuscle: 'Build Muscle',
    improveHealth: 'Improve Health',
    manageCondition: 'Manage Condition',
    
    // Health Metrics
    healthMetrics: 'Health Metrics',
    trackMetrics: 'Track Metrics',
    addMetric: 'Add Metric',
    weight: 'Weight',
    bodyFat: 'Body Fat',
    muscleMass: 'Muscle Mass',
    bloodPressure: 'Blood Pressure',
    heartRate: 'Heart Rate',
    glucose: 'Blood Glucose',
    cholesterol: 'Cholesterol',
    measuredAt: 'Measured At',
    progress: 'Progress',
    trends: 'Trends',
    bmi: 'BMI',
    healthScore: 'Health Score',
    select: 'Select...',
    typeAndPressEnter: 'Type and press Enter',
    add: 'Add',
  },
  es: {
    // Navigation
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    signOut: 'Cerrar Sesión',
    
    // Home Page
    appName: 'HealthCoach',
    heroTitle: 'Tu Entrenador de',
    heroSubtitle: 'Nutrición con IA',
    heroDescription: 'Registra tus comidas, obtén información nutricional instantánea y alcanza tus objetivos de salud con análisis impulsado por IA.',
    getStarted: 'Comenzar Gratis',
    learnMore: 'Saber Más',
    
    // Features
    features: 'Características',
    photoLoggingTitle: 'Registro con Fotos',
    photoLoggingDesc: 'Simplemente toma una foto de tu comida y deja que la IA haga el resto',
    aiAnalysisTitle: 'Análisis con IA',
    aiAnalysisDesc: 'Obtén desglose instantáneo de calorías y macros impulsado por IA',
    trackProgressTitle: 'Seguimiento de Progreso',
    trackProgressDesc: 'Monitorea tu nutrición con el tiempo y alcanza tus objetivos',
    
    // Auth Pages
    welcomeBack: 'Bienvenido de Nuevo',
    signInSubtitle: 'Inicia sesión en tu cuenta de HealthCoach',
    createAccount: 'Crear Cuenta',
    startJourney: 'Comienza tu viaje de salud hoy',
    verifyEmail: 'Verifica tu Correo',
    verificationSent: 'Enviamos un código de verificación a',
    
    // Form Fields
    email: 'Correo Electrónico',
    password: 'Contraseña',
    verificationCode: 'Código de Verificación',
    passwordRequirements: 'Debe tener al menos 8 caracteres con mayúsculas, minúsculas y números',
    
    // Buttons
    signIn: 'Iniciar Sesión',
    signingIn: 'Iniciando sesión...',
    signUp: 'Registrarse',
    creatingAccount: 'Creando cuenta...',
    verifyEmailBtn: 'Verificar Correo',
    verifying: 'Verificando...',
    
    // Links
    noAccount: '¿No tienes una cuenta?',
    haveAccount: '¿Ya tienes una cuenta?',
    signInLink: 'Iniciar sesión',
    signUpLink: 'Registrarse',
    
    // Dashboard
    yourFoodLog: 'Tu Registro de Comidas',
    trackMeals: 'Registra tus comidas y nutrición',
    addNewMeal: 'Agregar Nueva Comida',
    addMeal: 'Agregar Comida',
    noLogsYet: '¡Aún no hay registros de comidas. Comienza a registrar tus comidas!',
    viewDetails: 'Ver Detalles',
    
    // Meal Types
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena',
    snack: 'Merienda',
    
    // Footer
    poweredBy: 'Desarrollado por AWS & Next.js',
    
    // Common
    loading: 'Cargando...',
    error: 'Error',
    account: 'Cuenta',
    back: 'Atrás',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    deleting: 'Eliminando...',
    deleteConfirmTitle: '¿Eliminar registro?',
    deleteConfirmMessage: 'Esta acción no se puede deshacer. El registro será eliminado permanentemente.',
    calories: 'Calorías',
    photos: 'Fotos',
    analysis: 'Análisis',
    metadata: 'Información',
    createdAt: 'Creado',
    
    // New Log Page
    newFoodLog: 'Nuevo Registro de Comida',
    mealType: 'Tipo de Comida',
    dateTime: 'Fecha y Hora',
    photo: 'Foto',
    optional: 'Opcional',
    notes: 'Notas',
    clickToUpload: 'Haz clic para subir foto',
    imageSize: 'PNG, JPG hasta 10MB',
    addNotes: 'Agrega notas sobre tu comida...',
    notesHelper: 'Describe lo que comiste, tamaños de porción u otros detalles',
    uploading: 'Subiendo...',
    creating: 'Creando...',
    createFoodLog: 'Crear Registro',
    invalidImage: 'Por favor selecciona un archivo de imagen válido',
    imageTooLarge: 'El tamaño de la imagen debe ser menor a 10MB',
    
    // Health Profile
    healthProfile: 'Perfil de Salud',
    myHealthProfile: 'Mi Perfil de Salud',
    createProfilePrompt: 'Crea tu perfil de salud para comenzar',
    editProfile: 'Editar Perfil',
    saveProfile: 'Guardar Perfil',
    saving: 'Guardando...',
    basicInfo: 'Información Básica',
    dateOfBirth: 'Fecha de Nacimiento',
    gender: 'Género',
    male: 'Masculino',
    female: 'Femenino',
    other: 'Otro',
    preferNotToSay: 'Prefiero no decir',
    measurements: 'Medidas',
    currentWeight: 'Peso Actual',
    height: 'Altura',
    targetWeight: 'Peso Objetivo',
    kg: 'kg',
    cm: 'cm',
    healthConditions: 'Condiciones de Salud',
    medicalConditions: 'Condiciones Médicas',
    allergies: 'Alergias',
    medications: 'Medicamentos Actuales',
    familyHistory: 'Historial Familiar',
    lifestyle: 'Estilo de Vida',
    activityLevel: 'Nivel de Actividad',
    sedentary: 'Sedentario',
    lightActivity: 'Actividad Ligera',
    moderateActivity: 'Actividad Moderada',
    active: 'Activo',
    veryActive: 'Muy Activo',
    smokingStatus: 'Estado de Tabaquismo',
    never: 'Nunca',
    former: 'Ex fumador',
    current: 'Actual',
    alcoholConsumption: 'Consumo de Alcohol',
    none: 'Ninguno',
    occasional: 'Ocasional',
    moderate: 'Moderado',
    frequent: 'Frecuente',
    healthGoals: 'Objetivos de Salud',
    loseWeight: 'Perder Peso',
    buildMuscle: 'Ganar Músculo',
    improveHealth: 'Mejorar Salud',
    manageCondition: 'Controlar Condición',
    
    // Health Metrics
    healthMetrics: 'Métricas de Salud',
    trackMetrics: 'Seguimiento de Métricas',
    addMetric: 'Agregar Métrica',
    weight: 'Peso',
    bodyFat: 'Grasa Corporal',
    muscleMass: 'Masa Muscular',
    bloodPressure: 'Presión Arterial',
    heartRate: 'Frecuencia Cardíaca',
    glucose: 'Glucosa en Sangre',
    cholesterol: 'Colesterol',
    measuredAt: 'Medido el',
    progress: 'Progreso',
    trends: 'Tendencias',
    bmi: 'IMC',
    healthScore: 'Puntuación de Salud',
    select: 'Seleccionar...',
    typeAndPressEnter: 'Escribe y presiona Enter',
    add: 'Agregar',
  },
};

export const detectUserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  
  // Check localStorage first
  const stored = localStorage.getItem('language') as Language;
  if (stored && (stored === 'en' || stored === 'es')) {
    return stored;
  }
  
  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('es')) {
    return 'es';
  }
  
  return 'en';
};
