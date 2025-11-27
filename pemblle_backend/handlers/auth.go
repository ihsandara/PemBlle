package handlers

import (
	"log"
	"os"
	"time"

	"prswjo/models"
	"prswjo/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{DB: db}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	type RegisterInput struct {
		Username string `json:"username"`
		FullName string `json:"full_name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var input RegisterInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Check if email already exists in users table
	var existingUser models.User
	if result := h.DB.Where("email = ?", input.Email).First(&existingUser); result.Error == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email already registered"})
	}

	// Check if username already exists in users table
	if result := h.DB.Where("username = ?", input.Username).First(&existingUser); result.Error == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Username already taken"})
	}

	// Delete any existing pending registration for this email or username
	h.DB.Where("email = ? OR username = ?", input.Email, input.Username).Delete(&models.PendingUser{})

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not hash password"})
	}

	verificationToken := uuid.New().String()

	// Create pending user (not the actual user yet)
	pendingUser := models.PendingUser{
		Username:          input.Username,
		FullName:          input.FullName,
		Email:             input.Email,
		Password:          string(hashedPassword),
		VerificationToken: verificationToken,
		ExpiresAt:         time.Now().Add(24 * time.Hour), // Token expires in 24 hours
	}

	if result := h.DB.Create(&pendingUser); result.Error != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Could not create registration"})
	}

	log.Printf("📝 Pending registration created: %s | Email: %s | Token: %s", pendingUser.Username, pendingUser.Email, pendingUser.VerificationToken)

	// Send verification email
	go func() {
		if err := utils.SendVerificationEmail(pendingUser.Email, pendingUser.VerificationToken); err != nil {
			log.Printf("❌ Failed to send verification email to %s: %v", pendingUser.Email, err)
		} else {
			log.Printf("📧 Verification email sent to %s", pendingUser.Email)
		}
	}()

	return c.JSON(fiber.Map{
		"message": "Please check your email to verify your account.",
	})
}

func (h *AuthHandler) VerifyEmail(c *fiber.Ctx) error {
	token := c.Params("token")
	log.Printf("🔍 Verification attempt with token: %s", token)

	if token == "" {
		log.Printf("❌ Verification failed: Empty token")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid verification token"})
	}

	// Find pending user with this token
	var pendingUser models.PendingUser
	result := h.DB.Where("verification_token = ?", token).First(&pendingUser)
	if result.Error != nil {
		log.Printf("❌ Verification failed: Token '%s' not found. Error: %v", token, result.Error)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid or expired verification token"})
	}

	// Check if token has expired
	if time.Now().After(pendingUser.ExpiresAt) {
		log.Printf("❌ Verification failed: Token expired for %s", pendingUser.Email)
		h.DB.Delete(&pendingUser) // Clean up expired pending user
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Verification token has expired. Please register again."})
	}

	log.Printf("✅ Token found for pending user: %s | Email: %s", pendingUser.Username, pendingUser.Email)

	// Create the actual user now
	user := models.User{
		Username:   pendingUser.Username,
		FullName:   pendingUser.FullName,
		Email:      pendingUser.Email,
		Password:   pendingUser.Password,
		IsVerified: true,
	}

	if err := h.DB.Create(&user).Error; err != nil {
		log.Printf("❌ Failed to create user: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create account"})
	}

	// Delete the pending user
	h.DB.Delete(&pendingUser)

	log.Printf("✅ User %s created and verified successfully", user.Username)
	return c.JSON(fiber.Map{"message": "Email verified successfully. You can now login."})
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	type LoginInput struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var input LoginInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var user models.User
	if result := h.DB.Where("email = ?", input.Email).First(&user); result.Error != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	log.Printf("✅ Login successful: %s", user.Email)

	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["user_id"] = user.ID
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

	t, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not login"})
	}

	return c.JSON(fiber.Map{"token": t, "user": user})
}

func (h *AuthHandler) ChangePassword(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	type ChangePasswordInput struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	var input ChangePasswordInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var user models.User
	if result := h.DB.First(&user, "id = ?", userID); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.OldPassword)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid old password"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not hash password"})
	}

	user.Password = string(hashedPassword)
	h.DB.Save(&user)

	return c.JSON(fiber.Map{"message": "Password updated successfully"})
}

func (h *AuthHandler) ResendVerification(c *fiber.Ctx) error {
	type ResendInput struct {
		Email string `json:"email"`
	}

	var input ResendInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Check if already a verified user
	var existingUser models.User
	if result := h.DB.Where("email = ?", input.Email).First(&existingUser); result.Error == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email already verified"})
	}

	// Find pending user
	var pendingUser models.PendingUser
	if result := h.DB.Where("email = ?", input.Email).First(&pendingUser); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "No pending registration found for this email"})
	}

	// Generate new verification token and extend expiry
	pendingUser.VerificationToken = uuid.New().String()
	pendingUser.ExpiresAt = time.Now().Add(24 * time.Hour)
	h.DB.Save(&pendingUser)

	// Send verification email
	go func() {
		if err := utils.SendVerificationEmail(pendingUser.Email, pendingUser.VerificationToken); err != nil {
			log.Printf("❌ Failed to send verification email to %s: %v", pendingUser.Email, err)
		} else {
			log.Printf("📧 Verification email resent to %s", pendingUser.Email)
		}
	}()

	return c.JSON(fiber.Map{"message": "Verification email sent"})
}
