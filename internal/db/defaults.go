package db

// requiredCategories is a list of categories that are required to be present in the database
var requiredCategories = []Category{
	{Name: "❗ Uncategorized", Monthly: 0, Weekly: 0, Colour: "#9ba9ff"},
	{Name: "🚫 Ignore", Monthly: 0, Weekly: 0, Colour: "#fc035e"},
	{Name: "❓ Other", Monthly: 0, Weekly: 0, Colour: "#5d97d1"},
	{Name: "🔁 Reimbursement", Monthly: 0, Weekly: 0, Colour: "#cdf5b7"},
}

// defaultCategoriesExpense is a list of default expense categories
var defaultCategoriesExpense = []Category{
	{Name: "🍞 Groceries", Monthly: 0, Weekly: 0, Colour: "#9ba9ff"},
	{Name: "💲 Rent", Monthly: 0, Weekly: 0, Colour: "#a5adff"},
	{Name: "⚡ Power", Monthly: 0, Weekly: 0, Colour: "#afb1ff"},
	{Name: "🌐 Internet", Monthly: 0, Weekly: 0, Colour: "#b9b5ff"},
	{Name: "🏠 Household", Monthly: 0, Weekly: 0, Colour: "#c4baff"},
	{Name: "🍽️ Restaurant", Monthly: 0, Weekly: 0, Colour: "#cebeff"},
	{Name: "😎 Leisure", Monthly: 0, Weekly: 0, Colour: "#d8c2ff"},
	{Name: "🚌 Public transportation", Monthly: 0, Weekly: 0, Colour: "#e2c6ff"},
	{Name: "📈 Investment", Monthly: 0, Weekly: 0, Colour: "#eccaff"},
	{Name: "📱 Phone", Monthly: 0, Weekly: 0, Colour: "#c4c7ff"},
	{Name: "👕 Clothing", Monthly: 0, Weekly: 0, Colour: "#c1cdf9"},
	{Name: "💋 Vanity", Monthly: 0, Weekly: 0, Colour: "#c0e1f9"},
	{Name: "🚑 Medical", Monthly: 0, Weekly: 0, Colour: "#bbdef9"},
	{Name: "✈️ Travel", Monthly: 0, Weekly: 0, Colour: "#acdcff"},
	{Name: "🔔 Subscription", Monthly: 0, Weekly: 0, Colour: "#9cd2f7"},
	{Name: "🎁 Gifts", Monthly: 0, Weekly: 0, Colour: "#89ccf6"},
	{Name: "💸 Debt", Monthly: 0, Weekly: 0, Colour: "#6aa1f4"},
}

// defaultCategoriesIncome is a list of default income categories
var defaultCategoriesIncome = []Category{
	{Name: "💰 Job", Monthly: 0, Weekly: 0, Colour: "#96d289"},
	{Name: "🎁 Gift", Monthly: 0, Weekly: 0, Colour: "#a9e99b"},
	{Name: "💲 Tax refund", Monthly: 0, Weekly: 0, Colour: "#bbefa9"},
	{Name: "📈 Investment return", Monthly: 0, Weekly: 0, Colour: "#ffcae9"},
}
