# AI Development Rules

This document outlines the technology stack and provides clear guidelines for the AI assistant on which libraries to use for specific functionalities within this Next.js application.

## Technology Stack

This is a modern web application built with the following technologies:

-   **Framework**: [Next.js](https://nextjs.org/) with the App Router.
-   **Language**: [TypeScript](https://www.typescriptlang.org/).
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
-   **UI Components**: A combination of [shadcn/ui](httpss://ui.shadcn.com/), which is built upon [Radix UI](https://www.radix-ui.com/), for a comprehensive set of accessible and composable components.
-   **Data Fetching**: [graphql-request](https://github.com/prisma-labs/graphql-request) for communicating with the WordPress GraphQL API.
-   **Icons**: [Lucide React](https://lucide.dev/) for a clean and consistent icon set.
-   **Forms**: [React Hook Form](https://react-hook-form.com/) for performant and flexible form state management, paired with [Zod](https://zod.dev/) for schema validation.
-   **Notifications**: [Sonner](https://sonner.emilkowal.ski/) for toast notifications.
-   **Charts & Data Visualization**: [Recharts](https://recharts.org/) for creating charts.

## Library Usage Rules

To maintain consistency and code quality, please adhere to the following rules when adding or modifying features:

### 1. UI and Components

-   **Primary Component Library**: **ALWAYS** use components from `shadcn/ui` for building the user interface. These components are pre-installed and located in the `components/ui` directory.
-   **Customization**: Do **NOT** modify the base `shadcn/ui` component files directly. If you need a customized version of a component, create a new component that wraps the `shadcn/ui` component and applies the necessary modifications.
-   **Layout**: Use `components/layout.tsx` for consistent page structure with a header and footer. For more complex layouts with sidebars, use the components from `components/ui/sidebar.tsx`.

### 2. Styling

-   **Styling**: **ALWAYS** use Tailwind CSS utility classes for styling.
-   **Custom CSS**: Avoid writing custom CSS. If absolutely necessary, add it to `app/globals.css`, but this should be a last resort.
-   **Colors & Theme**: Use the predefined colors in `tailwind.config.ts`. The theme is designed to match the `dropskey.com` branding.

### 3. Icons

-   **Icon Set**: **ONLY** use icons from the `lucide-react` library. This ensures visual consistency across the application.

### 4. Data Fetching

-   **API Communication**: Use the `graphql-request` library for all interactions with the WordPress GraphQL API endpoint defined in `process.env.NEXT_PUBLIC_WORDPRESS_API_URL`.

### 5. Forms

-   **Form Management**: **ALWAYS** use `react-hook-form` for handling form state, validation, and submissions.
-   **Validation**: Use `zod` to define validation schemas for your forms.

### 6. Routing and Navigation

-   **Routing**: Use the Next.js App Router for all page navigation. Create new pages as directories within the `app` folder.
-   **Links**: Use the `next/link` component for client-side navigation between pages.

### 7. Images

-   **Image Optimization**: **ALWAYS** use the `next/image` component to handle images. This provides automatic optimization, resizing, and lazy loading.

### 8. Notifications

-   **User Feedback**: Use `sonner` to display toast notifications for actions like successful form submissions or errors. The `Toaster` component is already configured in `components/ui/sonner.tsx`.

By following these rules, we can ensure the application remains clean, maintainable, and consistent.