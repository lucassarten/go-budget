package models

import (
	"go-budget/ent"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Ptr[T any](v T) *T {
    return &v
}

func TestCategorize1(t *testing.T) {
	transactions := []*ent.Transaction{
		{Description: "groceries", CategoryID: Ptr(0), Amount: -1},
		{Description: " Weekly Rent", CategoryID: Ptr(1), Amount: -1},
	}
	toClassify := []*ent.Transaction{
		{Description: "groceries", CategoryID: Ptr(-1), Amount: -1},
	}
	categorized, _ := Categorize(transactions, toClassify)
	assert.Equal(t, 0, *categorized[0].CategoryID)
}

func TestCategorize2(t *testing.T) {
	transactions := []*ent.Transaction{
		{Description: "groceries", CategoryID: Ptr(0), Amount: -1},
		{Description: " Weekly Rent", CategoryID: Ptr(1), Amount: -1},
	}
	toClassify := []*ent.Transaction{
		{Description: " Weekly Rent", CategoryID: Ptr(-1), Amount: -1},
	}
	categorized, _ := Categorize(transactions, toClassify)
	assert.Equal(t, 1, *categorized[0].CategoryID)
}

func TestCategorize3(t *testing.T) {
	transactions := []*ent.Transaction{
		{Description: "T/f To Mastercard", CategoryID: Ptr(2), Amount: -1},
	}
	toClassify := []*ent.Transaction{
		{Description: "T/f To Mastercard (123)", CategoryID: Ptr(-1), Amount: -1},
	}
	categorized, _ := Categorize(transactions, toClassify)
	assert.Equal(t, 2, *categorized[0].CategoryID)
}

func TestCategorize5(t *testing.T) {
	transactions := []*ent.Transaction{
		{Description: "T/f To Mastercard (123)", CategoryID: Ptr(2), Amount: -1},
	}
	toClassify := []*ent.Transaction{
		{Description: "T/f To Mastercard", CategoryID: Ptr(-1), Amount: -1},
	}
	categorized, _ := Categorize(transactions, toClassify)
	assert.Equal(t, 2, *categorized[0].CategoryID)
}
