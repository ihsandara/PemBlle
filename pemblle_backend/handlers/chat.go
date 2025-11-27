package handlers

import (
	"prswjo/models"
	"prswjo/utils"
	"prswjo/ws"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ChatHandler struct {
	DB *gorm.DB
}

func NewChatHandler(db *gorm.DB) *ChatHandler {
	return &ChatHandler{DB: db}
}

// GetOrCreateChat gets existing chat or creates a new one between two users
func (h *ChatHandler) GetOrCreateChat(c *fiber.Ctx) error {
	currentUserID := c.Locals("user_id").(string)
	currentUUID, _ := uuid.Parse(currentUserID)

	type Input struct {
		UserID uuid.UUID `json:"user_id"`
	}

	var input Input
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Can't chat with yourself
	if currentUUID == input.UserID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot chat with yourself"})
	}

	// Check if other user exists
	var otherUser models.User
	if result := h.DB.First(&otherUser, "id = ?", input.UserID); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	// Find existing chat
	var chat models.Chat
	result := h.DB.Where(
		"(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
		currentUUID, input.UserID, input.UserID, currentUUID,
	).Preload("User1").Preload("User2").First(&chat)

	if result.Error == gorm.ErrRecordNotFound {
		// Create new chat
		chat = models.Chat{
			User1ID: currentUUID,
			User2ID: input.UserID,
		}
		if err := h.DB.Create(&chat).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create chat"})
		}
		// Reload with users
		h.DB.Preload("User1").Preload("User2").First(&chat, "id = ?", chat.ID)
	} else if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	return c.JSON(chat)
}

// GetChats returns all chats for the current user
func (h *ChatHandler) GetChats(c *fiber.Ctx) error {
	currentUserID := c.Locals("user_id").(string)
	currentUUID, _ := uuid.Parse(currentUserID)

	var chats []models.Chat
	if err := h.DB.Where("user1_id = ? OR user2_id = ?", currentUUID, currentUUID).
		Preload("User1").Preload("User2").
		Order("updated_at desc").
		Find(&chats).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch chats"})
	}

	// Get last message and unread count for each chat
	for i := range chats {
		var lastMessage models.Message
		h.DB.Where("chat_id = ?", chats[i].ID).Order("created_at desc").First(&lastMessage)
		if lastMessage.ID != uuid.Nil {
			chats[i].LastMessage = &lastMessage
		}

		// Count unread messages (messages not sent by current user and not read)
		var unreadCount int64
		h.DB.Model(&models.Message{}).Where("chat_id = ? AND sender_id != ? AND is_read = ?", chats[i].ID, currentUUID, false).Count(&unreadCount)
		chats[i].UnreadCount = int(unreadCount)
	}

	return c.JSON(chats)
}

// GetMessages returns messages for a specific chat
func (h *ChatHandler) GetMessages(c *fiber.Ctx) error {
	currentUserID := c.Locals("user_id").(string)
	currentUUID, _ := uuid.Parse(currentUserID)
	chatID := c.Params("chatId")

	chatUUID, err := uuid.Parse(chatID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid chat ID"})
	}

	// Verify user is part of this chat
	var chat models.Chat
	if err := h.DB.First(&chat, "id = ?", chatUUID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Chat not found"})
	}

	if chat.User1ID != currentUUID && chat.User2ID != currentUUID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Not authorized"})
	}

	// Get messages
	var messages []models.Message
	if err := h.DB.Where("chat_id = ?", chatUUID).
		Preload("Sender").
		Order("created_at asc").
		Find(&messages).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch messages"})
	}

	// Mark messages as read
	h.DB.Model(&models.Message{}).
		Where("chat_id = ? AND sender_id != ? AND is_read = ?", chatUUID, currentUUID, false).
		Update("is_read", true)

	return c.JSON(messages)
}

// SendMessage sends a new message in a chat
func (h *ChatHandler) SendMessage(c *fiber.Ctx) error {
	currentUserID := c.Locals("user_id").(string)
	currentUUID, _ := uuid.Parse(currentUserID)
	chatID := c.Params("chatId")

	chatUUID, err := uuid.Parse(chatID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid chat ID"})
	}

	type Input struct {
		Content string `json:"content"`
	}

	var input Input
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if input.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Content is required"})
	}

	// Verify user is part of this chat
	var chat models.Chat
	if err := h.DB.First(&chat, "id = ?", chatUUID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Chat not found"})
	}

	if chat.User1ID != currentUUID && chat.User2ID != currentUUID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Not authorized"})
	}

	// Create message
	message := models.Message{
		ChatID:   chatUUID,
		SenderID: currentUUID,
		Content:  input.Content,
	}

	if err := h.DB.Create(&message).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not send message"})
	}

	// Update chat's updated_at
	h.DB.Model(&chat).Update("updated_at", time.Now())

	// Load sender info
	h.DB.Preload("Sender").First(&message, "id = ?", message.ID)

	// Send real-time notification to the other user
	otherUserID := chat.User1ID
	if chat.User1ID == currentUUID {
		otherUserID = chat.User2ID
	}

	ws.GlobalManager.SendMessage(otherUserID.String(), fiber.Map{
		"type":    "new_message",
		"chat_id": chatUUID.String(),
		"message": message,
	})

	// Send email notification to the other user
	go func() {
		var otherUser models.User
		if err := h.DB.First(&otherUser, "id = ?", otherUserID).Error; err == nil && otherUser.Email != "" {
			senderName := message.Sender.FullName
			if senderName == "" {
				senderName = message.Sender.Username
			}
			utils.SendNewMessageEmail(otherUser.Email, senderName)
		}
	}()

	return c.JSON(message)
}

// GetUnreadCount returns total unread message count for current user
func (h *ChatHandler) GetUnreadCount(c *fiber.Ctx) error {
	currentUserID := c.Locals("user_id").(string)
	currentUUID, _ := uuid.Parse(currentUserID)

	// Get all chat IDs where user is a participant
	var chatIDs []uuid.UUID
	h.DB.Model(&models.Chat{}).
		Where("user1_id = ? OR user2_id = ?", currentUUID, currentUUID).
		Pluck("id", &chatIDs)

	// Count unread messages
	var count int64
	h.DB.Model(&models.Message{}).
		Where("chat_id IN ? AND sender_id != ? AND is_read = ?", chatIDs, currentUUID, false).
		Count(&count)

	return c.JSON(fiber.Map{"count": count})
}

// MarkAsRead marks all messages in a chat as read
func (h *ChatHandler) MarkAsRead(c *fiber.Ctx) error {
	currentUserID := c.Locals("user_id").(string)
	currentUUID, _ := uuid.Parse(currentUserID)
	chatID := c.Params("chatId")

	chatUUID, err := uuid.Parse(chatID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid chat ID"})
	}

	// Verify user is part of this chat
	var chat models.Chat
	if err := h.DB.First(&chat, "id = ?", chatUUID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Chat not found"})
	}

	if chat.User1ID != currentUUID && chat.User2ID != currentUUID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Not authorized"})
	}

	// Mark messages as read
	h.DB.Model(&models.Message{}).
		Where("chat_id = ? AND sender_id != ? AND is_read = ?", chatUUID, currentUUID, false).
		Update("is_read", true)

	return c.JSON(fiber.Map{"success": true})
}
