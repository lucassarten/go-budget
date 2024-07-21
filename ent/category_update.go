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

// CategoryUpdate is the builder for updating Category entities.
type CategoryUpdate struct {
	config
	hooks    []Hook
	mutation *CategoryMutation
}

// Where appends a list predicates to the CategoryUpdate builder.
func (cu *CategoryUpdate) Where(ps ...predicate.Category) *CategoryUpdate {
	cu.mutation.Where(ps...)
	return cu
}

// SetName sets the "name" field.
func (cu *CategoryUpdate) SetName(s string) *CategoryUpdate {
	cu.mutation.SetName(s)
	return cu
}

// SetNillableName sets the "name" field if the given value is not nil.
func (cu *CategoryUpdate) SetNillableName(s *string) *CategoryUpdate {
	if s != nil {
		cu.SetName(*s)
	}
	return cu
}

// SetMonthly sets the "monthly" field.
func (cu *CategoryUpdate) SetMonthly(f float64) *CategoryUpdate {
	cu.mutation.ResetMonthly()
	cu.mutation.SetMonthly(f)
	return cu
}

// SetNillableMonthly sets the "monthly" field if the given value is not nil.
func (cu *CategoryUpdate) SetNillableMonthly(f *float64) *CategoryUpdate {
	if f != nil {
		cu.SetMonthly(*f)
	}
	return cu
}

// AddMonthly adds f to the "monthly" field.
func (cu *CategoryUpdate) AddMonthly(f float64) *CategoryUpdate {
	cu.mutation.AddMonthly(f)
	return cu
}

// SetWeekly sets the "weekly" field.
func (cu *CategoryUpdate) SetWeekly(f float64) *CategoryUpdate {
	cu.mutation.ResetWeekly()
	cu.mutation.SetWeekly(f)
	return cu
}

// SetNillableWeekly sets the "weekly" field if the given value is not nil.
func (cu *CategoryUpdate) SetNillableWeekly(f *float64) *CategoryUpdate {
	if f != nil {
		cu.SetWeekly(*f)
	}
	return cu
}

// AddWeekly adds f to the "weekly" field.
func (cu *CategoryUpdate) AddWeekly(f float64) *CategoryUpdate {
	cu.mutation.AddWeekly(f)
	return cu
}

// SetColour sets the "colour" field.
func (cu *CategoryUpdate) SetColour(s string) *CategoryUpdate {
	cu.mutation.SetColour(s)
	return cu
}

// SetNillableColour sets the "colour" field if the given value is not nil.
func (cu *CategoryUpdate) SetNillableColour(s *string) *CategoryUpdate {
	if s != nil {
		cu.SetColour(*s)
	}
	return cu
}

// SetType sets the "type" field.
func (cu *CategoryUpdate) SetType(s string) *CategoryUpdate {
	cu.mutation.SetType(s)
	return cu
}

// SetNillableType sets the "type" field if the given value is not nil.
func (cu *CategoryUpdate) SetNillableType(s *string) *CategoryUpdate {
	if s != nil {
		cu.SetType(*s)
	}
	return cu
}

// AddTransactionIDs adds the "transactions" edge to the Transaction entity by IDs.
func (cu *CategoryUpdate) AddTransactionIDs(ids ...int) *CategoryUpdate {
	cu.mutation.AddTransactionIDs(ids...)
	return cu
}

// AddTransactions adds the "transactions" edges to the Transaction entity.
func (cu *CategoryUpdate) AddTransactions(t ...*Transaction) *CategoryUpdate {
	ids := make([]int, len(t))
	for i := range t {
		ids[i] = t[i].ID
	}
	return cu.AddTransactionIDs(ids...)
}

// Mutation returns the CategoryMutation object of the builder.
func (cu *CategoryUpdate) Mutation() *CategoryMutation {
	return cu.mutation
}

// ClearTransactions clears all "transactions" edges to the Transaction entity.
func (cu *CategoryUpdate) ClearTransactions() *CategoryUpdate {
	cu.mutation.ClearTransactions()
	return cu
}

// RemoveTransactionIDs removes the "transactions" edge to Transaction entities by IDs.
func (cu *CategoryUpdate) RemoveTransactionIDs(ids ...int) *CategoryUpdate {
	cu.mutation.RemoveTransactionIDs(ids...)
	return cu
}

// RemoveTransactions removes "transactions" edges to Transaction entities.
func (cu *CategoryUpdate) RemoveTransactions(t ...*Transaction) *CategoryUpdate {
	ids := make([]int, len(t))
	for i := range t {
		ids[i] = t[i].ID
	}
	return cu.RemoveTransactionIDs(ids...)
}

// Save executes the query and returns the number of nodes affected by the update operation.
func (cu *CategoryUpdate) Save(ctx context.Context) (int, error) {
	return withHooks(ctx, cu.sqlSave, cu.mutation, cu.hooks)
}

// SaveX is like Save, but panics if an error occurs.
func (cu *CategoryUpdate) SaveX(ctx context.Context) int {
	affected, err := cu.Save(ctx)
	if err != nil {
		panic(err)
	}
	return affected
}

// Exec executes the query.
func (cu *CategoryUpdate) Exec(ctx context.Context) error {
	_, err := cu.Save(ctx)
	return err
}

// ExecX is like Exec, but panics if an error occurs.
func (cu *CategoryUpdate) ExecX(ctx context.Context) {
	if err := cu.Exec(ctx); err != nil {
		panic(err)
	}
}

// check runs all checks and user-defined validators on the builder.
func (cu *CategoryUpdate) check() error {
	if v, ok := cu.mutation.GetType(); ok {
		if err := category.TypeValidator(v); err != nil {
			return &ValidationError{Name: "type", err: fmt.Errorf(`ent: validator failed for field "Category.type": %w`, err)}
		}
	}
	return nil
}

func (cu *CategoryUpdate) sqlSave(ctx context.Context) (n int, err error) {
	if err := cu.check(); err != nil {
		return n, err
	}
	_spec := sqlgraph.NewUpdateSpec(category.Table, category.Columns, sqlgraph.NewFieldSpec(category.FieldID, field.TypeInt))
	if ps := cu.mutation.predicates; len(ps) > 0 {
		_spec.Predicate = func(selector *sql.Selector) {
			for i := range ps {
				ps[i](selector)
			}
		}
	}
	if value, ok := cu.mutation.Name(); ok {
		_spec.SetField(category.FieldName, field.TypeString, value)
	}
	if value, ok := cu.mutation.Monthly(); ok {
		_spec.SetField(category.FieldMonthly, field.TypeFloat64, value)
	}
	if value, ok := cu.mutation.AddedMonthly(); ok {
		_spec.AddField(category.FieldMonthly, field.TypeFloat64, value)
	}
	if value, ok := cu.mutation.Weekly(); ok {
		_spec.SetField(category.FieldWeekly, field.TypeFloat64, value)
	}
	if value, ok := cu.mutation.AddedWeekly(); ok {
		_spec.AddField(category.FieldWeekly, field.TypeFloat64, value)
	}
	if value, ok := cu.mutation.Colour(); ok {
		_spec.SetField(category.FieldColour, field.TypeString, value)
	}
	if value, ok := cu.mutation.GetType(); ok {
		_spec.SetField(category.FieldType, field.TypeString, value)
	}
	if cu.mutation.TransactionsCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   category.TransactionsTable,
			Columns: []string{category.TransactionsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(transaction.FieldID, field.TypeInt),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := cu.mutation.RemovedTransactionsIDs(); len(nodes) > 0 && !cu.mutation.TransactionsCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   category.TransactionsTable,
			Columns: []string{category.TransactionsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(transaction.FieldID, field.TypeInt),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := cu.mutation.TransactionsIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   category.TransactionsTable,
			Columns: []string{category.TransactionsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(transaction.FieldID, field.TypeInt),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	if n, err = sqlgraph.UpdateNodes(ctx, cu.driver, _spec); err != nil {
		if _, ok := err.(*sqlgraph.NotFoundError); ok {
			err = &NotFoundError{category.Label}
		} else if sqlgraph.IsConstraintError(err) {
			err = &ConstraintError{msg: err.Error(), wrap: err}
		}
		return 0, err
	}
	cu.mutation.done = true
	return n, nil
}

// CategoryUpdateOne is the builder for updating a single Category entity.
type CategoryUpdateOne struct {
	config
	fields   []string
	hooks    []Hook
	mutation *CategoryMutation
}

// SetName sets the "name" field.
func (cuo *CategoryUpdateOne) SetName(s string) *CategoryUpdateOne {
	cuo.mutation.SetName(s)
	return cuo
}

// SetNillableName sets the "name" field if the given value is not nil.
func (cuo *CategoryUpdateOne) SetNillableName(s *string) *CategoryUpdateOne {
	if s != nil {
		cuo.SetName(*s)
	}
	return cuo
}

// SetMonthly sets the "monthly" field.
func (cuo *CategoryUpdateOne) SetMonthly(f float64) *CategoryUpdateOne {
	cuo.mutation.ResetMonthly()
	cuo.mutation.SetMonthly(f)
	return cuo
}

// SetNillableMonthly sets the "monthly" field if the given value is not nil.
func (cuo *CategoryUpdateOne) SetNillableMonthly(f *float64) *CategoryUpdateOne {
	if f != nil {
		cuo.SetMonthly(*f)
	}
	return cuo
}

// AddMonthly adds f to the "monthly" field.
func (cuo *CategoryUpdateOne) AddMonthly(f float64) *CategoryUpdateOne {
	cuo.mutation.AddMonthly(f)
	return cuo
}

// SetWeekly sets the "weekly" field.
func (cuo *CategoryUpdateOne) SetWeekly(f float64) *CategoryUpdateOne {
	cuo.mutation.ResetWeekly()
	cuo.mutation.SetWeekly(f)
	return cuo
}

// SetNillableWeekly sets the "weekly" field if the given value is not nil.
func (cuo *CategoryUpdateOne) SetNillableWeekly(f *float64) *CategoryUpdateOne {
	if f != nil {
		cuo.SetWeekly(*f)
	}
	return cuo
}

// AddWeekly adds f to the "weekly" field.
func (cuo *CategoryUpdateOne) AddWeekly(f float64) *CategoryUpdateOne {
	cuo.mutation.AddWeekly(f)
	return cuo
}

// SetColour sets the "colour" field.
func (cuo *CategoryUpdateOne) SetColour(s string) *CategoryUpdateOne {
	cuo.mutation.SetColour(s)
	return cuo
}

// SetNillableColour sets the "colour" field if the given value is not nil.
func (cuo *CategoryUpdateOne) SetNillableColour(s *string) *CategoryUpdateOne {
	if s != nil {
		cuo.SetColour(*s)
	}
	return cuo
}

// SetType sets the "type" field.
func (cuo *CategoryUpdateOne) SetType(s string) *CategoryUpdateOne {
	cuo.mutation.SetType(s)
	return cuo
}

// SetNillableType sets the "type" field if the given value is not nil.
func (cuo *CategoryUpdateOne) SetNillableType(s *string) *CategoryUpdateOne {
	if s != nil {
		cuo.SetType(*s)
	}
	return cuo
}

// AddTransactionIDs adds the "transactions" edge to the Transaction entity by IDs.
func (cuo *CategoryUpdateOne) AddTransactionIDs(ids ...int) *CategoryUpdateOne {
	cuo.mutation.AddTransactionIDs(ids...)
	return cuo
}

// AddTransactions adds the "transactions" edges to the Transaction entity.
func (cuo *CategoryUpdateOne) AddTransactions(t ...*Transaction) *CategoryUpdateOne {
	ids := make([]int, len(t))
	for i := range t {
		ids[i] = t[i].ID
	}
	return cuo.AddTransactionIDs(ids...)
}

// Mutation returns the CategoryMutation object of the builder.
func (cuo *CategoryUpdateOne) Mutation() *CategoryMutation {
	return cuo.mutation
}

// ClearTransactions clears all "transactions" edges to the Transaction entity.
func (cuo *CategoryUpdateOne) ClearTransactions() *CategoryUpdateOne {
	cuo.mutation.ClearTransactions()
	return cuo
}

// RemoveTransactionIDs removes the "transactions" edge to Transaction entities by IDs.
func (cuo *CategoryUpdateOne) RemoveTransactionIDs(ids ...int) *CategoryUpdateOne {
	cuo.mutation.RemoveTransactionIDs(ids...)
	return cuo
}

// RemoveTransactions removes "transactions" edges to Transaction entities.
func (cuo *CategoryUpdateOne) RemoveTransactions(t ...*Transaction) *CategoryUpdateOne {
	ids := make([]int, len(t))
	for i := range t {
		ids[i] = t[i].ID
	}
	return cuo.RemoveTransactionIDs(ids...)
}

// Where appends a list predicates to the CategoryUpdate builder.
func (cuo *CategoryUpdateOne) Where(ps ...predicate.Category) *CategoryUpdateOne {
	cuo.mutation.Where(ps...)
	return cuo
}

// Select allows selecting one or more fields (columns) of the returned entity.
// The default is selecting all fields defined in the entity schema.
func (cuo *CategoryUpdateOne) Select(field string, fields ...string) *CategoryUpdateOne {
	cuo.fields = append([]string{field}, fields...)
	return cuo
}

// Save executes the query and returns the updated Category entity.
func (cuo *CategoryUpdateOne) Save(ctx context.Context) (*Category, error) {
	return withHooks(ctx, cuo.sqlSave, cuo.mutation, cuo.hooks)
}

// SaveX is like Save, but panics if an error occurs.
func (cuo *CategoryUpdateOne) SaveX(ctx context.Context) *Category {
	node, err := cuo.Save(ctx)
	if err != nil {
		panic(err)
	}
	return node
}

// Exec executes the query on the entity.
func (cuo *CategoryUpdateOne) Exec(ctx context.Context) error {
	_, err := cuo.Save(ctx)
	return err
}

// ExecX is like Exec, but panics if an error occurs.
func (cuo *CategoryUpdateOne) ExecX(ctx context.Context) {
	if err := cuo.Exec(ctx); err != nil {
		panic(err)
	}
}

// check runs all checks and user-defined validators on the builder.
func (cuo *CategoryUpdateOne) check() error {
	if v, ok := cuo.mutation.GetType(); ok {
		if err := category.TypeValidator(v); err != nil {
			return &ValidationError{Name: "type", err: fmt.Errorf(`ent: validator failed for field "Category.type": %w`, err)}
		}
	}
	return nil
}

func (cuo *CategoryUpdateOne) sqlSave(ctx context.Context) (_node *Category, err error) {
	if err := cuo.check(); err != nil {
		return _node, err
	}
	_spec := sqlgraph.NewUpdateSpec(category.Table, category.Columns, sqlgraph.NewFieldSpec(category.FieldID, field.TypeInt))
	id, ok := cuo.mutation.ID()
	if !ok {
		return nil, &ValidationError{Name: "id", err: errors.New(`ent: missing "Category.id" for update`)}
	}
	_spec.Node.ID.Value = id
	if fields := cuo.fields; len(fields) > 0 {
		_spec.Node.Columns = make([]string, 0, len(fields))
		_spec.Node.Columns = append(_spec.Node.Columns, category.FieldID)
		for _, f := range fields {
			if !category.ValidColumn(f) {
				return nil, &ValidationError{Name: f, err: fmt.Errorf("ent: invalid field %q for query", f)}
			}
			if f != category.FieldID {
				_spec.Node.Columns = append(_spec.Node.Columns, f)
			}
		}
	}
	if ps := cuo.mutation.predicates; len(ps) > 0 {
		_spec.Predicate = func(selector *sql.Selector) {
			for i := range ps {
				ps[i](selector)
			}
		}
	}
	if value, ok := cuo.mutation.Name(); ok {
		_spec.SetField(category.FieldName, field.TypeString, value)
	}
	if value, ok := cuo.mutation.Monthly(); ok {
		_spec.SetField(category.FieldMonthly, field.TypeFloat64, value)
	}
	if value, ok := cuo.mutation.AddedMonthly(); ok {
		_spec.AddField(category.FieldMonthly, field.TypeFloat64, value)
	}
	if value, ok := cuo.mutation.Weekly(); ok {
		_spec.SetField(category.FieldWeekly, field.TypeFloat64, value)
	}
	if value, ok := cuo.mutation.AddedWeekly(); ok {
		_spec.AddField(category.FieldWeekly, field.TypeFloat64, value)
	}
	if value, ok := cuo.mutation.Colour(); ok {
		_spec.SetField(category.FieldColour, field.TypeString, value)
	}
	if value, ok := cuo.mutation.GetType(); ok {
		_spec.SetField(category.FieldType, field.TypeString, value)
	}
	if cuo.mutation.TransactionsCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   category.TransactionsTable,
			Columns: []string{category.TransactionsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(transaction.FieldID, field.TypeInt),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := cuo.mutation.RemovedTransactionsIDs(); len(nodes) > 0 && !cuo.mutation.TransactionsCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   category.TransactionsTable,
			Columns: []string{category.TransactionsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(transaction.FieldID, field.TypeInt),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := cuo.mutation.TransactionsIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   category.TransactionsTable,
			Columns: []string{category.TransactionsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(transaction.FieldID, field.TypeInt),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	_node = &Category{config: cuo.config}
	_spec.Assign = _node.assignValues
	_spec.ScanValues = _node.scanValues
	if err = sqlgraph.UpdateNode(ctx, cuo.driver, _spec); err != nil {
		if _, ok := err.(*sqlgraph.NotFoundError); ok {
			err = &NotFoundError{category.Label}
		} else if sqlgraph.IsConstraintError(err) {
			err = &ConstraintError{msg: err.Error(), wrap: err}
		}
		return nil, err
	}
	cuo.mutation.done = true
	return _node, nil
}
