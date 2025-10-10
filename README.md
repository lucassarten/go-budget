# go-budget

**go-budget** is a cross-platform budget management app built with **Go** and **Wails**. It helps you keep track of your income, expenses, and savings, giving you a clear picture of your finances. The app is designed to be simple and intuitive.

## Features

- **Dashboard 📊** – See your overall financial situation at a glance.  
- **Budget Comparison 📈** – Track how your spending matches your targets.  
- **Income, Expenses, and Savings 💰** – Get detailed insights into your finances.  
- **Customisation 🎨** – Personalise categories with your own colors.  
- **Transaction Management 💳** – Easily add, edit, and categorize transactions.  
- **Statement Importing 📄** – Import your bank statements to populate your budget.  
- **Budget Targets 🎯** – Set goals and monitor your progress.  
- **Date Range Options 📅** – Analyze your finances over custom time periods.  
- **Auto Updater 🔄** – Keep the app up to date with the latest features and fixes.  

## Installation

1. Download the latest release from the [Releases page](#).  

## Usage

- Open **go-budget** to see your dashboard and financial overview.  
- Use the graphs and summaries to understand your income, spending, and savings.  
- Import your statements to quickly populate transactions.  
- Customise categories and themes to make the app your own.  
- Track goals and analyse trends to make informed financial decisions.  

## Support

If you run into any issues or have questions, please [open an issue](https://github.com/lucassarten/go-budget/issues) on GitHub.  

## License

**go-budget** is licensed under the MIT License.  

> Note: go-budget is actively developed, and future updates will bring new features and improvements.

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.
