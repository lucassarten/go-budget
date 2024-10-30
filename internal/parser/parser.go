package parser

import (
	"encoding/csv"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"go-budget/ent"
	dbPkg "go-budget/internal/db"
	"go-budget/internal/models"

	_ "github.com/mattn/go-sqlite3"
)

// specific phrases to remove, these rows aren't dropped just cleaned for the below strings
var remove = regexp.MustCompile(`;Ref:|;Particulars:|;Balance:|;`)

func ImportFile(db *dbPkg.Db, fileName string, typeStr string) (int, int, error) {
	// Open the CSV file
	file, err := os.Open(fileName)
	if err != nil {
		return 0, 0, err
	}
	defer file.Close()

	// Create a CSV reader
	reader := csv.NewReader(file)
	reader.TrimLeadingSpace = true

	// Read all the records
	records, err := reader.ReadAll()
	if err != nil {
		return 0, 0, err
	}

	var transactions []*ent.Transaction

	// Drop header row
	records = records[1:]

	// Process based on the specified type
	if typeStr == "TSB" {
		if len(records[0]) == 3 {
			// Format columns
			for _, row := range records {
				// Convert date to unix epoch f 23/04/24
				date, err := time.Parse("02/01/06", row[0])
				if err != nil {
					return 0, 0, err
				}
				// Parse amount
				amount, err := strconv.ParseFloat(row[2], 64)
				if err != nil {
					return 0, 0, err
				}
				transactions = append(transactions, &ent.Transaction{
					Time:        date.UnixMilli(),
					Description: strings.TrimSpace(row[1]),
					Amount:      amount,
				})
			}
		} else if len(records[0]) == 5 {
			// Format columns
			for _, row := range records {
				// Convert date to unix epoch f 23/04/24
				date, err := time.Parse("02/01/06", row[0])
				if err != nil {
					return 0, 0, err
				}
				// Parse amount
				amount, err := strconv.ParseFloat(row[1], 64)
				if err != nil {
					return 0, 0, err
				}
				transactions = append(transactions, &ent.Transaction{
					Time:        date.UnixMilli(),
					Description: strings.TrimSpace(row[2] + row[3]),
					Amount:      amount,
				})
			}
		} else {
			return 0, 0, nil
		}
	} else if typeStr == "KiwiBank" {
		// Format columns
		for _, row := range records {
			// Convert date to unix epoch f 23/04/24
			date, err := time.Parse("2-1-2006", row[1])
			if err != nil {
				return 0, 0, err
			}
			// Parse amount
			amount, err := strconv.ParseFloat(row[14], 64)
			if err != nil {
				return 0, 0, err
			}
			transactions = append(transactions, &ent.Transaction{
				Time:        date.UnixMilli(),
				Description: strings.TrimSpace(row[2]),
				Amount:      amount,
			})
		}
	}

	// Remove unwanted strings
	for i := range transactions {
		transactions[i].Description = remove.ReplaceAllString(transactions[i].Description, "")
	}

	// Attempt to auto categorize
	existingTransactions, err := db.GetTransactions()
	if err != nil {
		return 0, 0, err
	}
	categorized, numCategorized := models.Categorize(existingTransactions, transactions)

	// Insert into database
	for _, t := range categorized {
		_, err := db.CreateTransaction(t.Time, t.Description, t.Amount, t.CategoryID, false)
		if err != nil {
			return 0, 0, err
		}
	}
	return len(categorized), numCategorized, nil
}
