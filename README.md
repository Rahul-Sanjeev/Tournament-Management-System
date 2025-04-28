# Tournament-Management-System

A web-based tournament management system specifically designed for Karate competitions, following World Karate Federation (WKF) rules. Built with a React frontend and Django backend, the application allows users to create tournaments, add participants, and automatically generate competition brackets based on WKF categories.

## Table of Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Backend](#backend)
    - [Frontend](#frontend)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [WKF Rules and Participant Categorization](#wkf-rules-and-participant-categorization)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Key Features

- **Tournament Creation**: Create new Karate tournaments with customizable metadata (name, date, location).
- **Participant Management**: Add competitors with details such as age, weight, gender, and belt rank.
- **Automated Brackets**: Generate Kata and Kumite brackets automatically according to WKF age divisions (U14, Cadet, Junior, U21, Senior) and weight categories.
- **Authentication**: Secure login system using JSON Web Tokens (JWT), with tokens stored in localStorage.
- **Modern Frontend**: React-based UI employing custom hooks (`useForm`), Context API (`ToastContext`), and components (`ErrorBoundary`, `LoadingOverlay`) for improved UX and robust error handling.
- **Robust Backend**: Django REST framework with ORM-based data validation, participant categorization logic, and bracket generation while maintaining data integrity.

## Technology Stack

- **Frontend**: React, JavaScript, HTML5, CSS3, JWT for auth, custom hooks, Context API
- **Backend**: Python, Django, Django REST Framework, PostgreSQL (configured via environment variables)
- **Authentication**: JWT (localStorage)
- **Deployment**: [Render](https://render.com) or configurable for any cloud service

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Python (v3.8+)
- pip
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Tournament-Management-System.git
   cd Tournament-Management-System
   ```

#### Backend

1. Navigate to the backend folder:
   ```bash
   cd Backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate   # macOS/Linux
   venv\Scripts\activate      # Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set environment variables (e.g., in a `.env` file):
   ```env
   SECRET_KEY=your_django_secret_key
   DEBUG=True
   DATABASE_URL=postgres://user:password@hostname:5432/dbname
   ```
5. Run database migrations and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

#### Frontend

1. Navigate to the frontend folder:
   ```bash
   cd ../Frontend/cinefy
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file for the API endpoint:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Open your browser at `http://localhost:3000` (or your configured frontend URL).
2. Register or log in with your credentials.
3. Create a new tournament from the dashboard.
4. Add participants by filling in age, weight, gender, and belt rank.
5. View generated brackets for Kata and Kumite divisions.
6. Manage, edit, or delete tournaments and participants as needed.

## Project Structure

```
Tournament-Management-System/
├── Backend/                # Django backend
│   ├── manage.py
│   ├── requirements.txt
│   └── tournament_app/     # Main Django app
│       ├── models.py       # Participant, Tournament, Bracket models
│       ├── views.py        # API endpoints
│       └── serializers.py  # DRF serializers
├── Frontend/               # React frontend
│   └── cinefy/
│       ├── src/
│       │   ├── components/ # UI components
│       │   ├── hooks/      # useForm, etc.
│       │   ├── context/    # ToastContext
│       │   └── App.js
│       └── package.json
└── README.md
```

## WKF Rules and Participant Categorization

Participants are automatically placed into WKF-sanctioned divisions based on:

- **Age Groups**: U14, Cadet, Junior, U21, Senior
- **Gender**: Male, Female
- **Weight Categories**: Standard WKF weight bands per age/gender
- **Event Type**: Kata or Kumite

This ensures fair match-ups and compliance with international Karate competition standards.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add some feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request and describe your changes.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

**Developer**: Rahul Sanjeev

- Email: rahul.sanjeev9@gmail.com
- GitHub: https://github.com/Rahul-Sanjeev
- LinkedIn: https://www.linkedin.com/in/rahulsanjeev/
- Instagram: https://www.instagram.com/rahul._.sanjeev/
- Portfolio: https://www.rahulsanjeev.in

