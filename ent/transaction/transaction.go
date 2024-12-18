// Code generated by ent, DO NOT EDIT.

package transaction

import (
	"entgo.io/ent/dialect/sql"
	"entgo.io/ent/dialect/sql/sqlgraph"
)

const (
	// Label holds the string label denoting the transaction type in the database.
	Label = "transaction"
	// FieldID holds the string denoting the id field in the database.
	FieldID = "id"
	// FieldTime holds the string denoting the time field in the database.
	FieldTime = "time"
	// FieldDescription holds the string denoting the description field in the database.
	FieldDescription = "description"
	// FieldAmount holds the string denoting the amount field in the database.
	FieldAmount = "amount"
	// FieldIgnored holds the string denoting the ignored field in the database.
	FieldIgnored = "ignored"
	// FieldCategoryID holds the string denoting the category_id field in the database.
	FieldCategoryID = "category_id"
	// FieldReimbursedByID holds the string denoting the reimbursed_by_id field in the database.
	FieldReimbursedByID = "reimbursed_by_id"
	// EdgeCategory holds the string denoting the category edge name in mutations.
	EdgeCategory = "category"
	// EdgeReimbursedByTransaction holds the string denoting the reimbursed_by_transaction edge name in mutations.
	EdgeReimbursedByTransaction = "reimbursed_by_transaction"
	// Table holds the table name of the transaction in the database.
	Table = "transactions"
	// CategoryTable is the table that holds the category relation/edge.
	CategoryTable = "transactions"
	// CategoryInverseTable is the table name for the Category entity.
	// It exists in this package in order to avoid circular dependency with the "category" package.
	CategoryInverseTable = "categories"
	// CategoryColumn is the table column denoting the category relation/edge.
	CategoryColumn = "category_id"
	// ReimbursedByTransactionTable is the table that holds the reimbursed_by_transaction relation/edge.
	ReimbursedByTransactionTable = "transactions"
	// ReimbursedByTransactionColumn is the table column denoting the reimbursed_by_transaction relation/edge.
	ReimbursedByTransactionColumn = "reimbursed_by_id"
)

// Columns holds all SQL columns for transaction fields.
var Columns = []string{
	FieldID,
	FieldTime,
	FieldDescription,
	FieldAmount,
	FieldIgnored,
	FieldCategoryID,
	FieldReimbursedByID,
}

// ValidColumn reports if the column name is valid (part of the table columns).
func ValidColumn(column string) bool {
	for i := range Columns {
		if column == Columns[i] {
			return true
		}
	}
	return false
}

var (
	// DefaultAmount holds the default value on creation for the "amount" field.
	DefaultAmount float64
	// DefaultIgnored holds the default value on creation for the "ignored" field.
	DefaultIgnored bool
)

// OrderOption defines the ordering options for the Transaction queries.
type OrderOption func(*sql.Selector)

// ByID orders the results by the id field.
func ByID(opts ...sql.OrderTermOption) OrderOption {
	return sql.OrderByField(FieldID, opts...).ToFunc()
}

// ByTime orders the results by the time field.
func ByTime(opts ...sql.OrderTermOption) OrderOption {
	return sql.OrderByField(FieldTime, opts...).ToFunc()
}

// ByDescription orders the results by the description field.
func ByDescription(opts ...sql.OrderTermOption) OrderOption {
	return sql.OrderByField(FieldDescription, opts...).ToFunc()
}

// ByAmount orders the results by the amount field.
func ByAmount(opts ...sql.OrderTermOption) OrderOption {
	return sql.OrderByField(FieldAmount, opts...).ToFunc()
}

// ByIgnored orders the results by the ignored field.
func ByIgnored(opts ...sql.OrderTermOption) OrderOption {
	return sql.OrderByField(FieldIgnored, opts...).ToFunc()
}

// ByCategoryID orders the results by the category_id field.
func ByCategoryID(opts ...sql.OrderTermOption) OrderOption {
	return sql.OrderByField(FieldCategoryID, opts...).ToFunc()
}

// ByReimbursedByID orders the results by the reimbursed_by_id field.
func ByReimbursedByID(opts ...sql.OrderTermOption) OrderOption {
	return sql.OrderByField(FieldReimbursedByID, opts...).ToFunc()
}

// ByCategoryField orders the results by category field.
func ByCategoryField(field string, opts ...sql.OrderTermOption) OrderOption {
	return func(s *sql.Selector) {
		sqlgraph.OrderByNeighborTerms(s, newCategoryStep(), sql.OrderByField(field, opts...))
	}
}

// ByReimbursedByTransactionField orders the results by reimbursed_by_transaction field.
func ByReimbursedByTransactionField(field string, opts ...sql.OrderTermOption) OrderOption {
	return func(s *sql.Selector) {
		sqlgraph.OrderByNeighborTerms(s, newReimbursedByTransactionStep(), sql.OrderByField(field, opts...))
	}
}
func newCategoryStep() *sqlgraph.Step {
	return sqlgraph.NewStep(
		sqlgraph.From(Table, FieldID),
		sqlgraph.To(CategoryInverseTable, FieldID),
		sqlgraph.Edge(sqlgraph.M2O, true, CategoryTable, CategoryColumn),
	)
}
func newReimbursedByTransactionStep() *sqlgraph.Step {
	return sqlgraph.NewStep(
		sqlgraph.From(Table, FieldID),
		sqlgraph.To(Table, FieldID),
		sqlgraph.Edge(sqlgraph.O2O, false, ReimbursedByTransactionTable, ReimbursedByTransactionColumn),
	)
}
