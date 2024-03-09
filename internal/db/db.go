package db

import (
	"context"
	"database/sql"
	"fmt"

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
	// open the database
	// log.Println("Opening database:", db.dbPath)
	err := db.Open()
	if err != nil {
		panic(err)
	}
	// log.Println("Successfully opened database:", db.dbPath)

	// set database date format to DD-MM-YYYY
	// log.Println("Setting database date format to DD-MM-YYYY")
	err = db.Exec("PRAGMA date_class = 'yyyy-mm-dd';", nil)
	if err != nil {
		panic(err)
	}

	// log.Println("Creating tables if they don't exist")
	// Create tables
	err = db.Exec(`
		CREATE TABLE IF NOT EXISTS Transactions (
			id INTEGER PRIMARY KEY,
			date TEXT NOT NULL,
			description TEXT,
			amount INTEGER NOT NULL,
			category TEXT
		)
	`, nil)
	if err != nil {
		panic(err)
	}
	err = db.Exec(`
		CREATE TABLE IF NOT EXISTS CategoriesIncome (
			name TEXT PRIMARY KEY,
			target INTEGER NOT NULL DEFAULT 0,
			colour TEXT NOT NULL DEFAULT "#E0BBE4"
		)
	`, nil)
	if err != nil {
		panic(err)
	}
	err = db.Exec(`
		CREATE TABLE IF NOT EXISTS CategoriesExpense (
			name TEXT PRIMARY KEY,
			target INTEGER NOT NULL DEFAULT 0,
			colour TEXT NOT NULL DEFAULT "#E0BBE4"
		)
	`, nil)
	if err != nil {
		panic(err)
	}
	// log.Println("finished creating tables")

	// Insert default values if CategoriesExpense table is empty
	// log.Println("Inserting default values if CategoriesExpense table is empty")
	count, err := db.QueryRowCount("SELECT COUNT(*) FROM CategoriesExpense", nil)
	if err != nil {
		panic(err)
	}
	if count == 0 {
		// log.Println("Inserting default values into CategoriesExpense table")
		err = db.Exec(`
			INSERT INTO CategoriesExpense (name, target, colour)
			VALUES
				('🍞 Groceries', 0, '#9ba9ff'),
				('💲 Rent', 0, '#a5adff'),
				('⚡ Power', 0, '#afb1ff'),
				('🌐 Internet', 0, '#b9b5ff'),
				('🏠 Household', 0, '#c4baff'),
				('🍽️ Restaurant', 0, '#cebeff'),
				('😎 Leisure', 0, '#d8c2ff'),
				('🚌 Public transportation', 0, '#e2c6ff'),
				('📈 Investment', 0, '#eccaff'),
				('📱 Phone', 0, '#c4c7ff'),
				('👕 Clothing', 0, '#c1cdf9'),
				('💋 Vanity', 0, '#c0e1f9'),
				('🚑 Medical', 0, '#bbdef9'),
				('✈️ Travel', 0, '#acdcff'),
				('🔔 Subscription', 0, '#9cd2f7'),
				('🎁 Gifts', 0, '#89ccf6'),
				('💸 Debt', 0, '#6aa1f4'),
				('🚫 Ignore', 0, '#fc035e'),
				('❓ Other', 0, '#5d97d1')
		`, nil)
		if err != nil {
			panic(err)
		}
	}

	// Insert default values if CategoriesIncome table is empty
	// log.Println("Inserting default values if CategoriesIncome table is empty")
	count, err = db.QueryRowCount("SELECT COUNT(*) FROM CategoriesIncome", nil)
	if err != nil {
		panic(err)
	}
	if count == 0 {
		// log.Println("Inserting default values into CategoriesIncome table")
		err = db.Exec(`
			INSERT INTO CategoriesIncome (name, target, colour)
			VALUES
				('💰 Job', 0, '#96d289'),
				('🎁 Gift', 0, '#a9e99b'),
				('💲 Tax refund', 0, '#bbefa9'),
				('🔁 Expense reimbursement', 0, '#cdf5b7'),
				('🪙 Student allowance', 0, '#dbfdd8'),
				('📈 Investment return', 0, '#ffcae9'),
				('🚫 Ignore', 0, '#fc035e'),
				('❓ Other', 0, '#ffa8d9')
		`, nil)
		if err != nil {
			panic(err)
		}
	}

	// Insert Credit Card and Other into expenses and income if not present
	count, err = db.QueryRowCount("SELECT COUNT(*) FROM CategoriesExpense WHERE name = '🚫 Ignore'", nil)
	if err != nil {
		panic(err)
	}
	if count == 0 {
		err = db.Exec(`
			INSERT INTO CategoriesExpense (name, target, colour)
			VALUES
				('🚫 Ignore', 0, '#fc035e')
			`, nil)
		if err != nil {
			panic(err)
		}
	}
	count, err = db.QueryRowCount("SELECT COUNT(*) FROM CategoriesIncome WHERE name = '🚫 Ignore'", nil)
	if err != nil {
		panic(err)
	}
	if count == 0 {
		err = db.Exec(`
			INSERT INTO CategoriesIncome (name, target, colour)
			VALUES
				('🚫 Ignore', 0, '#fc035e')
			`, nil)
		if err != nil {
			panic(err)
		}
	}
	count, err = db.QueryRowCount("SELECT COUNT(*) FROM CategoriesExpense WHERE name = '❓ Other'", nil)
	if err != nil {
		panic(err)
	}
	if count == 0 {
		err = db.Exec(`
			INSERT INTO CategoriesExpense (name, target, colour)
			VALUES
				('❓ Other', 0, '#5d97d1')
			`, nil)
		if err != nil {
			panic(err)
		}
	}
	count, err = db.QueryRowCount("SELECT COUNT(*) FROM CategoriesIncome WHERE name = '❓ Other'", nil)
	if err != nil {
		panic(err)
	}
	if count == 0 {
		err = db.Exec(`
			INSERT INTO CategoriesIncome (name, target, colour)
			VALUES
				('❓ Other', 0, '#5d97d1')
			`, nil)
		if err != nil {
			panic(err)
		}
	}
	// log.Println("Finished db setup")
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
	err = res.Scan(&transaction.ID, &transaction.Date, &transaction.Description, &transaction.Amount, &transaction.Category)
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
		err = res.Scan(&transaction.ID, &transaction.Date, &transaction.Description, &transaction.Amount, &transaction.Category)
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
	err = res.Scan(&category.Name, &category.Target, &category.Colour)
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
		err = res.Scan(&category.Name, &category.Target, &category.Colour)
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
