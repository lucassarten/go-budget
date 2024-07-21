package db

import (
	"context"
	"fmt"
	"testing"
	"time"
)

const (
	dbPath = "dev.db"
)

func TestGenerateTestTransactions(t *testing.T) {
	transactions := GenerateTestTransactions()
	fmt.Println(transactions)
}

func TestGetTransaction(t *testing.T) {
	db := NewDb(dbPath)
	db.Startup(context.Background())
	res, err := db.GetTransactions()
	if err != nil {
		t.Log(err.Error())
	}
	for _, r := range res {
		t.Log(time.Unix(r.Time, 0))
	}
}

func TestGetCategories(t *testing.T) {
	db := NewDb(dbPath)
	db.Startup(context.Background())
	res, err := db.GetCategories()
	if err != nil {
		t.Log(err.Error())
	}
	for _, r := range res {
		t.Log(r.Monthly)
	}
}
