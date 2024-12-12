# ux-evaluator
 
# UX Evaluator

## Overview

UX Evaluator is a web application designed to track user interactions and emotions while they navigate through a site. The application captures various user interactions such as mouse movements, clicks, hovers, scrolls, and page views, along with the user's emotional state detected via webcam.

## Features

- **Emotion Tracking**: Uses the webcam to detect and log user emotions.
- **Interaction Tracking**: Captures mouse movements, clicks, hovers, scrolls, and page views.

- **Data Collection**: Logs all interactions and emotions for analysis.

## Tech Stack

- **Frontend**: React, styled-components, face-api.js
- **Backend**: Node.js, Express, MySQL
- **Database**: MySQL

## Getting Started

### Prerequisites

- Node.js and npm installed
- MySQL server running

### Installation

1. Clone the repository:
```sh
git clone https://github.com/YunDo-Gi/ux-evaluator.git
cd ux-evaluator
```
2. Install dependencies:
```sh
cd frontend
npm install
cd ..
cd backend
npm install
```
3. Set up the database:
- Create a MySQL database named ux_tracking.
- Create the necessary tables: ```backend/db/schema.sql```
4. Configure environment variables:
Create a .env file in the backend directory with the following content:
```js
PORT=3001
DB_HOST=localhost
DB_USER=yout_username
DB_PASSWORD=your_password
DB_NAME=ux_tracking
DB_PORT=3306
```

### Running the Application
1. Start the backend server:
```sh
cd backend
npm start
```
2. Start the frontend development server:
```sh
cd ..
cd frontend
npm run dev
```
3. Open your browser and navigate to http://localhost:5173.