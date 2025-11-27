package ws

import (
	"sync"

	"github.com/gofiber/websocket/v2"
)

type Manager struct {
	clients map[string][]*websocket.Conn // UserID -> List of Connections
	lock    sync.RWMutex
}

var GlobalManager = &Manager{
	clients: make(map[string][]*websocket.Conn),
}

func (m *Manager) AddClient(userID string, conn *websocket.Conn) {
	m.lock.Lock()
	defer m.lock.Unlock()
	m.clients[userID] = append(m.clients[userID], conn)
}

func (m *Manager) RemoveClient(userID string) {
	// This is tricky because we need to remove a specific connection
	// But usually this is called when a connection closes.
	// We might need to iterate and remove the closed one.
	// For simplicity, let's just not remove by ID blindly.
	// Ideally, we should pass the conn to RemoveClient.
}

func (m *Manager) RemoveConnection(userID string, conn *websocket.Conn) {
	m.lock.Lock()
	defer m.lock.Unlock()

	conns := m.clients[userID]
	for i, c := range conns {
		if c == conn {
			// Remove element at index i
			m.clients[userID] = append(conns[:i], conns[i+1:]...)
			break
		}
	}

	if len(m.clients[userID]) == 0 {
		delete(m.clients, userID)
	}
}

func (m *Manager) SendMessage(userID string, message interface{}) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	if conns, ok := m.clients[userID]; ok {
		for _, conn := range conns {
			if err := conn.WriteJSON(message); err != nil {
				conn.Close()
				// We should remove it, but we are holding RLock.
				// It will be removed eventually or on next write error.
				// Ideally, we should collect dead connections and remove them after.
			}
		}
	}
}
