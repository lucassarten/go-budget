package models

import (
	dbPkg "go-budget/internal/db"

	"github.com/lithammer/fuzzysearch/fuzzy"
)

func Categorize(transactions []dbPkg.Transaction, toClassify []dbPkg.Transaction) []dbPkg.Transaction {

	descriptions := make([]string, 0, len(transactions))
	for _, transaction := range transactions {
		descriptions = append(descriptions, transaction.Description)
	}

	for i, transaction := range toClassify {
		ranks := fuzzy.RankFindNormalizedFold(transaction.Description, descriptions)
		if len(ranks) > 0 {
			toClassify[i].Category = transactions[ranks[0].OriginalIndex].Category
		} else {
			toClassify[i].Category = "❓ Other"
		}
	}

	return toClassify
}
