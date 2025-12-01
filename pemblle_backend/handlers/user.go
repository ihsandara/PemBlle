package handlers

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"log"
	"os"
	"prswjo/models"
	"prswjo/utils"

	"github.com/disintegration/imaging"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/image/webp"
	"gorm.io/gorm"
)

type UserHandler struct {
	DB *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{DB: db}
}

func (h *UserHandler) GetUsers(c *fiber.Ctx) error {
	search := c.Query("search")
	exclude := c.Query("exclude") // Exclude user by ID (current logged-in user)
	limitStr := c.Query("limit")
	offsetStr := c.Query("offset")
	var users []models.User

	query := h.DB.Model(&models.User{}).Where("is_verified = ?", true).Order("created_at desc")

	if search != "" {
		query = query.Where("username ILIKE ? OR full_name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if exclude != "" {
		query = query.Where("id != ?", exclude)
	}

	// Apply limit if provided
	if limitStr != "" {
		var limit int
		fmt.Sscanf(limitStr, "%d", &limit)
		if limit > 0 {
			query = query.Limit(limit)
		}
	}

	// Apply offset if provided
	if offsetStr != "" {
		var offset int
		fmt.Sscanf(offsetStr, "%d", &offset)
		if offset > 0 {
			query = query.Offset(offset)
		}
	}

	if result := query.Find(&users); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch users"})
	}

	log.Printf("📋 GetUsers: Found %d verified users (search: '%s', exclude: '%s')", len(users), search, exclude)
	return c.JSON(users)
}

func (h *UserHandler) UpdateProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	type UpdateInput struct {
		FullName string `json:"full_name"`
		Bio      string `json:"bio"`
		Avatar   string `json:"avatar"`
	}

	var input UpdateInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var user models.User
	if result := h.DB.First(&user, "id = ?", userID); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	user.FullName = input.FullName
	user.Bio = input.Bio
	user.Avatar = input.Avatar

	h.DB.Save(&user)

	return c.JSON(user)
}

func (h *UserHandler) GetUserByUsername(c *fiber.Ctx) error {
	username := c.Params("username")
	var user models.User

	if result := h.DB.Where("username = ? AND is_verified = ?", username, true).First(&user); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(user)
}

func (h *UserHandler) UploadAvatar(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	// Get the file from the request
	file, err := c.FormFile("avatar")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No file uploaded"})
	}

	// Validate file type
	contentType := file.Header.Get("Content-Type")
	if contentType != "image/jpeg" &&
		contentType != "image/png" &&
		contentType != "image/jpg" &&
		contentType != "image/webp" &&
		contentType != "image/gif" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Only JPEG, PNG, WebP, and GIF images are allowed"})
	}

	// Validate file size (max 10MB for original upload, will be compressed)
	const maxFileSize = 10 * 1024 * 1024 // 10MB
	if file.Size > maxFileSize {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("File size must be less than %dMB", maxFileSize/(1024*1024)),
		})
	}

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		log.Printf("❌ Failed to open uploaded file: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not process file"})
	}
	defer src.Close()

	// Decode the image based on content type
	var img image.Image
	switch contentType {
	case "image/jpeg", "image/jpg":
		img, err = jpeg.Decode(src)
	case "image/png":
		img, err = png.Decode(src)
	case "image/webp":
		img, err = webp.Decode(src)
	case "image/gif":
		img, _, err = image.Decode(src)
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Unsupported image format"})
	}

	if err != nil {
		log.Printf("❌ Failed to decode image: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Could not decode image. Please upload a valid image file."})
	}

	// Resize image to max 400x400 while maintaining aspect ratio
	const maxDimension = 400
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	if width > maxDimension || height > maxDimension {
		if width > height {
			img = imaging.Resize(img, maxDimension, 0, imaging.Lanczos)
		} else {
			img = imaging.Resize(img, 0, maxDimension, imaging.Lanczos)
		}
		log.Printf("🔄 Image resized from %dx%d to %dx%d", width, height, img.Bounds().Dx(), img.Bounds().Dy())
	}

	// Encode to optimized JPEG format with compression
	// Note: WebP encoding requires CGO + libwebp. Using JPEG for maximum compatibility.
	var buf bytes.Buffer
	jpegOptions := &jpeg.Options{Quality: 85} // Good balance between quality and file size
	if err := jpeg.Encode(&buf, img, jpegOptions); err != nil {
		log.Printf("❌ Failed to encode image: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not compress image"})
	}

	// Generate unique filename with .jpg extension
	filename := fmt.Sprintf("%s.jpg", userID)

	// Ensure uploads directory exists
	uploadDir := "./uploads/avatars"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Printf("❌ Failed to create upload directory: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create upload directory"})
	}

	savePath := fmt.Sprintf("%s/%s", uploadDir, filename)

	// Write the compressed image file
	if err := os.WriteFile(savePath, buf.Bytes(), 0644); err != nil {
		log.Printf("❌ Failed to save avatar file: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not save file"})
	}

	log.Printf("✅ Avatar saved successfully: %s (original: %d KB, compressed: %d KB)",
		savePath, file.Size/1024, buf.Len()/1024)

	// Delete old avatar files with different extensions if they exist
	for _, ext := range []string{".webp", ".jpeg", ".png", ".gif"} {
		oldPath := fmt.Sprintf("%s/%s%s", uploadDir, userID, ext)
		if _, err := os.Stat(oldPath); err == nil {
			os.Remove(oldPath)
			log.Printf("🗑️ Removed old avatar: %s", oldPath)
		}
	}

	// Update user avatar in database
	var user models.User
	if result := h.DB.First(&user, "id = ?", userID); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	avatarURL := fmt.Sprintf("/uploads/avatars/%s", filename)
	user.Avatar = avatarURL
	h.DB.Save(&user)

	return c.JSON(fiber.Map{"avatar_url": avatarURL})
}

// Follow a user
func (h *UserHandler) FollowUser(c *fiber.Ctx) error {
	followerID := c.Locals("user_id").(string)
	followingID := c.Params("id")

	type FollowInput struct {
		IsAnonymous bool `json:"is_anonymous"`
	}

	var input FollowInput
	c.BodyParser(&input)

	if followerID == followingID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot follow yourself"})
	}

	// Check if already following
	var existingFollow models.Follow
	if result := h.DB.Where("follower_id = ? AND following_id = ?", followerID, followingID).First(&existingFollow); result.Error == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Already following this user"})
	}

	followerUUID, _ := uuid.Parse(followerID)
	followingUUID, _ := uuid.Parse(followingID)

	follow := models.Follow{
		FollowerID:  followerUUID,
		FollowingID: followingUUID,
		IsAnonymous: input.IsAnonymous,
	}

	if result := h.DB.Create(&follow); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not follow user"})
	}

	// Send notification email to the followed user
	go func() {
		// Get the followed user's email
		var followedUser models.User
		if err := h.DB.First(&followedUser, "id = ?", followingID).Error; err != nil {
			log.Printf("❌ Could not find followed user for notification: %v", err)
			return
		}

		// Get follower's name (only if not anonymous)
		var followerName string
		if !input.IsAnonymous {
			var follower models.User
			if err := h.DB.First(&follower, "id = ?", followerID).Error; err == nil {
				if follower.FullName != "" {
					followerName = follower.FullName
				} else {
					followerName = follower.Username
				}
			}
		}

		// Send the email
		if err := utils.SendNewFollowerEmail(followedUser.Email, followerName, input.IsAnonymous); err != nil {
			log.Printf("❌ Failed to send follower notification email: %v", err)
		} else {
			if input.IsAnonymous {
				log.Printf("📧 Sent anonymous follower notification to %s", followedUser.Email)
			} else {
				log.Printf("📧 Sent follower notification to %s (from %s)", followedUser.Email, followerName)
			}
		}
	}()

	return c.JSON(fiber.Map{"message": "Followed successfully", "is_anonymous": input.IsAnonymous})
}

// Unfollow a user
func (h *UserHandler) UnfollowUser(c *fiber.Ctx) error {
	followerID := c.Locals("user_id").(string)
	followingID := c.Params("id")

	result := h.DB.Where("follower_id = ? AND following_id = ?", followerID, followingID).Delete(&models.Follow{})
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Not following this user"})
	}

	return c.JSON(fiber.Map{"message": "Unfollowed successfully"})
}

// Get followers of a user
func (h *UserHandler) GetFollowers(c *fiber.Ctx) error {
	userID := c.Params("id")

	var follows []models.Follow
	h.DB.Where("following_id = ?", userID).Find(&follows)

	var publicFollowers []fiber.Map
	var anonymousCount int

	for _, f := range follows {
		if f.IsAnonymous {
			anonymousCount++
		} else {
			var user models.User
			h.DB.First(&user, "id = ?", f.FollowerID)
			publicFollowers = append(publicFollowers, fiber.Map{
				"id":         f.ID,
				"user":       user,
				"created_at": f.CreatedAt,
			})
		}
	}

	return c.JSON(fiber.Map{
		"followers":       publicFollowers,
		"anonymous_count": anonymousCount,
		"total_count":     len(follows),
	})
}

// Get users that a user is following
func (h *UserHandler) GetFollowing(c *fiber.Ctx) error {
	userID := c.Params("id")

	var follows []models.Follow
	h.DB.Where("follower_id = ?", userID).Find(&follows)

	var publicFollowing []fiber.Map
	var anonymousCount int

	for _, f := range follows {
		var user models.User
		h.DB.First(&user, "id = ?", f.FollowingID)

		if f.IsAnonymous {
			anonymousCount++
		} else {
			publicFollowing = append(publicFollowing, fiber.Map{
				"id":         f.ID,
				"user":       user,
				"created_at": f.CreatedAt,
			})
		}
	}

	return c.JSON(fiber.Map{
		"following":       publicFollowing,
		"anonymous_count": anonymousCount,
		"total_count":     len(follows),
	})
}

// Check if current user follows a specific user
func (h *UserHandler) CheckFollowStatus(c *fiber.Ctx) error {
	followerID := c.Locals("user_id").(string)
	followingID := c.Params("id")

	var follow models.Follow
	if result := h.DB.Where("follower_id = ? AND following_id = ?", followerID, followingID).First(&follow); result.Error != nil {
		return c.JSON(fiber.Map{"is_following": false})
	}

	return c.JSON(fiber.Map{"is_following": true, "is_anonymous": follow.IsAnonymous})
}

// Get follow counts for a user
func (h *UserHandler) GetFollowCounts(c *fiber.Ctx) error {
	userID := c.Params("id")

	var followersCount int64
	var followingCount int64

	h.DB.Model(&models.Follow{}).Where("following_id = ?", userID).Count(&followersCount)
	h.DB.Model(&models.Follow{}).Where("follower_id = ?", userID).Count(&followingCount)

	return c.JSON(fiber.Map{
		"followers_count": followersCount,
		"following_count": followingCount,
	})
}
