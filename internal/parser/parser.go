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

func ImportFile(db *dbPkg.Db, fileName string, typeStr string) error {
	// Open the CSV file
	file, err := os.Open(fileName)
	if err != nil {
		return err
	}
	defer file.Close()

	// Create a CSV reader
	reader := csv.NewReader(file)
	reader.TrimLeadingSpace = true

	// Read all the records
	records, err := reader.ReadAll()
	if err != nil {
		return err
	}

	// Initialize content slice
	var content [][]string

	// Drop header row
	records = records[1:]

	// Process based on the specified type
	if typeStr == "TSB" {
		if len(records[0]) == 3 {
			// Format columns
			for _, row := range records {
				content = append(content, []string{
					strings.TrimSpace(row[0]),
					strings.TrimSpace(row[1]),
					strings.TrimSpace(row[2]),
				})
			}
		} else if len(records[0]) == 5 {
			// Format columns
			for _, row := range records {
				content = append(content, []string{
					strings.TrimSpace(row[0]),
					strings.TrimSpace(row[2] + row[3]),
					strings.TrimSpace(row[1]),
				})
			}
		} else {
			return nil
		}

		// Convert date to unix epoch f 23/04/24
		for _, row := range content {
			date, err := time.Parse("02/01/06", row[0])
			if err != nil {
				return err
			}
			row[0] = string(date.Unix())
		}
	} else if typeStr == "KiwiBank" {
		// Format columns
		for _, row := range records {
			content = append(content, []string{
				strings.TrimSpace(row[1]),
				strings.TrimSpace(row[2]),
				strings.TrimSpace(row[14]),
			})
		}

		// Convert to date format d-m-yyyy, data is in format dd-mm-yyyy
		for _, row := range content {
			date, err := time.Parse("2-1-2006", row[0])
			if err != nil {
				return err
			}
			row[0] = string(date.Unix())
		}
	}

	// Remove unwanted strings
	var filteredContent [][]string
	for _, row := range content {
		filteredContent = append(filteredContent, []string{row[0], remove.ReplaceAllString(row[1], ""), row[2]})
	}

	// Attempt to auto categorize
	toCategorize, err := db.GetTransactions()
	if err != nil {
		return err
	}
	// Build mock list of Transactions
	transactions := make([]*ent.Transaction, len(filteredContent))
	for i, row := range filteredContent {
		amount, err := strconv.ParseFloat(row[2], 64)
		if err != nil {
			return err
		}
		time, err := strconv.ParseInt(row[0], 10, 64)
		if err != nil {
			return err
		}
		transactions[i] = &ent.Transaction{
			Time:        time,
			Description: row[1],
			Amount:      amount,
		}
	}
	categorized, _ := models.Categorize(toCategorize, transactions)

	// Insert into database
	for _, row := range categorized {
		_, err := db.CreateTransaction(row.Time, row.Description, row.Amount, row.CategoryID, false)
		if err != nil {
			return err
		}
	}
	return nil
}
