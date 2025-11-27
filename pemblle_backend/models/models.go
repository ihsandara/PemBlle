package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Username          string    `gorm:"uniqueIndex;not null" json:"username"`
	FullName          string    `json:"full_name"`
	Email             string    `gorm:"uniqueIndex;not null" json:"email"`
	Password          string    `json:"-"`
	Avatar            string    `json:"avatar"`
	Bio               string    `json:"bio"`
	IsVerified        bool      `gorm:"default:true" json:"is_verified"`
	VerificationToken string    `json:"-"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// PendingUser stores registration data until email is verified
type PendingUser struct {
	ID                uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Username          string    `gorm:"uniqueIndex;not null" json:"username"`
	FullName          string    `json:"full_name"`
	Email             string    `gorm:"uniqueIndex;not null" json:"email"`
	Password          string    `json:"-"`
	VerificationToken string    `gorm:"uniqueIndex;not null" json:"-"`
	ExpiresAt         time.Time `json:"expires_at"`
	CreatedAt         time.Time `json:"created_at"`
}

type Tell struct {
	ID          uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	SenderID    *uuid.UUID `gorm:"type:uuid" json:"sender_id,omitempty"` // Nullable for anonymous
	ReceiverID  uuid.UUID  `gorm:"type:uuid;not null" json:"receiver_id"`
	Receiver    *User      `gorm:"foreignKey:ReceiverID" json:"receiver,omitempty"`
	Content     string     `gorm:"not null" json:"content"`
	IsAnonymous bool       `gorm:"default:true" json:"is_anonymous"`
	Answer      *Answer    `gorm:"foreignKey:TellID" json:"answer,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

type Answer struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	TellID    uuid.UUID `gorm:"type:uuid;uniqueIndex;not null" json:"tell_id"`
	Content   string    `gorm:"not null" json:"content"`
	Replies   []Reply   `gorm:"foreignKey:AnswerID" json:"replies,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type Reply struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	AnswerID  uuid.UUID `gorm:"type:uuid;not null" json:"answer_id"`
	SenderID  uuid.UUID `gorm:"type:uuid;not null" json:"sender_id"`
	Content   string    `gorm:"not null" json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type Follow struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	FollowerID  uuid.UUID `gorm:"type:uuid;not null" json:"follower_id"`
	FollowingID uuid.UUID `gorm:"type:uuid;not null" json:"following_id"`
	IsAnonymous bool      `gorm:"default:false" json:"is_anonymous"`
	CreatedAt   time.Time `json:"created_at"`
}

func (Follow) TableName() string {
	return "follows"
}

// Chat represents a conversation between two users
type Chat struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	User1ID     uuid.UUID `gorm:"type:uuid;not null" json:"user1_id"`
	User2ID     uuid.UUID `gorm:"type:uuid;not null" json:"user2_id"`
	User1       *User     `gorm:"foreignKey:User1ID" json:"user1,omitempty"`
	User2       *User     `gorm:"foreignKey:User2ID" json:"user2,omitempty"`
	LastMessage *Message  `gorm:"-" json:"last_message,omitempty"`
	UnreadCount int       `gorm:"-" json:"unread_count"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Message represents a single message in a chat
type Message struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ChatID    uuid.UUID `gorm:"type:uuid;not null;index" json:"chat_id"`
	SenderID  uuid.UUID `gorm:"type:uuid;not null" json:"sender_id"`
	Sender    *User     `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
	Content   string    `gorm:"not null" json:"content"`
	IsRead    bool      `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}
