package main

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"go-budget/internal/parser"
	dbPkg "go-budget/internal/db"
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

func (a *App) selectFile(ctx context.Context, fileType string) (string, error) {
	a.ctx = ctx
	// open file dialog
	return runtime.OpenFileDialog(ctx, runtime.OpenDialogOptions{
		Title:   "Select a file",
		Filters: []runtime.FileFilter{{DisplayName: fileType + " Files", Pattern: "*." + fileType}},
	})
}
