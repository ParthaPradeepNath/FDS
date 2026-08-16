# One Hub — Feedback Management System

> A MERN-stack web application that helps organizations collect, organize, and analyze user feedback in one place.

## Project Overview

**One Hub** is designed to make feedback collection and analysis simple, structured, and actionable. Users can submit ratings, comments, categories, and suggestions, while administrators can securely review individual responses and use dashboards and reports to identify satisfaction levels and recurring concerns.

The system is suitable for universities, businesses, training institutes, and any organization that wants to understand user experience and improve its services.

## Problem Statement

Many organizations receive feedback through informal channels such as paper forms, email, or chat messages. This makes feedback difficult to organize, analyze, and act upon. Important recurring issues can be missed, and decision-makers lack a clear view of user satisfaction.

This project provides a centralized digital solution for collecting feedback and converting it into useful insights.

## Objectives

- Collect ratings, comments, categories, and suggestions through a simple feedback form.
- Allow users to view and manage their submitted feedback.
- Give administrators a secure dashboard to monitor feedback.
- Provide reports that reveal satisfaction trends and recurring issues.
- Maintain feedback data securely using authentication and authorization.
- Optionally use AI to summarize comments and identify their sentiment or topic.

## Key Features

### User Features

- Secure login using JWT-based authentication.
- Submit feedback with a rating, category, comment, and suggestion.
- View previously submitted feedback in **My Feedback**.
- Edit or delete feedback where permitted.
- Review the details and status of an individual feedback entry.

### Administrator Features

- Access an admin dashboard with feedback statistics and charts.
- View, filter, and manage all feedback submissions.
- Open detailed feedback records for closer review.
- Analyze reports by rating, category, and time period.
- Identify repeated complaints, suggestions, and satisfaction patterns.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React.js, HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Token (JWT) |
| Charts and Reporting | Chart.js |
| Full Stack | MERN |

## Main Pages

| Page | Purpose |
| --- | --- |
| Landing | Introduces the system and directs users to log in or provide feedback. |
| Login | Authenticates users and administrators. |
| Feedback Form | Captures rating, category, comment, and suggestion. |
| My Feedback | Shows feedback submitted by the logged-in user. |
| Admin Dashboard | Displays summary cards, charts, and recent feedback for administrators. |
| Feedback List | Shows a searchable and filterable list of feedback entries. |
| Feedback Details | Displays complete information for one feedback record. |
| Reports | Presents feedback trends and category/rating-based analysis. |

## System Architecture

```text
React Frontend
     |
     | HTTP requests with JWT
     v
Node.js + Express.js API
     |
     | Mongoose ODM
     v
MongoDB Database
     |
     +--> users
     +--> feedback
     +--> categories
```

## Database Design

### `users` Collection

Stores account and role information.

| Field | Type | Description |
| --- | --- | --- |
| `_id` | ObjectId | Unique user identifier |
| `name` | String | User's full name |
| `email` | String | Unique email address |
| `password` | String | Hashed password |
| `role` | String | Access level, such as `user` or `admin` |
| `createdAt` | Date | Account creation date |

### `feedback` Collection

Stores all feedback submissions.

| Field | Type | Description |
| --- | --- | --- |
| `_id` | ObjectId | Unique feedback identifier |
| `userId` | ObjectId | Reference to the submitting user |
| `categoryId` | ObjectId | Reference to the selected category |
| `rating` | Number | Rating value, typically 1 to 5 |
| `comment` | String | Main feedback comment |
| `suggestion` | String | Suggested improvement |
| `status` | String | Review status, such as `new`, `reviewed`, or `resolved` |
| `createdAt` | Date | Submission date and time |
| `updatedAt` | Date | Last update date and time |

### `categories` Collection

Stores feedback categories used for organization and reporting.

| Field | Type | Description |
| --- | --- | --- |
| `_id` | ObjectId | Unique category identifier |
| `name` | String | Category name, e.g. Service, Faculty, Product, or Support |
| `description` | String | Brief explanation of the category |
| `isActive` | Boolean | Indicates whether the category can be selected |

## API Endpoints

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Authenticates a user and returns a JWT. | Public |
| `POST` | `/api/feedback` | Creates a new feedback entry. | Authenticated user |
| `GET` | `/api/feedback` | Retrieves feedback records. Administrators can access all records; users access their own. | Authenticated |
| `GET` | `/api/feedback/:id` | Retrieves a single feedback record. | Authorized user/admin |
| `PUT` | `/api/feedback/:id` | Updates an existing feedback record. | Authorized user/admin |
| `DELETE` | `/api/feedback/:id` | Deletes a feedback record. | Authorized user/admin |
| `GET` | `/api/reports` | Returns summarized data for charts and reports. | Administrator |

### Example Feedback Request

```json
{
  "categoryId": "CATEGORY_OBJECT_ID",
  "rating": 4,
  "comment": "The sessions were informative and well organized.",
  "suggestion": "Please include more hands-on activities."
}
```

## Security and Access Control

- Passwords should be encrypted using a secure hashing library such as bcrypt.
- JWT tokens should protect private API routes.
- Role-based authorization should restrict dashboard and reporting features to administrators.
- Input validation should be applied to all API requests.
- Users should only be allowed to modify or delete their own feedback unless they are administrators.

## Dashboard and Reports

The administrator dashboard can use Chart.js to visualize:

- Average rating and total feedback count.
- Rating distribution from 1 to 5.
- Feedback count by category.
- Feedback trends over time.
- Recent feedback submissions.
- Common categories or low-rated areas requiring attention.

## Optional AI Enhancement

An AI-powered module can make large volumes of written feedback easier to understand. It may:

- Generate concise summaries of many comments.
- Classify comments as positive, negative, or neutral.
- Group comments by topic, such as teaching quality, facilities, support, or product quality.
- Highlight frequently mentioned issues for administrators.

This enhancement is optional and does not replace the core feedback management workflow.

## Real-World Applications

- **Universities:** Collect student feedback on courses, faculty, facilities, and events.
- **Businesses:** Measure customer satisfaction and identify service or product concerns.
- **Training Institutes:** Improve training quality using learner feedback.
- **Organizations:** Gather employee, client, or stakeholder suggestions.

## Expected Impact

The Feedback Management System helps organizations make evidence-based improvements. By bringing ratings and comments into a single platform, it enables administrators to detect satisfaction levels, identify recurring issues early, and prioritize meaningful improvements.

## Future Enhancements

- Email notifications when feedback is submitted or resolved.
- Advanced filtering by date, category, rating, and status.
- Feedback export in PDF or Excel format.
- Anonymous feedback option.
- Category management panel for administrators.
- Multi-language support.
- Mobile-responsive interface and progressive web app support.
- AI-based sentiment analysis and automated topic classification.

## Conclusion

This project demonstrates a complete MERN application with authentication, CRUD operations, database integration, data visualization, and role-based access control. It solves a practical problem for multiple types of organizations and can be extended with AI features to generate deeper insights from feedback.
