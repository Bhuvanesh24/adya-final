# Business Requirements Document (BRD)

## Project Title
**AI-Powered Job Application Tracker**

---

## 1. Project Overview

The AI-Powered Job Application Tracker is a full-stack web application designed to help job seekers manage, track, and optimize their job search journey efficiently. The application leverages AI to assist with resume optimization, cover letter generation, and interview preparation while keeping all job applications organized and accessible in one place.

---

## 2. Goals and Objectives

- Provide a centralized dashboard to manage job applications.
- Offer AI-driven features for resume and cover letter improvement.
- Automate reminders for follow-ups and interviews.
- Allow users to track the status of each application and get insights.
- Provide analytics to track job search performance.

---

## 3. Key Features


|  Job Applications        | Add, update, delete, and track job applications.              |
|   Reminder System        | Set and manage reminders for follow-ups, interviews, tasks.         |
|   Resume Optimizer       | Use AI to analyze and improve uploaded resumes.                   |
|   Cover Letter Builder   | Generate cover letters based on job title and resume using AI.       |
|   Interview Preparation  | Generate common and role-specific interview questions using AI.        |
|   Analytics Dashboard    | Visualize application progress, success rates, and timelines.      |
|   Authentication         | Secure login and registration system using JWT and cookies.           |
|   Deployment             | Deployed on cloud (e.g., Render/AWS/GCP/Azure).                    |

---

## 4. Stakeholders

| Role              | Responsibility                            |
|-------------------|--------------------------------------------|
| User (Job Seeker) | Uses the app to manage job search workflow |
| Admin (Optional)  | Manages users and backend (future scope)   |

---

## 5. Functional Requirements

- Users must be able to register and log in securely.
- Users can create, edit, and delete job applications.
- Each application can have reminders attached.
- AI endpoints must return relevant results (resume tips, questions).
- Users receive reminders visually through UI badges.
- Data must be persisted in MongoDB securely.

---

## 6. Non-Functional Requirements

- Responsive UI on desktop and mobile.
- Fast API response (<300ms average).
- Secure API with rate-limiting and token-based auth.
- Well-documented code and API structure.
- Easy deployment and scalability.

---

## 7. Tech Stack

| Layer          | Technologies Used                  |
|----------------|------------------------------------|
| Frontend       | React + Tailwind CSS               |
| Backend        | Node.js + Express                  |
| AI Integration | HuggingFace API                    |
| Database       | MongoDB Atlas                      |
| Deployment     | AWS / GCP (any 1)                  |
| Testing        | Postman                            |

---



## 8. Risks & Assumptions

- Heavy usage of AI may result in API cost if not rate-limited.
- Assume single-user access only (multi-user not required for MVP).
- External API limits may affect AI feature reliability.

---

## 9. Success Criteria

- A working full-stack application with AI capabilities.
- Clean, responsive UI and secure API structure.
- Clear documentation and smooth deployment.
- Positive feedback from project reviewers.

---

**Prepared By:** Bhuvaneshwaran K  
**Date:** 22 June 2025
