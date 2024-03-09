package main

import (
	"context"

	dbPkg "go-budget/internal/db"
	"go-budget/internal/models"
	"go-budget/internal/parser"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods

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

func (a *App) Categorize(ctx context.Context, db *dbPkg.Db, toCategorize []dbPkg.Transaction) ([]dbPkg.Transaction, error) {
	a.ctx = ctx
	// Get transactions from db
	transactions, err := db.QueryTransactions("SELECT * FROM transactions", nil)
	if err != nil {
		return []dbPkg.Transaction{}, err
	}
	// Categorize transactions
	categorized := models.Categorize(transactions, toCategorize)
	return categorized, nil
}
