package db

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"

	"go-budget/ent"
	"go-budget/ent/category"
	"go-budget/ent/transaction"

	_ "github.com/mattn/go-sqlite3"
)

// App struct
type Db struct {
	ctx    context.Context
	client *ent.Client
	dbPath string
}

func NewDb(dbPath string) *Db {
	return &Db{
		dbPath: dbPath,
	}
}

func (db *Db) Startup(ctx context.Context) {
	db.ctx = ctx

	if db.dbPath == "dev.db" {
		os.Remove(db.dbPath)
	}

	err := db.Open()
	if err != nil {
		panic(err)
	}

	if err := db.client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

	// Insert default values if Categories table is empty
	res, err := db.client.Category.Query().All(db.ctx)
	if err != nil {
		panic(err)
	}
	if len(res) == 0 {
		log.Print("Creating default categories")
		for _, category := range defaultCategoriesExpense {
			_, err = db.CreateCategory(category.Name, category.Monthly, category.Weekly, category.Colour, "Expense")
			if err != nil {
				panic(err)
			}
		}
		for _, category := range defaultCategoriesIncome {
			_, err = db.CreateCategory(category.Name, category.Monthly, category.Weekly, category.Colour, "Income")
			if err != nil {
				panic(err)
			}
		}
	}

	// if dev.db
	if db.dbPath == "dev.db" {
		log.Print("Creating test transactions")
		_, err = db.client.Transaction.Delete().Exec(db.ctx)
		if err != nil {
			panic(err)
		}
		for _, t := range GenerateTestTransactions() {
			_, err := db.CreateTransaction(t.Time, t.Description, t.Amount, t.CategoryID)
			if err != nil {
				panic(err)
			}
		}
	}
}

func (db *Db) BeforeClose(ctx context.Context) bool {
	db.ctx = ctx
	// close db
	if db.client == nil {
		return false
	}
	err := db.Close()
	return err != nil
}

func (db *Db) Open() error {
	dbRef, err := ent.Open("sqlite3", "file:"+db.dbPath+"?_fk=1")
	if err != nil {
		return err
	}
	db.client = dbRef
	return nil
}

func (db *Db) Close() error {
	if db.client == nil {
		return fmt.Errorf("attempted to perform an action with no database connection")
	}
	return db.client.Close()
}

func (db *Db) GetTransactionByID(id int) (*ent.Transaction, error) {
	tx, err := db.client.Transaction.Get(db.ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction: %w", err)
	}
	return tx, nil
}

func (db *Db) GetTransactions() ([]*ent.Transaction, error) {
	txs, err := db.client.Transaction.Query().WithCategory().WithReimbursedByTransaction().WithReimburses().All(db.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get transactions: %w", err)
	}
	return txs, nil
}

func (db *Db) GetTransactionsIncome() ([]*ent.Transaction, error) {
	txs, err := db.client.Transaction.Query().Where(transaction.AmountGT(0.0)).All(db.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get transactions: %w", err)
	}
	return txs, nil
}

func (db *Db) GetTransactionsExpense() ([]*ent.Transaction, error) {
	txs, err := db.client.Transaction.Query().Where(transaction.AmountLTE(0.0)).All(db.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get transactions: %w", err)
	}
	return txs, nil
}

func (db *Db) GetCategoryByID(id int) (*ent.Category, error) {
	tx, err := db.client.Category.Get(db.ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get category: %w", err)
	}
	return tx, nil
}

func (db *Db) GetCategoryByName(name string) (*ent.Category, error) {
	cat, err := db.client.Category.Query().Where(category.NameEQ(name)).Only(db.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get category: %w", err)
	}
	return cat, nil
}

func (db *Db) GetCategories() ([]*ent.Category, error) {
	cats, err := db.client.Category.Query().All(db.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}
	return cats, nil
}

func (db *Db) GetCategoriesByType(categoryType string) ([]*ent.Category, error) {
	cats, err := db.client.Category.Query().Where(category.TypeEQ(categoryType)).All(db.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}
	return cats, nil
}

func (db *Db) GetCategoryTransactions(category ent.Category) ([]*ent.Transaction, error) {
	tx, err := category.QueryTransactions().All(db.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction for category %s: %w", category.Name, err)
	}
	return tx, nil
}

func (db *Db) CreateTransaction(time int64, description string, amount float64, categoryID int) (*ent.Transaction, error) {
	return db.client.Transaction.Create().
		SetTime(time).
		SetDescription(description).
		SetAmount(amount).
		SetCategoryID(categoryID).
		Save(db.ctx)
}

// CreateCategory creates a new category
func (db *Db) CreateCategory(name string, monthly float64, weekly float64, colour string, categoryType string) (*ent.Category, error) {
	return db.client.Category.Create().
		SetName(name).
		SetMonthly(monthly).
		SetWeekly(weekly).
		SetColour(colour).
		SetType(categoryType).
		Save(db.ctx)
}

// UpdateTransaction updates a transaction with the given details
func (db *Db) UpdateTransaction(id int, time *int64, description *string, amount *float64, categoryID *int, reimbursedByID *int) (*ent.Transaction, error) {
	tx, err := db.client.Transaction.Get(db.ctx, id)
	if err != nil {
		return nil, fmt.Errorf("transaction not found: %w", err)
	}

	updater := tx.Update()

	if time != nil {
		updater.SetTime(*time)
	}
	if description != nil {
		updater.SetDescription(*description)
	}
	if amount != nil {
		updater.SetAmount(*amount)
	}
	if categoryID != nil {
		updater.SetCategoryID(*categoryID)
	}
	if reimbursedByID != nil {
		updater.SetReimbursedByID(*reimbursedByID)
	}

	tx, err = updater.Save(db.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to update transaction: %w", err)
	}

	return tx, nil
}

// UpdateCategory updates a category with the given details
func (db *Db) UpdateCategory(id int, name *string, monthly *float64, weekly *float64, colour *string, categoryType *string) (*ent.Category, error) {
	cat, err := db.client.Category.Get(db.ctx, id)
	if err != nil {
		return nil, fmt.Errorf("category not found: %w", err)
	}

	updater := cat.Update()
	if name != nil {
		updater.SetName(*name)
	}
	if monthly != nil {
		updater.SetMonthly(*monthly)
	}
	if weekly != nil {
		updater.SetWeekly(*weekly)
	}
	if colour != nil {
		updater.SetColour(*colour)
	}
	if categoryType != nil {
		updater.SetType(*categoryType)
	}

	cat, err = updater.Save(db.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to update category: %w", err)
	}

	return cat, nil
}

func (db *Db) DeleteTransaction(id int) error {
	return db.client.Transaction.DeleteOneID(id).Exec(db.ctx)
}

func (db *Db) DeleteCategory(id int) error {
	return db.client.Category.DeleteOneID(id).Exec(db.ctx)
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
		categoryIndex := rand.Intn(len(defaultCategoriesExpense) - 1)
		category := categoryIndex

		// Generate a random amount between 10 and 500
		amount := -rand.Float64()*490 + 10

		// Generate a random date within the last 90 days
		time := generateRandomDate()

		expense := Transaction{
			ID:          i + 1,
			Time:        time,
			Description: fmt.Sprintf("Expense #%d", i+1),
			Amount:      amount,
			CategoryID:  category + 1,
		}

		expenses = append(expenses, expense)
	}

	// 50 uncategorized expenses
	for i := 0; i < 50; i++ {
		// Generate a random amount between 10 and 500
		amount := -rand.Float64()*490 + 10

		// Generate a random date within the last 90 days
		time := generateRandomDate()

		expense := Transaction{
			ID:          i + 51,
			Time:        time,
			Description: fmt.Sprintf("Expense #%d", i+1),
			Amount:      amount,
			CategoryID:  1,
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
		categoryIndex := len(defaultCategoriesExpense) + rand.Intn(len(defaultCategoriesIncome) - 1)
		category := categoryIndex

		// Generate a random amount between 100 and 1000
		amount := rand.Float64()*900 + 100

		// Generate a random date within the last 90 days
		time := generateRandomDate()

		income := Transaction{
			ID:          i + 1,
			Time:        time,
			Description: fmt.Sprintf("Income #%d", i+1),
			Amount:      amount,
			CategoryID:  category + 1,
		}

		incomes = append(incomes, income)
	}

	return incomes
}

func generateRandomDate() int64 {
	min := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC).Unix()
	max := time.Now().Unix()
	delta := max - min

	// Generate a random date within the last 90 days
	sec := rand.Int63n(delta) + min
	return sec
}
