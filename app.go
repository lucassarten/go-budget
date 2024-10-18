package main

import (
	"context"
	"strconv"
	"go-budget/ent"
	dbPkg "go-budget/internal/db"
	"go-budget/internal/models"

	"github.com/samber/lo"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"go-budget/internal/parser"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

func (a *App) shutdown(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) domready(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) beforeClose(ctx context.Context) bool {
	a.ctx = ctx
	return false
}

func (a *App) selectFile(ctx context.Context, fileType string) (string, error) {
	a.ctx = ctx
	// open file dialog
	return runtime.OpenFileDialog(ctx, runtime.OpenDialogOptions{
		Title:   "Select a file",
		Filters: []runtime.FileFilter{{DisplayName: fileType + " Files", Pattern: "*." + fileType}},
	})
}

func (a *App) LoadFile(ctx context.Context, db *dbPkg.Db) {
	a.ctx = ctx
	// open file dialog
	file, err := a.selectFile(ctx, "csv")
	if err != nil {
		return
	}
	// process file
	parser.ImportFile(db, file, "TSB")
}

func (a *App) Categorize(ctx context.Context, db *dbPkg.Db, toCategorize []*ent.Transaction) ([]*ent.Transaction, int, error) {
	a.ctx = ctx
	// Get transactions from db
	transactions, err := db.GetTransactions()
	if err != nil {
		return []*ent.Transaction{}, 0, err
	}
	// Categorize transactions
	categorized, numCategorized := models.Categorize(transactions, toCategorize)
	return categorized, numCategorized, nil
}

func (a *App) CategorizeUncategorized(ctx context.Context, db *dbPkg.Db) (int, error) {
	a.ctx = ctx
	// Get transactions from db
	transactions, err := db.GetTransactions()
	if err != nil {
		return 0, err
	}
	transactionsToClassify := lo.Filter(transactions, func(transaction *ent.Transaction, idx int) bool {
		return lo.IsNil(transaction.CategoryID)
	})
	// Categorize transactions
	categorized, numCategorized, err := a.Categorize(ctx, db, transactionsToClassify)
	if err != nil {
		return 0, err
	}
	// Update db
	for _, t := range categorized {
		_, err = db.UpdateTransaction(t.ID, &t.Time, &t.Description, &t.Amount, &t.CategoryID, t.ReimbursedByID, &t.Ignored)
		if err != nil {
			return 0, err
		}
	}
	// alert number of categorized
	runtime.MessageDialog(ctx, runtime.MessageDialogOptions{
		Type:    runtime.InfoDialog,
		Title:   "Categorization Complete",
		Message: "Categorized " + strconv.Itoa(numCategorized) + " transactions",
	})
	return numCategorized, nil
}
