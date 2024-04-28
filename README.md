# Modern Sentiment Analysis Service

This project provides a real-time sentiment analysis dashboard that dynamically updates sentiment plots based on keyword-specific data stored in Firebase Firestore. It is designed to visualize sentiment trends over a specified date range for user-entered keywords.

## Features

- **Real-Time Data Visualization**: Automatically updates sentiment plots when new data enters Firestore that matches the specified keywords and date range.
- **User-Friendly Interface**: Simple form input for keywords and date selection.
- **Responsive Design**: Works effectively across different devices and screen sizes.

## Prerequisites

Before you start, ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (typically installed with Node.js)

This project also requires a Firebase project with Firestore enabled.

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/sentiment-analysis-dashboard.git
cd sentiment-analysis-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Firebase
Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
Enable Firestore in your Firebase project.
Add your Firebase project credentials to the project:
```javascript
const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-auth-domain',
  projectId: 'your-project-id',
  storageBucket: 'your-storage-bucket',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
  measurementId: 'your-measurement-id'
};
firebase.initializeApp(firebaseConfig);
```

## Deployment

To deploy this project to Firebase Hosting, follow these steps:

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in Your Project
```bash
firebase init
```

### 4. Deploy to Firebase Hosting
```bash
firebase deploy
```

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is open source and available under the MIT License.

