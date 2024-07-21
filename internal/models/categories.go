package models

import (
	dbPkg "go-budget/internal/db"
	"sort"

	"github.com/agnivade/levenshtein"
	"github.com/samber/lo"
)

var THRESHOLD = 10

func Categorize(transactions []dbPkg.Transaction, toClassify []dbPkg.Transaction) ([]dbPkg.Transaction, int) {
	// Split into expenses and income
	expenses := lo.Filter(transactions, func(transaction dbPkg.Transaction, idx int) bool {
		return transaction.Amount < 0
	})

	income := lo.Filter(transactions, func(transaction dbPkg.Transaction, idx int) bool {
		return transaction.Amount >= 0
	})
	// Track number of categorized transactions
	numCategorized := 0
	// Categorize
	for i, t := range toClassify {
		var ranks []Distance
		var searchList []dbPkg.Transaction
		// Filtering out the transaction being searched for from the search list
		if t.Amount > 0 {
			searchList = lo.Filter(income, func(incomeTransaction dbPkg.Transaction, idx int) bool {
				return incomeTransaction != t
			})
		} else {
			searchList = lo.Filter(expenses, func(expenseTransaction dbPkg.Transaction, idx int) bool {
				return expenseTransaction != t
			})
		}
		// Ranking based on the filtered search list
		ranks = RankLavenstein(t.Description, searchList)
		if len(ranks) > 0 && ranks[0].Distance < THRESHOLD {
			toClassify[i].CategoryID = ranks[0].Transaction.CategoryID
			numCategorized += 1
		} else {
			toClassify[i].CategoryID = 0
		}
	}
	return toClassify, numCategorized
}

type Distance struct {
	Transaction dbPkg.Transaction
	Distance    int
}

func RankLavenstein(description string, transactions []dbPkg.Transaction) []Distance {
	ranks := make([]Distance, len(transactions))
	// Calculate distance for each transaction
	for i, transaction := range transactions {
		ranks[i] = Distance{
			Transaction: transaction,
			Distance:    levenshtein.ComputeDistance(description, transaction.Description),
		}
	}
	// Sort by shortest distance
	sort.Slice(ranks, func(i, j int) bool {
		return ranks[i].Distance < ranks[j].Distance
	})
	return ranks
}
