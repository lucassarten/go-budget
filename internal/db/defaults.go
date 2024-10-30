package db

// defaultCategoriesExpense is a list of default expense categories
var defaultCategoriesExpense = []Category{
	{Name: "🍞 Groceries", Monthly: 1.0, Weekly: 1.0, Colour: "#9ba9ff"},
	{Name: "💲 Rent", Monthly: 1.0, Weekly: 1.0, Colour: "#a5adff"},
	{Name: "⚡ Power", Monthly: 1.0, Weekly: 1.0, Colour: "#afb1ff"},
	{Name: "🌐 Internet", Monthly: 1.0, Weekly: 1.0, Colour: "#b9b5ff"},
	{Name: "🏠 Household", Monthly: 1.0, Weekly: 1.0, Colour: "#c4baff"},
	{Name: "🍽️ Restaurant", Monthly: 1.0, Weekly: 1.0, Colour: "#cebeff"},
	{Name: "😎 Leisure", Monthly: 1.0, Weekly: 1.0, Colour: "#d8c2ff"},
	{Name: "🚌 Public transport", Monthly: 1.0, Weekly: 1.0, Colour: "#e2c6ff"},
	{Name: "📈 Investment", Monthly: 1.0, Weekly: 1.0, Colour: "#eccaff"},
	{Name: "📱 Phone", Monthly: 1.0, Weekly: 1.0, Colour: "#c4c7ff"},
	{Name: "👕 Clothing", Monthly: 1.0, Weekly: 1.0, Colour: "#c1cdf9"},
	{Name: "💋 Vanity", Monthly: 1.0, Weekly: 1.0, Colour: "#c0e1f9"},
	{Name: "🚑 Medical", Monthly: 1.0, Weekly: 1.0, Colour: "#bbdef9"},
	{Name: "✈️ Travel", Monthly: 1.0, Weekly: 1.0, Colour: "#acdcff"},
	{Name: "🔔 Subscription", Monthly: 1.0, Weekly: 1.0, Colour: "#9cd2f7"},
	{Name: "🎁 Gifts", Monthly: 1.0, Weekly: 1.0, Colour: "#89ccf6"},
	{Name: "💸 Debt", Monthly: 1.0, Weekly: 1.0, Colour: "#6aa1f4"},
}

// defaultCategoriesIncome is a list of default income categories
var defaultCategoriesIncome = []Category{
	{Name: "💰 Job", Monthly: 1.0, Weekly: 1.0, Colour: "#96d289"},
	{Name: "🎁 Gift", Monthly: 1.0, Weekly: 1.0, Colour: "#a9e99b"},
	{Name: "💲 Tax refund", Monthly: 1.0, Weekly: 1.0, Colour: "#bbefa9"},
	{Name: "📈 Investment return", Monthly: 1.0, Weekly: 1.0, Colour: "#ffcae9"},
}
