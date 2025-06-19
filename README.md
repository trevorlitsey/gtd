# GTD (Getting Things Done) Application

A modern implementation of David Allen's Getting Things Done methodology, built with React and MongoDB.

## Features

- User authentication (signup/signin)
- Task management
- Project organization
- Context-based task filtering
- Next actions list
- Weekly review support

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   yarn install

   # Install frontend dependencies
   cd ../frontend
   yarn install
   ```

3. Set up environment variables:
   - Create `.env` file in the backend directory
   - Add the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=5001
     ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   yarn dev

   # Start frontend server
   cd ../frontend
   yarn start
   ```

## Project Structure

```
gtd/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend
└── README.md
``` 