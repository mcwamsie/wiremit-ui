# Wiremit - International Money Transfer Application

Wiremit is a modern Vue 3 application for international money transfers, built with TypeScript, Vite, and Tailwind CSS. The application provides a seamless user experience for sending money globally with real-time exchange rates and transaction tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository and install dependencies:
```sh
pnpm install
```

2. Create environment configuration:
```sh
cp .env .env.local
```

3. Start the development server:
```sh
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Account
Use these credentials to test the application:
- **Email:** demo@wiremit.com
- **Password:** demo123

## 🛠️ Available Scripts

```sh
# Development server with hot reload
pnpm dev

# Type checking
pnpm type-check

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint

# Format code
pnpm format
```

## 🏗️ Architecture & Design Choices

### Frontend Framework
- **Vue 3 Composition API**: Chosen for its excellent TypeScript support, reactivity system, and modern development experience
- **TypeScript**: Provides type safety, better IDE support, and improved code maintainability
- **Vite**: Fast build tool with excellent HMR and modern ES modules support

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development and consistent design
- **Lucide Vue**: Modern icon library with tree-shaking support
- **Responsive Design**: Mobile-first approach ensuring compatibility across all devices

### State Management
- **Pinia**: Vue's official state management solution, chosen for its simplicity and excellent TypeScript integration
- **Local Storage**: Used for demo user persistence and authentication state

### Routing & Navigation
- **Vue Router**: Official routing solution with route guards for authentication
- **Layout System**: Flexible layout system supporting auth and dashboard layouts

### API & Data Management
- **Environment Variables**: Secure configuration management using Vite's env system
- **Mock API Integration**: Real API endpoints with fallback data for development
- **Type-Safe API**: Comprehensive TypeScript interfaces for all API responses

### Code Quality & Development
- **ESLint**: Code linting with Vue and TypeScript rules
- **Prettier**: Code formatting for consistent style
- **Vue DevTools**: Enhanced debugging experience

## 📁 Project Structure

```
src/
├── assets/          # Static assets (images, styles)
├── components/      # Reusable Vue components
│   ├── common/      # Generic components (modals, forms)
│   └── layout/      # Layout-specific components
├── router/          # Vue Router configuration
├── services/        # API services and external integrations
├── stores/          # Pinia state management
├── types.ts         # TypeScript type definitions
├── utils/           # Utility functions and helpers
└── views/           # Page-level components
    ├── auth/        # Authentication pages
    └── dashboard/   # Dashboard pages
```

## 🔧 Configuration

### Environment Variables
The application uses environment variables for configuration:

```env
VITE_API_BASE_URL=https://68976304250b078c2041c7fc.mockapi.io/api/wiremit
VITE_API_TIMEOUT=10000
VITE_API_RETRY_ATTEMPTS=3
VITE_API_RETRY_DELAY=1000
```

### TypeScript Configuration
- Strict type checking enabled
- Path aliases configured for clean imports
- Vue SFC support with proper type inference

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with consistent branding
- **Dark/Light Theme**: Adaptive design supporting user preferences
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Loading States**: Comprehensive loading indicators and skeleton screens
- **Error Handling**: User-friendly error messages and retry mechanisms
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## 🔐 Security Features

- **Input Validation**: Client-side validation with server-side verification
- **Type Safety**: Comprehensive TypeScript coverage preventing runtime errors
- **Environment Variables**: Secure configuration management
- **Route Guards**: Authentication-based access control

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Development Guidelines

### Code Style
- Use Composition API for all new components
- Follow TypeScript strict mode guidelines
- Implement proper error boundaries
- Write descriptive commit messages

### Component Guidelines
- Keep components focused and single-purpose
- Use props validation with TypeScript interfaces
- Implement proper event handling with typed emits
- Follow Vue 3 best practices for reactivity

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Build Errors:**
```sh
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Type Errors:**
```sh
# Run type checking
pnpm type-check
```

**Development Server Issues:**
```sh
# Clear Vite cache
pnpm dev --force
```

For additional support, please check the project issues or create a new one with detailed information about your problem.
