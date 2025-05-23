# Intelliquiz - Smart Quiz Platform 🧠

![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-20.0-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

A modern quiz application built with React.js frontend and MongoDB backend, designed to deliver interactive quiz experiences with real-time analytics.

## 🌟 Features
- **User Authentication** 🔐  
  JWT-based secure login/registration system
- **Quiz Management** 📝  
  Create/Edit quizzes with multiple question types (MCQ, True/False, Open-ended)
- **Real-time Analytics** 📊  
  Instant results visualization with interactive charts
- **Session History** 🕒  
  Track previous quiz attempts with performance metrics
- **Responsive Design** 📱  
  Mobile-first approach using Tailwind CSS

## 🛠️ Tech Stack
- **Frontend**: React 18, React Router 6, Axios, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Testing**: Jest, React Testing Library

## 🚀 Installation
### Prerequisites
- Node.js ≥18.x
- MongoDB ≥7.x
- npm ≥9.x

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd quiz_app
npm install
```

## ⚙️ Configuration
Create `.env` files using these templates:

**backend/.env**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intelliquiz
JWT_SECRET=your_jwt_secret_key
```


## 🖥️ Usage
1. Start MongoDB service
2. Run backend:
```bash
cd backend
npm start
```
3. Run frontend:
```bash
cd quiz_app
npm start
```
4. Access at `http://localhost:3000`

## 📡 API Endpoints
| Method | Endpoint           | Description                |
|--------|--------------------|----------------------------|
| POST   | /api/auth/register | User registration          |
| POST   | /api/auth/login    | User authentication        |
| GET    | /api/quizzes       | Get all quizzes            |
| POST   | /api/quizzes       | Create new quiz            |
| GET    | /api/quizzes/:id   | Get single quiz            |
| POST   | /api/results       | Submit quiz results        |

## 🤝 Contributing
```bash
1. Fork the repository
2. Create feature branch: git checkout -b feature/your-feature
3. Commit changes: git commit -m 'Add some feature'
4. Push to branch: git push origin feature/your-feature
5. Submit pull request
```

## 📄 License
MIT License - See [LICENSE](LICENSE) for details
