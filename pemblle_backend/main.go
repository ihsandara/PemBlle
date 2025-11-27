package main

import (
	"log"
	"os"

	"prswjo/handlers"
	"prswjo/middleware"
	"prswjo/models"
	"prswjo/ws"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/websocket/v2"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Database connection
	dsn := os.Getenv("DB_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migrate
	db.AutoMigrate(&models.User{}, &models.PendingUser{}, &models.Tell{}, &models.Answer{}, &models.Reply{}, &models.Follow{}, &models.Chat{}, &models.Message{})

	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	// Get allowed origins from environment or use defaults
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:5173, http://localhost:5174, http://localhost"
	}
	app.Use(cors.New(cors.Config{
		AllowOrigins: allowedOrigins,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Handlers
	authHandler := handlers.NewAuthHandler(db)

	// Routes
	api := app.Group("/api")

	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Get("/verify/:token", authHandler.VerifyEmail)
	auth.Post("/resend-verification", authHandler.ResendVerification)

	// User Routes
	userHandler := handlers.NewUserHandler(db)
	api.Get("/users", userHandler.GetUsers)
	api.Put("/users/profile", middleware.Protected(), userHandler.UpdateProfile)
	api.Post("/users/avatar", middleware.Protected(), userHandler.UploadAvatar)
	api.Put("/auth/password", middleware.Protected(), authHandler.ChangePassword)
	api.Get("/users/:username", userHandler.GetUserByUsername)

	// Follow Routes
	api.Post("/users/:id/follow", middleware.Protected(), userHandler.FollowUser)
	api.Delete("/users/:id/follow", middleware.Protected(), userHandler.UnfollowUser)
	api.Get("/users/:id/followers", userHandler.GetFollowers)
	api.Get("/users/:id/following", userHandler.GetFollowing)
	api.Get("/users/:id/follow-status", middleware.Protected(), userHandler.CheckFollowStatus)
	api.Get("/users/:id/follow-counts", userHandler.GetFollowCounts)

	// Serve uploaded files
	app.Static("/uploads", "./uploads")

	// Tell Routes
	tellHandler := handlers.NewTellHandler(db)

	// Public tell routes (Must be defined before protected group or use different prefix)
	api.Get("/public/tells/:username", tellHandler.GetUserTells)
	api.Get("/public/feed", tellHandler.GetPublicFeed)
	api.Post("/public/tells", tellHandler.CreatePublicTell) // Anonymous users can send tells

	tells := api.Group("/tells")
	tells.Use(middleware.Protected())
	tells.Post("/", tellHandler.CreateTell)
	tells.Get("/", tellHandler.GetTells)
	tells.Get("/sent", tellHandler.GetSentTells)
	tells.Get("/unread-count", tellHandler.GetUnansweredCount)
	tells.Post("/:id/answer", tellHandler.AnswerTell)
	tells.Post("/answers/:id/reply", tellHandler.ReplyToAnswer)

	// Chat Routes
	chatHandler := handlers.NewChatHandler(db)
	chats := api.Group("/chats")
	chats.Use(middleware.Protected())
	chats.Get("/", chatHandler.GetChats)
	chats.Post("/", chatHandler.GetOrCreateChat)
	chats.Get("/unread-count", chatHandler.GetUnreadCount)
	chats.Get("/:chatId/messages", chatHandler.GetMessages)
	chats.Post("/:chatId/messages", chatHandler.SendMessage)
	chats.Put("/:chatId/read", chatHandler.MarkAsRead)

	// WebSocket
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/ws/:id", websocket.New(func(c *websocket.Conn) {
		userID := c.Params("id")
		ws.GlobalManager.AddClient(userID, c)
		defer ws.GlobalManager.RemoveConnection(userID, c)

		for {
			// Keep connection alive
			if _, _, err := c.ReadMessage(); err != nil {
				break
			}
		}
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "db": db.Error == nil})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Fatal(app.Listen(":" + port))
}
