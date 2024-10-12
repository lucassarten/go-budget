package main

import (
	"embed"
	"log"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"

	//"github.com/wailsapp/wails/v2/pkg/menu"
	//"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"

	//"github.com/wailsapp/wails/v2/pkg/runtime"

	"go-budget/internal/db"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	dbPath := "./user.db"
	if len(os.Args) > 1 {
		if os.Args[1] == "-db" {
			dbPath = os.Args[2]
		}
	}

	// Create an instance of the app structure
	app := NewApp()
	// Create an instance of the db structure
	db := db.NewDb(dbPath)
	// Setup menu
	//menu := setupMenu(app, db)

	// Create application with options
	err := wails.Run(&options.App{
		Title:       "go-budget",
		Width:       1600,
		Height:      900,
		MaxWidth:    3440,
		MaxHeight:   1440,
		StartHidden: true,
		//Menu:               menu,
		Logger:             logger.NewDefaultLogger(),
		LogLevel:           logger.DEBUG,
		LogLevelProduction: logger.ERROR,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 1},
		OnStartup:        db.Startup,
		OnDomReady:       app.domready,
		OnShutdown:       app.shutdown,
		OnBeforeClose:    db.BeforeClose,
		Bind: []interface{}{
			app,
			db,
		},
		Linux: &linux.Options{
			WindowIsTranslucent: false,
			WebviewGpuPolicy:    linux.WebviewGpuPolicyAlways,
			ProgramName:         "go-budget",
		},
		Debug: options.Debug{
			OpenInspectorOnStartup: false,
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}

// func setupMenu(app *App, db *db.Db) *menu.Menu {
// 	AppMenu := menu.NewMenu()
// 	FileMenu := AppMenu.AddSubmenu("File")
// 	FileMenu.AddText("Import", keys.CmdOrCtrl("o"), func(_ *menu.CallbackData) { app.LoadFile(app.ctx, db) })
// 	FileMenu.AddSeparator()
// 	FileMenu.AddText("Categorize", keys.CmdOrCtrl("c"), func(_ *menu.CallbackData) { app.CategorizeUncategorized(app.ctx, db) })
// 	FileMenu.AddSeparator()
// 	FileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
// 		runtime.Quit(app.ctx)
// 	})
// 	return AppMenu
// }
