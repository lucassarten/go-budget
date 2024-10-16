// Code generated by ent, DO NOT EDIT.

package ent

import (
	"context"
	"errors"
	"fmt"
	"go-budget/ent/category"
	"go-budget/ent/predicate"
	"go-budget/ent/transaction"

	"entgo.io/ent/dialect/sql"
	"entgo.io/ent/dialect/sql/sqlgraph"
	"entgo.io/ent/schema/field"
)

// TransactionUpdate is the builder for updating Transaction entities.
type TransactionUpdate struct {
	config
	hooks    []Hook
	mutation *TransactionMutation
}

// Where appends a list predicates to the TransactionUpdate builder.
func (tu *TransactionUpdate) Where(ps ...predicate.Transaction) *TransactionUpdate {
	tu.mutation.Where(ps...)
	return tu
}

// SetTime sets the "time" field.
func (tu *TransactionUpdate) SetTime(i int64) *TransactionUpdate {
	tu.mutation.ResetTime()
	tu.mutation.SetTime(i)
	return tu
}

// SetNillableTime sets the "time" field if the given value is not nil.
func (tu *TransactionUpdate) SetNillableTime(i *int64) *TransactionUpdate {
	if i != nil {
		tu.SetTime(*i)
	}
	return tu
}

// AddTime adds i to the "time" field.
func (tu *TransactionUpdate) AddTime(i int64) *TransactionUpdate {
	tu.mutation.AddTime(i)
	return tu
}

// SetDescription sets the "description" field.
func (tu *TransactionUpdate) SetDescription(s string) *TransactionUpdate {
	tu.mutation.SetDescription(s)
	return tu
}

// SetNillableDescription sets the "description" field if the given value is not nil.
func (tu *TransactionUpdate) SetNillableDescription(s *string) *TransactionUpdate {
	if s != nil {
		tu.SetDescription(*s)
	}
	return tu
}

// SetAmount sets the "amount" field.
func (tu *TransactionUpdate) SetAmount(f float64) *TransactionUpdate {
	tu.mutation.ResetAmount()
	tu.mutation.SetAmount(f)
	return tu
}

// SetNillableAmount sets the "amount" field if the given value is not nil.
func (tu *TransactionUpdate) SetNillableAmount(f *float64) *TransactionUpdate {
	if f != nil {
		tu.SetAmount(*f)
	}
	return tu
}

// AddAmount adds f to the "amount" field.
func (tu *TransactionUpdate) AddAmount(f float64) *TransactionUpdate {
	tu.mutation.AddAmount(f)
	return tu
}

// SetIgnored sets the "ignored" field.
func (tu *TransactionUpdate) SetIgnored(b bool) *TransactionUpdate {
	tu.mutation.SetIgnored(b)
	return tu
}

// SetNillableIgnored sets the "ignored" field if the given value is not nil.
func (tu *TransactionUpdate) SetNillableIgnored(b *bool) *TransactionUpdate {
	if b != nil {
		tu.SetIgnored(*b)
	}
	return tu
}

// SetCategoryID sets the "category_id" field.
func (tu *TransactionUpdate) SetCategoryID(i int) *TransactionUpdate {
	tu.mutation.SetCategoryID(i)
	return tu
}

// SetNillableCategoryID sets the "category_id" field if the given value is not nil.
func (tu *TransactionUpdate) SetNillableCategoryID(i *int) *TransactionUpdate {
	if i != nil {
		tu.SetCategoryID(*i)
	}
	return tu
}

// ClearCategoryID clears the value of the "category_id" field.
func (tu *TransactionUpdate) ClearCategoryID() *TransactionUpdate {
	tu.mutation.ClearCategoryID()
	return tu
}

// SetReimbursedByID sets the "reimbursed_by_id" field.
func (tu *TransactionUpdate) SetReimbursedByID(i int) *TransactionUpdate {
	tu.mutation.SetReimbursedByID(i)
	return tu
}

// SetNillableReimbursedByID sets the "reimbursed_by_id" field if the given value is not nil.
func (tu *TransactionUpdate) SetNillableReimbursedByID(i *int) *TransactionUpdate {
	if i != nil {
		tu.SetReimbursedByID(*i)
	}
	return tu
}

// ClearReimbursedByID clears the value of the "reimbursed_by_id" field.
func (tu *TransactionUpdate) ClearReimbursedByID() *TransactionUpdate {
	tu.mutation.ClearReimbursedByID()
	return tu
}

// SetCategory sets the "category" edge to the Category entity.
func (tu *TransactionUpdate) SetCategory(c *Category) *TransactionUpdate {
	return tu.SetCategoryID(c.ID)
}

// SetReimbursedByTransactionID sets the "reimbursed_by_transaction" edge to the Transaction entity by ID.
func (tu *TransactionUpdate) SetReimbursedByTransactionID(id int) *TransactionUpdate {
	tu.mutation.SetReimbursedByTransactionID(id)
	return tu
}

// SetNillableReimbursedByTransactionID sets the "reimbursed_by_transaction" edge to the Transaction entity by ID if the given value is not nil.
func (tu *TransactionUpdate) SetNillableReimbursedByTransactionID(id *int) *TransactionUpdate {
	if id != nil {
		tu = tu.SetReimbursedByTransactionID(*id)
	}
	return tu
}

// SetReimbursedByTransaction sets the "reimbursed_by_transaction" edge to the Transaction entity.
func (tu *TransactionUpdate) SetReimbursedByTransaction(t *Transaction) *TransactionUpdate {
	return tu.SetReimbursedByTransactionID(t.ID)
}

// Mutation returns the TransactionMutation object of the builder.
func (tu *TransactionUpdate) Mutation() *TransactionMutation {
	return tu.mutation
}

// ClearCategory clears the "category" edge to the Category entity.
func (tu *TransactionUpdate) ClearCategory() *TransactionUpdate {
	tu.mutation.ClearCategory()
	return tu
}

// ClearReimbursedByTransaction clears the "reimbursed_by_transaction" edge to the Transaction entity.
func (tu *TransactionUpdate) ClearReimbursedByTransaction() *TransactionUpdate {
	tu.mutation.ClearReimbursedByTransaction()
	return tu
}

// Save executes the query and returns the number of nodes affected by the update operation.
func (tu *TransactionUpdate) Save(ctx context.Context) (int, error) {
	return withHooks(ctx, tu.sqlSave, tu.mutation, tu.hooks)
}

// SaveX is like Save, but panics if an error occurs.
func (tu *TransactionUpdate) SaveX(ctx context.Context) int {
	affected, err := tu.Save(ctx)
	if err != nil {
		panic(err)
	}
	return affected
}

// Exec executes the query.
func (tu *TransactionUpdate) Exec(ctx context.Context) error {
	_, err := tu.Save(ctx)
	return err
}

// ExecX is like Exec, but panics if an error occurs.
func (tu *TransactionUpdate) ExecX(ctx context.Context) {
	if err := tu.Exec(ctx); err != nil {
		panic(err)
	}
}

func (tu *TransactionUpdate) sqlSave(ctx context.Context) (n int, err error) {
	_spec := sqlgraph.NewUpdateSpec(transaction.Table, transaction.Columns, sqlgraph.NewFieldSpec(transaction.FieldID, field.TypeInt))
	if ps := tu.mutation.predicates; len(ps) > 0 {
		_spec.Predicate = func(selector *sql.Selector) {
			for i := range ps {
				ps[i](selector)
			}
		}
	}
	if value, ok := tu.mutation.Time(); ok {
		_spec.SetField(transaction.FieldTime, field.TypeInt64, value)
	}
	if value, ok := tu.mutation.AddedTime(); ok {
		_spec.AddField(transaction.FieldTime, field.TypeInt64, value)
	}
	if value, ok := tu.mutation.Description(); ok {
		_spec.SetField(transaction.FieldDescription, field.TypeString, value)
	}
	if value, ok := tu.mutation.Amount(); ok {
		_spec.SetField(transaction.FieldAmount, field.TypeFloat64, value)
	}
	if value, ok := tu.mutation.AddedAmount(); ok {
		_spec.AddField(transaction.FieldAmount, field.TypeFloat64, value)
	}
	if value, ok := tu.mutation.Ignored(); ok {
		_spec.SetField(transaction.FieldIgnored, field.TypeBool, value)
	}
	if tu.mutation.CategoryCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.M2O,
			Inverse: true,
			Table:   transaction.CategoryTable,
			Columns: []string{transaction.CategoryColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(category.FieldID, field.TypeInt),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := tu.mutation.CategoryIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.M2O,
			Inverse: true,
			Table:   transaction.CategoryTable,
			Columns: []string{transaction.CategoryColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(category.FieldID, field.TypeInt),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	if tu.mutation.ReimbursedByTransactionCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2O,
			Inverse: false,
			Table:   transaction.ReimbursedByTransactionTable,
			Columns: []string{transaction.ReimbursedByTransactionColumn},
			Bidi:    true,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(transaction.FieldID, field.TypeInt),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := tu.mutation.ReimbursedByTransactionIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2O,
			Inverse: false,
			Table:   transaction.ReimbursedByTransactionTable,
			Columns: []string{transaction.ReimbursedByTransactionColumn},
			Bidi:    true,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(transaction.FieldID, field.TypeInt),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	if n, err = sqlgraph.UpdateNodes(ctx, tu.driver, _spec); err != nil {
		if _, ok := err.(*sqlgraph.NotFoundError); ok {
			err = &NotFoundError{transaction.Label}
		} else if sqlgraph.IsConstraintError(err) {
			err = &ConstraintError{msg: err.Error(), wrap: err}
		}
		return 0, err
	}
	tu.mutation.done = true
	return n, nil
}

// TransactionUpdateOne is the builder for updating a single Transaction entity.
type TransactionUpdateOne struct {
	config
	fields   []string
	hooks    []Hook
	mutation *TransactionMutation
}

// SetTime sets the "time" field.
func (tuo *TransactionUpdateOne) SetTime(i int64) *TransactionUpdateOne {
	tuo.mutation.ResetTime()
	tuo.mutation.SetTime(i)
	return tuo
}

// SetNillableTime sets the "time" field if the given value is not nil.
func (tuo *TransactionUpdateOne) SetNillableTime(i *int64) *TransactionUpdateOne {
	if i != nil {
		tuo.SetTime(*i)
	}
	return tuo
}

// AddTime adds i to the "time" field.
func (tuo *TransactionUpdateOne) AddTime(i int64) *TransactionUpdateOne {
	tuo.mutation.AddTime(i)
	return tuo
}

// SetDescription sets the "description" field.
func (tuo *TransactionUpdateOne) SetDescription(s string) *TransactionUpdateOne {
	tuo.mutation.SetDescription(s)
	return tuo
}

// SetNillableDescription sets the "description" field if the given value is not nil.
func (tuo *TransactionUpdateOne) SetNillableDescription(s *string) *TransactionUpdateOne {
	if s != nil {
		tuo.SetDescription(*s)
	}
	return tuo
}

// SetAmount sets the "amount" field.
func (tuo *TransactionUpdateOne) SetAmount(f float64) *TransactionUpdateOne {
	tuo.mutation.ResetAmount()
	tuo.mutation.SetAmount(f)
	return tuo
}

// SetNillableAmount sets the "amount" field if the given value is not nil.
func (tuo *TransactionUpdateOne) SetNillableAmount(f *float64) *TransactionUpdateOne {
	if f != nil {
		tuo.SetAmount(*f)
	}
	return tuo
}

// AddAmount adds f to the "amount" field.
func (tuo *TransactionUpdateOne) AddAmount(f float64) *TransactionUpdateOne {
	tuo.mutation.AddAmount(f)
	return tuo
}

// SetIgnored sets the "ignored" field.
func (tuo *TransactionUpdateOne) SetIgnored(b bool) *TransactionUpdateOne {
	tuo.mutation.SetIgnored(b)
	return tuo
}

// SetNillableIgnored sets the "ignored" field if the given value is not nil.
func (tuo *TransactionUpdateOne) SetNillableIgnored(b *bool) *TransactionUpdateOne {
	if b != nil {
		tuo.SetIgnored(*b)
	}
	return tuo
}

// SetCategoryID sets the "category_id" field.
func (tuo *TransactionUpdateOne) SetCategoryID(i int) *TransactionUpdateOne {
	tuo.mutation.SetCategoryID(i)
	return tuo
}

// SetNillableCategoryID sets the "category_id" field if the given value is not nil.
func (tuo *TransactionUpdateOne) SetNillableCategoryID(i *int) *TransactionUpdateOne {
	if i != nil {
		tuo.SetCategoryID(*i)
	}
	return tuo
}

// ClearCategoryID clears the value of the "category_id" field.
func (tuo *TransactionUpdateOne) ClearCategoryID() *TransactionUpdateOne {
	tuo.mutation.ClearCategoryID()
	return tuo
}

// SetReimbursedByID sets the "reimbursed_by_id" field.
func (tuo *TransactionUpdateOne) SetReimbursedByID(i int) *TransactionUpdateOne {
	tuo.mutation.SetReimbursedByID(i)
	return tuo
}

// SetNillableReimbursedByID sets the "reimbursed_by_id" field if the given value is not nil.
func (tuo *TransactionUpdateOne) SetNillableReimbursedByID(i *int) *TransactionUpdateOne {
	if i != nil {
		tuo.SetReimbursedByID(*i)
	}
	return tuo
}

// ClearReimbursedByID clears the value of the "reimbursed_by_id" field.
func (tuo *TransactionUpdateOne) ClearReimbursedByID() *TransactionUpdateOne {
	tuo.mutation.ClearReimbursedByID()
	return tuo
}

// SetCategory sets the "category" edge to the Category entity.
func (tuo *TransactionUpdateOne) SetCategory(c *Category) *TransactionUpdateOne {
	return tuo.SetCategoryID(c.ID)
}

// SetReimbursedByTransactionID sets the "reimbursed_by_transaction" edge to the Transaction entity by ID.
func (tuo *TransactionUpdateOne) SetReimbursedByTransactionID(id int) *TransactionUpdateOne {
	tuo.mutation.SetReimbursedByTransactionID(id)
	return tuo
}

// SetNillableReimbursedByTransactionID sets the "reimbursed_by_transaction" edge to the Transaction entity by ID if the given value is not nil.
func (tuo *TransactionUpdateOne) SetNillableReimbursedByTransactionID(id *int) *TransactionUpdateOne {
	if id != nil {
		tuo = tuo.SetReimbursedByTransactionID(*id)
	}
	return tuo
}

// SetReimbursedByTransaction sets the "reimbursed_by_transaction" edge to the Transaction entity.
func (tuo *TransactionUpdateOne) SetReimbursedByTransaction(t *Transaction) *TransactionUpdateOne {
	return tuo.SetReimbursedByTransactionID(t.ID)
}

// Mutation returns the TransactionMutation object of the builder.
func (tuo *TransactionUpdateOne) Mutation() *TransactionMutation {
	return tuo.mutation
}

// ClearCategory clears the "category" edge to the Category entity.
func (tuo *TransactionUpdateOne) ClearCategory() *TransactionUpdateOne {
	tuo.mutation.ClearCategory()
	return tuo
}

// ClearReimbursedByTransaction clears the "reimbursed_by_transaction" edge to the Transaction entity.
func (tuo *TransactionUpdateOne) ClearReimbursedByTransaction() *TransactionUpdateOne {
	tuo.mutation.ClearReimbursedByTransaction()
	return tuo
}

// Where appends a list predicates to the TransactionUpdate builder.
func (tuo *TransactionUpdateOne) Where(ps ...predicate.Transaction) *TransactionUpdateOne {
	tuo.mutation.Where(ps...)
	return tuo
}

// Select allows selecting one or more fields (columns) of the returned entity.
// The default is selecting all fields defined in the entity schema.
func (tuo *TransactionUpdateOne) Select(field string, fields ...string) *TransactionUpdateOne {
	tuo.fields = append([]string{field}, fields...)
	return tuo
}

// Save executes the query and returns the updated Transaction entity.
func (tuo *TransactionUpdateOne) Save(ctx context.Context) (*Transaction, error) {
	return withHooks(ctx, tuo.sqlSave, tuo.mutation, tuo.hooks)
}

// SaveX is like Save, but panics if an error occurs.
func (tuo *TransactionUpdateOne) SaveX(ctx context.Context) *Transaction {
	node, err := tuo.Save(ctx)
	if err != nil {
		panic(err)
	}
	return node
}

// Exec executes the query on the entity.
func (tuo *TransactionUpdateOne) Exec(ctx context.Context) error {
	_, err := tuo.Save(ctx)
	return err
}

// ExecX is like Exec, but panics if an error occurs.
func (tuo *TransactionUpdateOne) ExecX(ctx context.Context) {
	if err := tuo.Exec(ctx); err != nil {
		panic(err)
	}
}

func (tuo *TransactionUpdateOne) sqlSave(ctx context.Context) (_node *Transaction, err error) {
	_spec := sqlgraph.NewUpdateSpec(transaction.Table, transaction.Columns, sqlgraph.NewFieldSpec(transaction.FieldID, field.TypeInt))
	id, ok := tuo.mutation.ID()
	if !ok {
		return nil, &ValidationError{Name: "id", err: errors.New(`ent: missing "Transaction.id" for update`)}
	}
	_spec.Node.ID.Value = id
	if fields := tuo.fields; len(fields) > 0 {
		_spec.Node.Columns = make([]string, 0, len(fields))
		_spec.Node.Columns = append(_spec.Node.Columns, transaction.FieldID)
		for _, f := range fields {
			if !transaction.ValidColumn(f) {
				return nil, &ValidationError{Name: f, err: fmt.Errorf("ent: invalid field %q for query", f)}
			}
			if f != transaction.FieldID {
				_spec.Node.Columns = append(_spec.Node.Columns, f)
			}
		}
	}
	if ps := tuo.mutation.predicates; len(ps) > 0 {
		_spec.Predicate = func(selector *sql.Selector) {
			for i := range ps {
				ps[i](selector)
			}
		}
	}
	if value, ok := tuo.mutation.Time(); ok {
		_spec.SetField(transaction.FieldTime, field.TypeInt64, value)
	}
	if value, ok := tuo.mutation.AddedTime(); ok {
		_spec.AddField(transaction.FieldTime, field.TypeInt64, value)
	}
	if value, ok := tuo.mutation.Description(); ok {
		_spec.SetField(transaction.FieldDescription, field.TypeString, value)
	}
	if value, ok := tuo.mutation.Amount(); ok {
		_spec.SetField(transaction.FieldAmount, field.TypeFloat64, value)
	}
	if value, ok := tuo.mutation.AddedAmount(); ok {
		_spec.AddField(transaction.FieldAmount, field.TypeFloat64, value)
	}
	if value, ok := tuo.mutation.Ignored(); ok {
		_spec.SetField(transaction.FieldIgnored, field.TypeBool, value)
	}
	if tuo.mutation.CategoryCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.M2O,
			Inverse: true,
			Table:   transaction.CategoryTable,
			Columns: []string{transaction.CategoryColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(category.FieldID, field.TypeInt),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := tuo.mutation.CategoryIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.M2O,
			Inverse: true,
			Table:   transaction.CategoryTable,
			Columns: []string{transaction.CategoryColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(category.FieldID, field.TypeInt),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	if tuo.mutation.ReimbursedByTransactionCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2O,
			Inverse: false,
			Table:   transaction.ReimbursedByTransactionTable,
			Columns: []string{transaction.ReimbursedByTransactionColumn},
			Bidi:    true,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(transaction.FieldID, field.TypeInt),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := tuo.mutation.ReimbursedByTransactionIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2O,
			Inverse: false,
			Table:   transaction.ReimbursedByTransactionTable,
			Columns: []string{transaction.ReimbursedByTransactionColumn},
			Bidi:    true,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(transaction.FieldID, field.TypeInt),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	_node = &Transaction{config: tuo.config}
	_spec.Assign = _node.assignValues
	_spec.ScanValues = _node.scanValues
	if err = sqlgraph.UpdateNode(ctx, tuo.driver, _spec); err != nil {
		if _, ok := err.(*sqlgraph.NotFoundError); ok {
			err = &NotFoundError{transaction.Label}
		} else if sqlgraph.IsConstraintError(err) {
			err = &ConstraintError{msg: err.Error(), wrap: err}
		}
		return nil, err
	}
	tuo.mutation.done = true
	return _node, nil
}
