# PemBlle

A modern, real-time anonymous Q&A social platform where users can send and receive anonymous messages (tells), answer them publicly, and build meaningful connections.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go Version](https://img.shields.io/badge/Go-1.23-00ADD8?logo=go)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

## Features

- **Anonymous Tells** - Send anonymous messages to any user
- **Public Answers** - Answer tells publicly on your profile
- **Real-time Chat** - Direct messaging with real-time updates via WebSocket
- **Real-time Notifications** - Instant notifications for new tells and messages
- **User Profiles** - Customizable profiles with avatars
- **Follow System** - Follow users anonymously or publicly
- **Multi-language** - Supports English, Arabic, and Kurdish with full RTL support
- **Email Verification** - Secure account registration
- **Responsive Design** - Beautiful UI on all devices
- **Dark Mode** - Modern dark theme optimized for all screen sizes

## Tech Stack

### Backend
- **Go 1.23** with [Fiber](https://gofiber.io/) web framework
- **PostgreSQL** database with GORM ORM
- **JWT** authentication
- **WebSocket** for real-time features

### Frontend
- **React 18** with Vite
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **i18next** for internationalization
- **Lucide React** for icons

## Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ihsandara/PemBlle.git
   cd PemBlle
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   ```env
   # Database
   POSTGRES_USER=pemblle
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_DB=pemblle

   # JWT Secret (generate a strong random string)
   JWT_SECRET=your-super-secret-jwt-key

   # SMTP Settings (for email verification)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com

   # Frontend URL
   FRONTEND_URL=https://yourdomain.com
   ```

4. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Access the app**
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - Health check: http://localhost/api/health

## Development Setup

### Backend (Go)

```bash
cd pemblle_backend

# Install dependencies
go mod download

# Create .env file
cp ../.env.example .env

# Run the server
go run main.go
```

### Frontend (React)

```bash
cd pemblle_frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/verify/:token` | Verify email |
| POST | `/api/auth/resend-verification` | Resend verification email |
| PUT | `/api/auth/password` | Change password (protected) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:username` | Get user by username |
| PUT | `/api/users/profile` | Update profile (protected) |
| POST | `/api/users/avatar` | Upload avatar (protected) |

### Follows
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/:id/follow` | Follow user (protected) |
| DELETE | `/api/users/:id/follow` | Unfollow user (protected) |
| GET | `/api/users/:id/followers` | Get user followers |
| GET | `/api/users/:id/following` | Get user following |

### Tells
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tells` | Send a tell (protected) |
| GET | `/api/tells` | Get received tells (protected) |
| GET | `/api/tells/sent` | Get sent tells (protected) |
| POST | `/api/tells/:id/answer` | Answer a tell (protected) |
| GET | `/api/public/tells/:username` | Get user's public tells |
| GET | `/api/public/feed` | Get public feed |

### Chats
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chats` | Create or get chat (protected) |
| GET | `/api/chats` | Get all chats (protected) |
| GET | `/api/chats/:chatId/messages` | Get chat messages (protected) |
| POST | `/api/chats/:chatId/messages` | Send message (protected) |
| PUT | `/api/chats/:chatId/read` | Mark messages as read (protected) |
| GET | `/api/chats/unread-count` | Get unread messages count (protected) |

### WebSocket
| Endpoint | Description |
|----------|-------------|
| `/ws/:userId` | Real-time notifications |

## Deployment

### Coolify (Recommended)

1. Push code to GitHub
2. In Coolify Dashboard → Add Resource → Docker Compose
3. Connect your GitHub repository
4. Set environment variables
5. Deploy!

### Manual Docker Deployment

```bash
# Build and run
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_USER` | Database username | Yes |
| `POSTGRES_PASSWORD` | Database password | Yes |
| `POSTGRES_DB` | Database name | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `SMTP_HOST` | SMTP server host | For email |
| `SMTP_PORT` | SMTP server port | For email |
| `SMTP_USER` | SMTP username | For email |
| `SMTP_PASS` | SMTP password | For email |
| `SMTP_FROM` | From email address | For email |
| `FRONTEND_URL` | Frontend URL for email links | For email |
| `ALLOWED_ORIGINS` | CORS allowed origins | Production |

## Project Structure

```
PemBlle/
├── pemblle_backend/
│   ├── handlers/          # HTTP request handlers
│   │   ├── auth.go        # Authentication handlers
│   │   ├── chat.go        # Chat/messaging handlers
│   │   ├── tell.go        # Tell/message handlers
│   │   └── user.go        # User handlers
│   ├── middleware/        # Custom middleware
│   │   └── auth.go        # JWT authentication
│   ├── models/            # Database models
│   │   └── models.go      # GORM models
│   ├── utils/             # Utility functions
│   ├── ws/                # WebSocket
│   │   └── manager.go     # Connection manager
│   ├── uploads/           # User uploads
│   ├── Dockerfile
│   ├── main.go
│   └── go.mod
├── pemblle_frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   │   ├── Chat/      # Chat components
│   │   │   │   ├── ChatList.jsx
│   │   │   │   └── ChatRoom.jsx
│   │   │   └── ...
│   │   ├── locales/       # i18n translations (en, ar, ku)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you found this project helpful, please give it a ⭐ on GitHub!

---

Made with ❤️ by [ihsandara](https://github.com/ihsandara)
