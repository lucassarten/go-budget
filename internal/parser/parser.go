package parser

import (
	"encoding/csv"
	"os"
	"regexp"
	"strings"

	dbPkg "go-budget/internal/db"

	_ "github.com/mattn/go-sqlite3"
)

// specific references to ignore, these are transfers between my own accounts for example, these rows are dropped
var ignore = regexp.MustCompile(`Tf To|Tf Fr|T/f from|T/f to|TRANSFER|TRANSFER`)

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
		// Format columns
		for _, row := range records {
			content = append(content, []string{
				strings.TrimSpace(row[0]),
				strings.TrimSpace(row[2] + row[3]),
				strings.TrimSpace(row[1]),
			})
		}

		// Convert to date format yyyy-mm-dd
		for i, row := range content {
			date := strings.Split(row[0], "/")
			content[i] = []string{"20" + date[2] + "-" + date[1] + "-" + date[0], row[1], row[2]}
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
		for i, row := range content {
			date := strings.Split(row[0], "-")
			content[i] = []string{date[1] + "-" + date[0] + "-" + row[2][2:], row[1], row[2]}
		}
	}

	// Remove ignored rows
	var filteredContent [][]string
	for _, row := range content {
		if !ignore.MatchString(row[1]) {
			filteredContent = append(filteredContent, row)
		}
	}

	// Remove unwanted strings
	for i, row := range filteredContent {
		filteredContent[i] = []string{row[0], remove.ReplaceAllString(row[1], ""), row[2]}
	}

	// Add default category
	for i, row := range filteredContent {
		filteredContent[i] = append(row, "❓ Other")
	}

	// Insert into database
	for _, row := range filteredContent {
		rowInterface := make([]interface{}, len(row))
		for i, v := range row {
			rowInterface[i] = v
		}
		err := db.Exec(`
			INSERT INTO Transactions (date, description, amount, category)
			VALUES (?, ?, ?, ?)
		`, rowInterface)
		if err != nil {
			return err
		}
	}
	return nil
}
