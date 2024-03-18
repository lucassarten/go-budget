package db

import (
	"fmt"
	"testing"
)

func TestGenerateTestTransactions(t *testing.T) {
	transactions := GenerateTestTransactions()
	fmt.Println(transactions)
}
