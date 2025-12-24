package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Restaurant struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

var restaurants = []Restaurant{
	{ID: 1, Name: "Pizza Palace"},
	{ID: 2, Name: "Burger Barn"},
}

const COMM_HUB_URL = "http://localhost:4000"

func main() {
	r := gin.Default()

	r.GET("/restaurants", func(c *gin.Context) {
		c.JSON(http.StatusOK, restaurants)
	})

	// Endpoint to receive messages from Hub
	r.POST("/notify", func(c *gin.Context) {
		var msg map[string]interface{}
		if err := c.BindJSON(&msg); err == nil {
			fmt.Printf("Received notification: %v\n", msg)
			c.Status(http.StatusOK)
		}
	})

	// Register with Communication Hub on startup
	go func() {
		values := map[string]string{"service": "restaurant", "url": "http://localhost:6001/notify"}
		jsonData, _ := json.Marshal(values)
		http.Post(COMM_HUB_URL+"/subscribe", "application/json", bytes.NewBuffer(jsonData))
	}()

	r.Run(":6001")
}
