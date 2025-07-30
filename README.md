<div align="center">
  <img src="/public/img/logo.png" alt="Credit Mate Logo" width="350">
</div>

A modern loan management dashboard.  
This application helps users track and manage their loans with an intuitive interface.

## Features

- 📊 Loan calculation and tracking
- ⏭️ Simulation of loan repayments
- 🐖 Saving opportunities analysis
- 🇪🇺 Multilingual support (English and French)
- 🎨 Modern UI with Nuxt UI components

## Tech Stack

- **Framework**: Nuxt 3
- **Frontend**: Vue 3 with Composition API
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Nuxt UI
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd loan-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run generate` - Generate static site

## Project Structure

```
app/
├── assets/          # Static assets and icons
├── components/      # Vue components
├── pages/          # Application pages
├── types/          # TypeScript type definitions
└── nuxt.config.ts  # Nuxt configuration
```

## Configuration

The theme can be customized in `nuxt.config.ts`:

```typescript
ui: {
  primary: 'blue',
  darkMode: 'class'
}
```

## Contributing

This project is primarily a personal/learning project and is not actively seeking contributions at this time. 
However, it remains open source under the MIT License, so you're welcome to fork the repository and adapt it for your own needs.

If you find any bugs or have suggestions, feel free to open an issue for discussion.

## License

This project is licensed under the MIT License.
