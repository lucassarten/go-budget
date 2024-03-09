package models

import (
	dbPkg "go-budget/internal/db"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCategorize1(t *testing.T) {
	transactions := []dbPkg.Transaction{
		{Description: "groceriesT A W A WAHANUI", Category: "Groceries"},
		{Description: "920023 Weekly Rent", Category: "Rent"},
	}
	toClassify := []dbPkg.Transaction{
		{Description: "groceriesT A W A WAHANUI", Category: ""},
	}
	categorized := Categorize(transactions, toClassify)
	assert.Equal(t, "Groceries", categorized[0].Category)
}

func TestCategorize2(t *testing.T) {
	transactions := []dbPkg.Transaction{
		{Description: "groceriesT A W A WAHANUI", Category: "Groceries"},
		{Description: "920023 Weekly Rent", Category: "Rent"},
	}
	toClassify := []dbPkg.Transaction{
		{Description: "920023 Weekly Rent", Category: ""},
	}
	categorized := Categorize(transactions, toClassify)
	assert.Equal(t, "Rent", categorized[0].Category)
}

func TestCategorize3(t *testing.T) {
	transactions := []dbPkg.Transaction{
		{Description: "T/f To Mastercard", Category: "Debt"},
	}
	toClassify := []dbPkg.Transaction{
		{Description: "T/f To Mastercard (123)", Category: ""},
	}
	categorized := Categorize(transactions, toClassify)
	assert.Equal(t, "Debt", categorized[0].Category)
}

func TestCategorize5(t *testing.T) {
	transactions := []dbPkg.Transaction{
		{Description: "T/f To Mastercard (123)", Category: "Debt"},
	}
	toClassify := []dbPkg.Transaction{
		{Description: "T/f To Mastercard", Category: ""},
	}
	categorized := Categorize(transactions, toClassify)
	assert.Equal(t, "Debt", categorized[0].Category)
}
