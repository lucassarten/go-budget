package db

import (
	"context"
	"database/sql"
	"fmt"
	"math/rand"
	"time"

	//"log"

	_ "github.com/mattn/go-sqlite3"
)

// App struct
type Db struct {
	ctx    context.Context
	dbRef  *sql.DB
	dbPath string
}

func NewDb(dbPath string) *Db {
	return &Db{
		dbPath: dbPath,
	}
}

func (db *Db) Startup(ctx context.Context) {
	db.ctx = ctx

	err := db.Open()
	if err != nil {
		panic(err)
	}

	err = db.Exec("PRAGMA date_class = 'yyyy-mm-dd';", nil)
	if err != nil {
		panic(err)
	}

	// Create tables
	err = db.Exec(`
		CREATE TABLE IF NOT EXISTS Transactions (
			id INTEGER PRIMARY KEY,
			date TEXT NOT NULL,
			description TEXT,
			amount INTEGER NOT NULL,
			category TEXT,
			reimbursed_by INTEGER,
			FOREIGN KEY (reimbursed_by) REFERENCES Transactions(id) ON DELETE SET NULL
		)
	`, nil)
	if err != nil {
		panic(err)
	}
	err = db.Exec(`
		CREATE TABLE IF NOT EXISTS CategoriesIncome (
			name TEXT PRIMARY KEY,
			monthly INTEGER NOT NULL DEFAULT 0,
			weekly INTEGER NOT NULL DEFAULT 0,
			colour TEXT NOT NULL DEFAULT "#E0BBE4"
		)
	`, nil)
	if err != nil {
		panic(err)
	}
	err = db.Exec(`
		CREATE TABLE IF NOT EXISTS CategoriesExpense (
			name TEXT PRIMARY KEY,
			monthly INTEGER NOT NULL DEFAULT 0,
			weekly INTEGER NOT NULL DEFAULT 0,
			colour TEXT NOT NULL DEFAULT "#E0BBE4"
		)
	`, nil)
	if err != nil {
		panic(err)
	}

	// Insert default values if CategoriesExpense table is empty
	count, err := db.QueryRowCount("SELECT COUNT(*) FROM CategoriesExpense", nil)
	if err != nil {
		panic(err)
	}
	if count == 0 {
		// Insert values from defaultCategoriesExpense
		for _, category := range defaultCategoriesExpense {
			err = db.Exec(`
				INSERT INTO CategoriesExpense (name, monthly, weekly, colour)
				VALUES (?, ?, ?, ?)
			`, []interface{}{category.Name, category.Monthly, category.Weekly, category.Colour})
			if err != nil {
				panic(err)
			}
		}
	}

	// Insert default values if CategoriesIncome table is empty
	count, err = db.QueryRowCount("SELECT COUNT(*) FROM CategoriesIncome", nil)
	if err != nil {
		panic(err)
	}
	if count == 0 {
		// Insert values from defaultCategoriesIncome
		for _, category := range defaultCategoriesIncome {
			err = db.Exec(`
				INSERT INTO CategoriesIncome (name, monthly, weekly, colour)
				VALUES (?, ?, ?, ?)
			`, []interface{}{category.Name, category.Monthly, category.Weekly, category.Colour})
			if err != nil {
				panic(err)
			}
		}
	}

	// Insert required categories into CategoriesExpense and CategoriesIncome if they don't exist
	for _, category := range requiredCategories {
		count, err = db.QueryRowCount("SELECT COUNT(*) FROM CategoriesExpense WHERE name = ?", []interface{}{category.Name})
		if err != nil {
			panic(err)
		}
		if count == 0 {
			err = db.Exec(`
				INSERT INTO CategoriesExpense (name, monthly, weekly, colour)
				VALUES (?, ?, ?, ?)
			`, []interface{}{category.Name, category.Monthly, category.Weekly, category.Colour})
			if err != nil {
				panic(err)
			}
		}
		count, err = db.QueryRowCount("SELECT COUNT(*) FROM CategoriesIncome WHERE name = ?", []interface{}{category.Name})
		if err != nil {
			panic(err)
		}
		if count == 0 {
			err = db.Exec(`
				INSERT INTO CategoriesIncome (name, monthly, weekly, colour)
				VALUES (?, ?, ?, ?)
			`, []interface{}{category.Name, category.Monthly, category.Weekly, category.Colour})
			if err != nil {
				panic(err)
			}
		}
	}

	// if dev.db
	if db.dbPath == "dev.db" {
		err = db.Exec("DELETE FROM Transactions", nil)
		if err != nil {
			panic(err)
		}
		for _, t := range GenerateTestTransactions() {
			err = db.Exec(`
				INSERT INTO Transactions (date, description, amount, category)
				VALUES (?, ?, ?, ?)
			`, []interface{}{t.Date, t.Description, t.Amount, t.Category})
			if err != nil {
				panic(err)
			}
		}
	}
}

func (db *Db) BeforeClose(ctx context.Context) bool {
	db.ctx = ctx
	// close db
	if db.dbRef == nil {
		return false
	}
	err := db.Close()
	return err != nil
}

func (db *Db) Open() error {
	dbRef, err := sql.Open("sqlite3", db.dbPath)
	if err != nil {
		return err
	}
	db.dbRef = dbRef
	return nil
}

func (db *Db) Ping() error {
	if db.dbRef == nil {
		return fmt.Errorf("attempted to perform an action with no database connection")
	}
	return db.dbRef.Ping()
}

func (db *Db) Close() error {
	if db.dbRef == nil {
		return fmt.Errorf("attempted to perform an action with no database connection")
	}
	return db.dbRef.Close()
}

func (db *Db) query(query string, args []interface{}) (*sql.Rows, error) {
	if db.dbRef == nil {
		return nil, fmt.Errorf("attempted to perform an action with no database connection")
	}
	// log.Println("running query: ", query, args)
	res, err := db.dbRef.QueryContext(db.ctx, query, args...)
	return res, err
}

func (db *Db) queryRow(query string, args []interface{}) (*sql.Row, error) {
	if db.dbRef == nil {
		return nil, fmt.Errorf("attempted to perform an action with no database connection")
	}
	// log.Println("running queryRow: ", query, args)
	res := db.dbRef.QueryRowContext(db.ctx, query, args...)
	return res, nil
}

func (db *Db) Exec(query string, args []interface{}) error {
	if db.dbRef == nil {
		return fmt.Errorf("attempted to perform an action with no database connection")
	}
	// log.Println("running query: ", query, args)
	_, err := db.dbRef.ExecContext(db.ctx, query, args...)
	return err
}

// Table specific methods for casting

func (db *Db) QueryTransaction(query string, args []interface{}) (Transaction, error) {
	// perform query
	res, err := db.queryRow(query, args)
	if err != nil {
		return Transaction{}, err
	}
	// cast to Transaction
	transaction := Transaction{}
	err = res.Scan(&transaction.ID, &transaction.Date, &transaction.Description, &transaction.Amount, &transaction.Category, &transaction.ReimbursedBy)
	if err != nil {
		return Transaction{}, err
	}
	// log.Println("transaction: ", transaction)
	return transaction, nil
}

func (db *Db) QueryTransactions(query string, args []interface{}) ([]Transaction, error) {
	// perform query
	res, err := db.query(query, args)
	if err != nil {
		return []Transaction{}, err
	}
	defer res.Close()
	// cast to []Transaction
	transactions := []Transaction{}
	for res.Next() {
		var transaction Transaction
		err = res.Scan(&transaction.ID, &transaction.Date, &transaction.Description, &transaction.Amount, &transaction.Category, &transaction.ReimbursedBy)
		if err != nil {
			return []Transaction{}, err
		}
		transactions = append(transactions, transaction)
	}
	//// log.Println("transactions: ", transactions)
	return transactions, nil
}

func (db *Db) QueryRowCategory(query string, args []interface{}) (Category, error) {
	// perform query
	res, err := db.queryRow(query, args)
	if err != nil {
		return Category{}, err
	}
	// cast to Category
	category := Category{}
	err = res.Scan(&category.Name, &category.Monthly, &category.Weekly, &category.Colour)
	if err != nil {
		return Category{}, err
	}
	// log.Println("category: ", category)
	return category, nil
}

func (db *Db) QueryCategories(query string, args []interface{}) ([]Category, error) {
	// perform query
	res, err := db.query(query, args)
	if err != nil {
		return []Category{}, err
	}
	defer res.Close()
	// cast to []Category
	categories := []Category{}
	for res.Next() {
		var category Category
		err = res.Scan(&category.Name, &category.Monthly, &category.Weekly, &category.Colour)
		if err != nil {
			return []Category{}, err
		}
		categories = append(categories, category)
	}
	// log.Println("categories: ", categories)
	return categories, nil
}

func (db *Db) QueryRowCount(query string, args []interface{}) (int64, error) {
	// perform query
	res, err := db.queryRow(query, args)
	if err != nil {
		return 0, err
	}
	// cast to Count
	count := int64(0)
	err = res.Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

// TESTING

// GenerateTestTransactions generates test transactions for expenses and incomes
func GenerateTestTransactions() []Transaction {
	// Generate test expenses
	expenses := generateTestExpenses()

	// Generate test incomes
	incomes := generateTestIncomes()

	return append(expenses, incomes...)
}

func generateTestExpenses() []Transaction {
	var expenses []Transaction

	// Generate 50 test expense transactions
	for i := 0; i < 50; i++ {
		// Randomly select an expense category
		categoryIndex := rand.Intn(len(defaultCategoriesExpense))
		category := defaultCategoriesExpense[categoryIndex].Name

		// Generate a random amount between 10 and 500
		amount := -rand.Float64()*490 + 10

		// Generate a random date within the last 90 days
		date := generateRandomDate()

		expense := Transaction{
			ID:          i + 1,
			Date:        date,
			Description: fmt.Sprintf("Expense #%d", i+1),
			Amount:      amount,
			Category:    category,
		}

		expenses = append(expenses, expense)
	}

	// 50 uncategorized expenses
	for i := 0; i < 50; i++ {
		// Generate a random amount between 10 and 500
		amount := -rand.Float64()*490 + 10

		// Generate a random date within the last 90 days
		date := generateRandomDate()

		expense := Transaction{
			ID:          i + 51,
			Date:        date,
			Description: fmt.Sprintf("Expense #%d", i+1),
			Amount:      amount,
			Category:    "❗ Uncategorized",
		}

		expenses = append(expenses, expense)
	}

	return expenses
}

func generateTestIncomes() []Transaction {
	var incomes []Transaction

	// Generate 50 test income transactions
	for i := 0; i < 50; i++ {
		// Randomly select an income category
		categoryIndex := rand.Intn(len(defaultCategoriesIncome))
		category := defaultCategoriesIncome[categoryIndex].Name

		// Generate a random amount between 100 and 1000
		amount := rand.Float64()*900 + 100

		// Generate a random date within the last 90 days
		date := generateRandomDate()

		income := Transaction{
			ID:          i + 1,
			Date:        date,
			Description: fmt.Sprintf("Income #%d", i+1),
			Amount:      amount,
			Category:    category,
		}

		incomes = append(incomes, income)
	}

	return incomes
}

func generateRandomDate() string {
	min := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC).Unix()
	max := time.Now().Unix()
	delta := max - min

	// Generate a random date within the last 90 days
	sec := rand.Int63n(delta) + min
	return time.Unix(sec, 0).Format("2006-01-02")
}
