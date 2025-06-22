Reminder Management App
This is a full-stack reminder management application that allows users to register, log in, and create, update, and delete reminders. The application supports secure authentication, persistent storage using MongoDB, and is deployed to the cloud.

Project Overview
The app allows users to:

Register and log in with secure authentication

Create reminders with titles, descriptions, and due dates

View a list of all reminders

Edit and delete existing reminders

Use an AI assistant to summarize or suggest reminders (if enabled)

Technology Stack
Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB

Authentication: JWT-based authentication using HTTP-only cookies

Deployment: Render (can also be hosted on AWS/GCP/Azure)

AI Integration: Hugging Face Inference API (if applicable)

Project Setup
Clone the repository

bash
git clone https://github.com/yourusername/reminder-app.git
cd reminder-app

Install dependencies

bash

cd backend
npm install

cd ../frontend
npm install



Create a .env file in the root of the backend folder using the .env.example file


# In backend folder
npm run dev

# In frontend folder
npm run dev

Folder Structure
The backend and frontend are organized in separate folders with modular components and clean architecture. The backend uses a controller-service-model structure and the frontend is built using reusable components and routes.The env file is located in backend folder

# AI Tools Used
Hugging Face Inference API was used to demonstrate AI integration by summarizing reminder descriptions or suggesting reminders.
ClaudeAI,ChatGpt


# Testing
API testing was performed using Postman
Postman was used for API testing and collection generation.
Test report is available in docs/test-report.md

The Postman collection is included as docs/api-tests.postman_collection.json

# Deployment
The application is deployed using AWS 

Deployed URL: [Your Render/AWS/GCP Link]

# Documentation
Wireframes are available in docs/wireframes/

Architecture and flow diagrams are available in docs/

Business Requirements Document (BRD) is included in docs/BRD.md

Test report and Postman collection are included in the docs/ folder

# Demo Video
The demonstration video of the application with feature walkthrough and functionality is available here: [Your video link]