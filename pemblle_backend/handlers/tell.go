package handlers

import (
	"fmt"
	"prswjo/models"
	"prswjo/utils"
	"prswjo/ws"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TellHandler struct {
	DB *gorm.DB
}

func NewTellHandler(db *gorm.DB) *TellHandler {
	return &TellHandler{DB: db}
}

func (h *TellHandler) CreateTell(c *fiber.Ctx) error {
	type CreateTellInput struct {
		ReceiverID  uuid.UUID `json:"receiver_id"`
		Content     string    `json:"content"`
		IsAnonymous bool      `json:"is_anonymous"`
	}

	var input CreateTellInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	tell := models.Tell{
		ReceiverID:  input.ReceiverID,
		Content:     input.Content,
		IsAnonymous: input.IsAnonymous,
	}

	// Set SenderID from token (always store it if user is logged in, even if anonymous)
	userID := c.Locals("user_id").(string)
	senderID, err := uuid.Parse(userID)
	if err == nil {
		tell.SenderID = &senderID
	}

	if result := h.DB.Create(&tell); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create tell"})
	}

	// Send notification
	ws.GlobalManager.SendMessage(tell.ReceiverID.String(), fiber.Map{
		"type": "new_tell",
		"tell": tell,
	})

	// Send Email
	go func() {
		var receiver models.User
		if result := h.DB.Select("email").First(&receiver, "id = ?", tell.ReceiverID); result.Error == nil && receiver.Email != "" {
			utils.SendNewTellEmail(receiver.Email)
		}
	}()

	return c.JSON(tell)
}

func (h *TellHandler) GetTells(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var tells []models.Tell
	if result := h.DB.Where("receiver_id = ?", userID).Preload("Receiver").Preload("Answer.Replies").Preload("Answer").Order("created_at desc").Find(&tells); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch tells"})
	}

	// Hide SenderID if anonymous
	for i := range tells {
		if tells[i].IsAnonymous {
			tells[i].SenderID = nil
			if tells[i].Answer != nil {
				for j := range tells[i].Answer.Replies {
					if tells[i].Answer.Replies[j].SenderID != tells[i].ReceiverID {
						tells[i].Answer.Replies[j].SenderID = uuid.Nil
					}
				}
			}
		}
	}

	return c.JSON(tells)
}

func (h *TellHandler) AnswerTell(c *fiber.Ctx) error {
	tellID := c.Params("id")
	userID := c.Locals("user_id").(string)

	type AnswerInput struct {
		Content string `json:"content"`
	}

	var input AnswerInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var tell models.Tell
	if result := h.DB.Where("id = ? AND receiver_id = ?", tellID, userID).First(&tell); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Tell not found or unauthorized"})
	}

	answer := models.Answer{
		TellID:  tell.ID,
		Content: input.Content,
	}

	if result := h.DB.Create(&answer); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create answer"})
	}

	// Notify the original sender (if they exist)
	if tell.SenderID != nil {
		ws.GlobalManager.SendMessage(tell.SenderID.String(), fiber.Map{
			"type":   "tell_answered",
			"tell":   tell,
			"answer": answer,
		})

		// Send Email
		go func() {
			var sender models.User
			if result := h.DB.Select("email").First(&sender, "id = ?", tell.SenderID); result.Error == nil && sender.Email != "" {
				utils.SendTellAnsweredEmail(sender.Email)
			}
		}()
	}

	return c.JSON(answer)
}

func (h *TellHandler) GetUnansweredCount(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	var count int64

	// Count tells where receiver is user AND no answer exists
	if result := h.DB.Model(&models.Tell{}).
		Where("receiver_id = ?", userID).
		Where("id NOT IN (SELECT tell_id FROM answers)").
		Count(&count); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch count"})
	}

	return c.JSON(fiber.Map{"count": count})
}

func (h *TellHandler) GetSentTells(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var tells []models.Tell
	if result := h.DB.Where("sender_id = ?", userID).
		Preload("Receiver").
		Preload("Answer").
		Preload("Answer.Replies").
		Order("created_at desc").
		Find(&tells); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch sent tells"})
	}

	return c.JSON(tells)
}

func (h *TellHandler) ReplyToAnswer(c *fiber.Ctx) error {
	answerID := c.Params("id")
	userID := c.Locals("user_id").(string)
	senderUUID, _ := uuid.Parse(userID)

	type ReplyInput struct {
		Content string `json:"content"`
	}

	var input ReplyInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Verify answer exists
	var answer models.Answer
	if result := h.DB.Where("id = ?", answerID).First(&answer); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Answer not found"})
	}

	// Get Tell info
	var tell models.Tell
	if result := h.DB.First(&tell, "id = ?", answer.TellID); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Tell not found"})
	}

	// Verify authorization: only original sender or receiver can reply
	isOriginalSender := tell.SenderID != nil && *tell.SenderID == senderUUID
	isReceiver := tell.ReceiverID == senderUUID

	if !isOriginalSender && !isReceiver {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized"})
	}

	reply := models.Reply{
		AnswerID: answer.ID,
		SenderID: senderUUID,
		Content:  input.Content,
	}

	if result := h.DB.Create(&reply); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create reply"})
	}

	// Notify the other party
	var notifyUserID uuid.UUID
	if isOriginalSender {
		notifyUserID = tell.ReceiverID // Notify answerer
	} else if tell.SenderID != nil {
		notifyUserID = *tell.SenderID // Notify original sender
	}

	if notifyUserID != uuid.Nil {
		ws.GlobalManager.SendMessage(notifyUserID.String(), fiber.Map{
			"type":    "new_reply",
			"tell_id": tell.ID,
			"reply":   reply,
		})

		// Send Email
		go func() {
			var notifyUser models.User
			if result := h.DB.Select("email").First(&notifyUser, "id = ?", notifyUserID); result.Error == nil && notifyUser.Email != "" {
				utils.SendNewReplyEmail(notifyUser.Email)
			}
		}()
	}

	return c.JSON(reply)
}

func (h *TellHandler) GetUserTells(c *fiber.Ctx) error {
	username := c.Params("username")

	// Find user by username
	var user models.User
	if result := h.DB.Where("username = ?", username).First(&user); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	// Get tells with answers only
	var tells []models.Tell
	if result := h.DB.Where("receiver_id = ?", user.ID).
		Joins("INNER JOIN answers ON answers.tell_id = tells.id").
		Preload("Answer").
		Preload("Answer.Replies").
		Order("created_at desc").
		Find(&tells); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch tells"})
	}

	// Build response with receiver info
	type TellWithReceiver struct {
		models.Tell
		Receiver struct {
			ID       uuid.UUID `json:"id"`
			Username string    `json:"username"`
			FullName string    `json:"full_name"`
			Avatar   string    `json:"avatar"`
		} `json:"receiver"`
	}

	var result []TellWithReceiver
	for _, tell := range tells {
		item := TellWithReceiver{Tell: tell}
		item.Receiver.ID = user.ID
		item.Receiver.Username = user.Username
		item.Receiver.FullName = user.FullName
		item.Receiver.Avatar = user.Avatar

		// Hide SenderID if anonymous
		if tell.IsAnonymous {
			item.Tell.SenderID = nil
			if item.Tell.Answer != nil {
				for j := range item.Tell.Answer.Replies {
					if item.Tell.Answer.Replies[j].SenderID != tell.ReceiverID {
						item.Tell.Answer.Replies[j].SenderID = uuid.Nil
					}
				}
			}
		}

		result = append(result, item)
	}

	return c.JSON(result)
}

// GetPublicFeed returns all answered tells from all users with pagination
func (h *TellHandler) GetPublicFeed(c *fiber.Ctx) error {
	limitStr := c.Query("limit", "10")
	offsetStr := c.Query("offset", "0")

	var limit, offset int
	if _, err := fmt.Sscanf(limitStr, "%d", &limit); err != nil || limit <= 0 {
		limit = 10
	}
	if _, err := fmt.Sscanf(offsetStr, "%d", &offset); err != nil || offset < 0 {
		offset = 0
	}

	// Get tells with answers only, include receiver info
	var tells []models.Tell
	if result := h.DB.
		Joins("INNER JOIN answers ON answers.tell_id = tells.id").
		Preload("Answer").
		Preload("Answer.Replies").
		Order("answers.created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&tells); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch feed"})
	}

	// Get receiver info for each tell
	type FeedItem struct {
		models.Tell
		Receiver struct {
			ID       uuid.UUID `json:"id"`
			Username string    `json:"username"`
			FullName string    `json:"full_name"`
			Avatar   string    `json:"avatar"`
		} `json:"receiver"`
	}

	var feedItems []FeedItem
	for _, tell := range tells {
		var receiver models.User
		h.DB.Select("id, username, full_name, avatar").First(&receiver, "id = ?", tell.ReceiverID)

		item := FeedItem{Tell: tell}
		item.Receiver.ID = receiver.ID
		item.Receiver.Username = receiver.Username
		item.Receiver.FullName = receiver.FullName
		item.Receiver.Avatar = receiver.Avatar

		// Hide SenderID if anonymous
		if tell.IsAnonymous {
			item.Tell.SenderID = nil
			if item.Tell.Answer != nil {
				for j := range item.Tell.Answer.Replies {
					if item.Tell.Answer.Replies[j].SenderID != tell.ReceiverID {
						item.Tell.Answer.Replies[j].SenderID = uuid.Nil
					}
				}
			}
		}

		feedItems = append(feedItems, item)
	}

	return c.JSON(feedItems)
}
