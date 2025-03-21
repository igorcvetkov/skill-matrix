# Skill Matrix Frontend

This is the alternative frontend implementation for the Skill Matrix project. It allows employees to self-assess their skills using a binary input system.

## Features

- **Skill Self-Assessment**: Users can check off skills they possess
- **Weighted Scoring**: Each skill has a weight that contributes to the overall score
- **Collapsible Categories**: Skills are organized into collapsible categories for easy navigation
- **Progress Tracking**: A progress bar shows completion status
- **Summary Dashboard**: After submission, users can see a summary of their skills with scores per category
- **Growth Suggestions**: Based on unchecked skills, the system suggests areas for growth
- **Export Options**: Users can download their assessment as PDF or CSV

## Project Structure

- `src/components/SkillMatrix.vue`: Main container component for the skill matrix
- `src/components/SkillCategory.vue`: Component for each collapsible skill category
- `src/components/SkillSummary.vue`: Component for displaying the assessment summary
- `src/services/skillMatrixApi.js`: Service for handling API calls related to the skill matrix

## Implementation Details

The skill matrix follows the UX team's recommendations:

1. **Binary Input System**: Skills are represented as checkboxes (checked = 1, unchecked = 0)
2. **Weighted Scoring**: Each skill has a weight that contributes to the category and overall scores
3. **Collapsible Categories**: Categories can be expanded/collapsed for better organization
4. **Progress Tracking**: A progress bar shows the percentage of skills assessed
5. **Tooltips**: Information icons provide additional context for skills
6. **Bulk Selection**: "Select All" and "Deselect All" buttons for each category
7. **Notes**: Optional notes field for each category
8. **Summary Dashboard**: Shows scores per category and overall score
9. **Growth Suggestions**: Recommends areas for improvement based on unchecked skills
10. **Export Options**: PDF and CSV export functionality

## Development Status

This is a work in progress. Currently implemented:

- Basic UI components
- Skill category structure
- Binary input system
- Progress tracking
- Summary dashboard

To be implemented:

- Integration with backend API
- PDF and CSV export functionality
- User feedback system

## Getting Started

```bash
# Install dependencies
npm install

# Serve with hot reload at localhost:8080
npm run serve

# Build for production
npm run build
```

## Environment Variables

Create a `.env.local` file with the following variables:

```
VUE_APP_BACKEND_HOST=http://localhost
VUE_APP_BACKEND_PORT=3000
VUE_APP_MSAL_CLIENT_ID=your-client-id
VUE_APP_MSAL_TENANT_ID=your-tenant-id
VUE_APP_MSAL_REDIRECT_URI=http://localhost:8080
```

## Docker

To build and run the application with Docker:

```bash
# From the project root
NODE_ENV=local docker-compose up --build front-alt
```

## Testing Authentication

1. Navigate to http://localhost:8081
2. You will be redirected to the login page
3. Click "Sign in with Microsoft"
4. Complete the Microsoft authentication process
5. You will be redirected back to the application

## License

This project is licensed under the MIT License. 