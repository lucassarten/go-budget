package db

// requiredCategories is a list of categories that are required to be present in the database
var requiredCategories = []Category{
	{Name: "❗ Uncategorized", Target: 0, Colour: "#9ba9ff"},
	{Name: "🚫 Ignore", Target: 0, Colour: "#fc035e"},
	{Name: "❓ Other", Target: 0, Colour: "#5d97d1"},
	{Name: "🔁 Reimbursement", Target: 0, Colour: "#cdf5b7"},
}

// defaultCategoriesExpense is a list of default expense categories
var defaultCategoriesExpense = []Category{
	{Name: "🍞 Groceries", Target: 0, Colour: "#9ba9ff"},
	{Name: "💲 Rent", Target: 0, Colour: "#a5adff"},
	{Name: "⚡ Power", Target: 0, Colour: "#afb1ff"},
	{Name: "🌐 Internet", Target: 0, Colour: "#b9b5ff"},
	{Name: "🏠 Household", Target: 0, Colour: "#c4baff"},
	{Name: "🍽️ Restaurant", Target: 0, Colour: "#cebeff"},
	{Name: "😎 Leisure", Target: 0, Colour: "#d8c2ff"},
	{Name: "🚌 Public transportation", Target: 0, Colour: "#e2c6ff"},
	{Name: "📈 Investment", Target: 0, Colour: "#eccaff"},
	{Name: "📱 Phone", Target: 0, Colour: "#c4c7ff"},
	{Name: "👕 Clothing", Target: 0, Colour: "#c1cdf9"},
	{Name: "💋 Vanity", Target: 0, Colour: "#c0e1f9"},
	{Name: "🚑 Medical", Target: 0, Colour: "#bbdef9"},
	{Name: "✈️ Travel", Target: 0, Colour: "#acdcff"},
	{Name: "🔔 Subscription", Target: 0, Colour: "#9cd2f7"},
	{Name: "🎁 Gifts", Target: 0, Colour: "#89ccf6"},
	{Name: "💸 Debt", Target: 0, Colour: "#6aa1f4"},
}

// defaultCategoriesIncome is a list of default income categories
var defaultCategoriesIncome = []Category{
	{Name: "💰 Job", Target: 0, Colour: "#96d289"},
	{Name: "🎁 Gift", Target: 0, Colour: "#a9e99b"},
	{Name: "💲 Tax refund", Target: 0, Colour: "#bbefa9"},
	{Name: "📈 Investment return", Target: 0, Colour: "#ffcae9"},
}
