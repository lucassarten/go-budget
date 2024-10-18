// Code generated by ent, DO NOT EDIT.

package ent

import (
	"fmt"
	"go-budget/ent/category"
	"go-budget/ent/transaction"
	"strings"

	"entgo.io/ent"
	"entgo.io/ent/dialect/sql"
)

// Transaction is the model entity for the Transaction schema.
type Transaction struct {
	config `json:"-"`
	// ID of the ent.
	ID int `json:"id,omitempty"`
	// Time holds the value of the "time" field.
	Time int64 `json:"time,omitempty"`
	// Description holds the value of the "description" field.
	Description string `json:"description,omitempty"`
	// Amount holds the value of the "amount" field.
	Amount float64 `json:"amount,omitempty"`
	// Ignored holds the value of the "ignored" field.
	Ignored bool `json:"ignored,omitempty"`
	// CategoryID holds the value of the "category_id" field.
	CategoryID int `json:"category_id,omitempty"`
	// ReimbursedByID holds the value of the "reimbursed_by_id" field.
	ReimbursedByID *int `json:"reimbursed_by_id,omitempty"`
	// Edges holds the relations/edges for other nodes in the graph.
	// The values are being populated by the TransactionQuery when eager-loading is set.
	Edges        TransactionEdges `json:"edges"`
	selectValues sql.SelectValues
}

// TransactionEdges holds the relations/edges for other nodes in the graph.
type TransactionEdges struct {
	// Category holds the value of the category edge.
	Category *Category `json:"category,omitempty"`
	// ReimbursedByTransaction holds the value of the reimbursed_by_transaction edge.
	ReimbursedByTransaction *Transaction `json:"reimbursed_by_transaction,omitempty"`
	// loadedTypes holds the information for reporting if a
	// type was loaded (or requested) in eager-loading or not.
	loadedTypes [2]bool
}

// CategoryOrErr returns the Category value or an error if the edge
// was not loaded in eager-loading, or loaded but was not found.
func (e TransactionEdges) CategoryOrErr() (*Category, error) {
	if e.Category != nil {
		return e.Category, nil
	} else if e.loadedTypes[0] {
		return nil, &NotFoundError{label: category.Label}
	}
	return nil, &NotLoadedError{edge: "category"}
}

// ReimbursedByTransactionOrErr returns the ReimbursedByTransaction value or an error if the edge
// was not loaded in eager-loading, or loaded but was not found.
func (e TransactionEdges) ReimbursedByTransactionOrErr() (*Transaction, error) {
	if e.ReimbursedByTransaction != nil {
		return e.ReimbursedByTransaction, nil
	} else if e.loadedTypes[1] {
		return nil, &NotFoundError{label: transaction.Label}
	}
	return nil, &NotLoadedError{edge: "reimbursed_by_transaction"}
}

// scanValues returns the types for scanning values from sql.Rows.
func (*Transaction) scanValues(columns []string) ([]any, error) {
	values := make([]any, len(columns))
	for i := range columns {
		switch columns[i] {
		case transaction.FieldIgnored:
			values[i] = new(sql.NullBool)
		case transaction.FieldAmount:
			values[i] = new(sql.NullFloat64)
		case transaction.FieldID, transaction.FieldTime, transaction.FieldCategoryID, transaction.FieldReimbursedByID:
			values[i] = new(sql.NullInt64)
		case transaction.FieldDescription:
			values[i] = new(sql.NullString)
		default:
			values[i] = new(sql.UnknownType)
		}
	}
	return values, nil
}

// assignValues assigns the values that were returned from sql.Rows (after scanning)
// to the Transaction fields.
func (t *Transaction) assignValues(columns []string, values []any) error {
	if m, n := len(values), len(columns); m < n {
		return fmt.Errorf("mismatch number of scan values: %d != %d", m, n)
	}
	for i := range columns {
		switch columns[i] {
		case transaction.FieldID:
			value, ok := values[i].(*sql.NullInt64)
			if !ok {
				return fmt.Errorf("unexpected type %T for field id", value)
			}
			t.ID = int(value.Int64)
		case transaction.FieldTime:
			if value, ok := values[i].(*sql.NullInt64); !ok {
				return fmt.Errorf("unexpected type %T for field time", values[i])
			} else if value.Valid {
				t.Time = value.Int64
			}
		case transaction.FieldDescription:
			if value, ok := values[i].(*sql.NullString); !ok {
				return fmt.Errorf("unexpected type %T for field description", values[i])
			} else if value.Valid {
				t.Description = value.String
			}
		case transaction.FieldAmount:
			if value, ok := values[i].(*sql.NullFloat64); !ok {
				return fmt.Errorf("unexpected type %T for field amount", values[i])
			} else if value.Valid {
				t.Amount = value.Float64
			}
		case transaction.FieldIgnored:
			if value, ok := values[i].(*sql.NullBool); !ok {
				return fmt.Errorf("unexpected type %T for field ignored", values[i])
			} else if value.Valid {
				t.Ignored = value.Bool
			}
		case transaction.FieldCategoryID:
			if value, ok := values[i].(*sql.NullInt64); !ok {
				return fmt.Errorf("unexpected type %T for field category_id", values[i])
			} else if value.Valid {
				t.CategoryID = int(value.Int64)
			}
		case transaction.FieldReimbursedByID:
			if value, ok := values[i].(*sql.NullInt64); !ok {
				return fmt.Errorf("unexpected type %T for field reimbursed_by_id", values[i])
			} else if value.Valid {
				t.ReimbursedByID = new(int)
				*t.ReimbursedByID = int(value.Int64)
			}
		default:
			t.selectValues.Set(columns[i], values[i])
		}
	}
	return nil
}

// Value returns the ent.Value that was dynamically selected and assigned to the Transaction.
// This includes values selected through modifiers, order, etc.
func (t *Transaction) Value(name string) (ent.Value, error) {
	return t.selectValues.Get(name)
}

// QueryCategory queries the "category" edge of the Transaction entity.
func (t *Transaction) QueryCategory() *CategoryQuery {
	return NewTransactionClient(t.config).QueryCategory(t)
}

// QueryReimbursedByTransaction queries the "reimbursed_by_transaction" edge of the Transaction entity.
func (t *Transaction) QueryReimbursedByTransaction() *TransactionQuery {
	return NewTransactionClient(t.config).QueryReimbursedByTransaction(t)
}

// Update returns a builder for updating this Transaction.
// Note that you need to call Transaction.Unwrap() before calling this method if this Transaction
// was returned from a transaction, and the transaction was committed or rolled back.
func (t *Transaction) Update() *TransactionUpdateOne {
	return NewTransactionClient(t.config).UpdateOne(t)
}

// Unwrap unwraps the Transaction entity that was returned from a transaction after it was closed,
// so that all future queries will be executed through the driver which created the transaction.
func (t *Transaction) Unwrap() *Transaction {
	_tx, ok := t.config.driver.(*txDriver)
	if !ok {
		panic("ent: Transaction is not a transactional entity")
	}
	t.config.driver = _tx.drv
	return t
}

// String implements the fmt.Stringer.
func (t *Transaction) String() string {
	var builder strings.Builder
	builder.WriteString("Transaction(")
	builder.WriteString(fmt.Sprintf("id=%v, ", t.ID))
	builder.WriteString("time=")
	builder.WriteString(fmt.Sprintf("%v", t.Time))
	builder.WriteString(", ")
	builder.WriteString("description=")
	builder.WriteString(t.Description)
	builder.WriteString(", ")
	builder.WriteString("amount=")
	builder.WriteString(fmt.Sprintf("%v", t.Amount))
	builder.WriteString(", ")
	builder.WriteString("ignored=")
	builder.WriteString(fmt.Sprintf("%v", t.Ignored))
	builder.WriteString(", ")
	builder.WriteString("category_id=")
	builder.WriteString(fmt.Sprintf("%v", t.CategoryID))
	builder.WriteString(", ")
	if v := t.ReimbursedByID; v != nil {
		builder.WriteString("reimbursed_by_id=")
		builder.WriteString(fmt.Sprintf("%v", *v))
	}
	builder.WriteByte(')')
	return builder.String()
}

// Transactions is a parsable slice of Transaction.
type Transactions []*Transaction
