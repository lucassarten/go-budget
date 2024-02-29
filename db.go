package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"

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

func (db *Db) startup(ctx context.Context) {
	db.ctx = ctx
	// open the database
	log.Println("Opening database:", db.dbPath)
	err := db.Open()
	if err != nil {
		panic(err)
	}
	log.Println("Successfully opened database:", db.dbPath)

	log.Println("Creating tables if they don't exist")
	// Create tables
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS Transactions (
			id INTEGER PRIMARY KEY,
			date TEXT NOT NULL,
			description TEXT,
			amount INTEGER NOT NULL,
			category TEXT
		)
	`)
	if err != nil {
		panic(err)
	}
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS CategoriesIncome (
			name TEXT PRIMARY KEY,
			target INTEGER NOT NULL DEFAULT 0,
			colour TEXT NOT NULL DEFAULT "#E0BBE4"
		)
	`)
	if err != nil {
		panic(err)
	}
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS CategoriesExpense (
			name TEXT PRIMARY KEY,
			target INTEGER NOT NULL DEFAULT 0,
			colour TEXT NOT NULL DEFAULT "#E0BBE4"
		)
	`)
	if err != nil {
		panic(err)
	}
	log.Println("finished creating tables")

	// Insert default values if CategoriesExpense table is empty
	log.Println("Inserting default values if CategoriesExpense table is empty")
	res, err := db.QueryRow("SELECT COUNT(*) FROM CategoriesExpense")
	if err != nil {
		panic(err)
	}
	count := int(res.(int64))
	if count == 0 {
		log.Println("Inserting default values into CategoriesExpense table")
		_, err = db.Exec(`
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
				('❓ Other', 0, '#5d97d1')
		`)
		if err != nil {
			panic(err)
		}
	}

	// Insert default values if CategoriesIncome table is empty
	log.Println("Inserting default values if CategoriesIncome table is empty")
	res, err = db.QueryRow("SELECT COUNT(*) FROM CategoriesIncome")
	if err != nil {
		panic(err)
	}
	count = int(res.(int64))
	if count == 0 {
		log.Println("Inserting default values into CategoriesIncome table")
		_, err = db.Exec(`
			INSERT INTO CategoriesIncome (name, target, colour)
			VALUES
				('💰 Job', 0, '#96d289'),
				('🎁 Gift', 0, '#a9e99b'),
				('💲 Tax refund', 0, '#bbefa9'),
				('🔁 Expense reimbursement', 0, '#cdf5b7'),
				('🪙 Student allowance', 0, '#dbfdd8'),
				('📈 Investment return', 0, '#ffcae9'),
				('❓ Other', 0, '#ffa8d9')
		`)
		if err != nil {
			panic(err)
		}
	}
	log.Println("Finished db setup")
}

func (db *Db) beforeClose(ctx context.Context) bool {
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

func (db *Db) Query(query string, args ...interface{}) ([]interface{}, error) {
	if db.dbRef == nil {
		return nil, fmt.Errorf("attempted to perform an action with no database connection")
	}
	res, err := db.dbRef.QueryContext(db.ctx, query, args...)
	if err != nil {
		return nil, err
	}
	var data []interface{}
	res.Scan(data...)
	log.Println("db response: ", data)
	return data, nil
}

func (db *Db) QueryRow(query string, args ...interface{}) (interface{}, error) {
	if db.dbRef == nil {
		return nil, fmt.Errorf("attempted to perform an action with no database connection")
	}
	res := db.dbRef.QueryRowContext(db.ctx, query, args...)
	var data interface{}
	res.Scan(&data)
	log.Println("db response: ", data)
	return data, nil
}

func (db *Db) Exec(query string, args ...interface{}) (sql.Result, error) {
	if db.dbRef == nil {
		return nil, fmt.Errorf("attempted to perform an action with no database connection")
	}
	return db.dbRef.ExecContext(db.ctx, query, args...)
}
