package handlers

import (
	"fmt"
	"log"
	"path/filepath"
	"prswjo/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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
	if file.Header.Get("Content-Type") != "image/jpeg" &&
		file.Header.Get("Content-Type") != "image/png" &&
		file.Header.Get("Content-Type") != "image/jpg" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Only JPEG and PNG images are allowed"})
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "File size must be less than 5MB"})
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s%s", userID, ext)
	filepath := fmt.Sprintf("./uploads/avatars/%s", filename)

	// Save the file
	if err := c.SaveFile(file, filepath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not save file"})
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
