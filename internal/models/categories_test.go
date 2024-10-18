package models

import (
	dbPkg "go-budget/internal/db"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCategorize1(t *testing.T) {
	transactions := []dbPkg.Transaction{
		{Description: "groceries", CategoryID: 0, Amount: -1},
		{Description: " Weekly Rent", CategoryID: 1, Amount: -1},
	}
	toClassify := []dbPkg.Transaction{
		{Description: "groceries", CategoryID: -1, Amount: -1},
	}
	categorized, _ := Categorize(transactions, toClassify)
	assert.Equal(t, 0, categorized[0].CategoryID)
}

func TestCategorize2(t *testing.T) {
	transactions := []dbPkg.Transaction{
		{Description: "groceries", CategoryID: 0, Amount: -1},
		{Description: " Weekly Rent", CategoryID: 1, Amount: -1},
	}
	toClassify := []dbPkg.Transaction{
		{Description: " Weekly Rent", CategoryID: -1, Amount: -1},
	}
	categorized, _ := Categorize(transactions, toClassify)
	assert.Equal(t, 1, categorized[0].CategoryID)
}

func TestCategorize3(t *testing.T) {
	transactions := []dbPkg.Transaction{
		{Description: "T/f To Mastercard", CategoryID: 2, Amount: -1},
	}
	toClassify := []dbPkg.Transaction{
		{Description: "T/f To Mastercard (123)", CategoryID: -1, Amount: -1},
	}
	categorized, _ := Categorize(transactions, toClassify)
	assert.Equal(t, 2, categorized[0].CategoryID)
}

func TestCategorize5(t *testing.T) {
	transactions := []dbPkg.Transaction{
		{Description: "T/f To Mastercard (123)", CategoryID: 2, Amount: -1},
	}
	toClassify := []dbPkg.Transaction{
		{Description: "T/f To Mastercard", CategoryID: -1, Amount: -1},
	}
	categorized, _ := Categorize(transactions, toClassify)
	assert.Equal(t, 2, categorized[0].CategoryID)
}
