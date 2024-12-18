package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Transaction holds the schema definition for the Transaction entity.
type Transaction struct {
	ent.Schema
}

// Fields of the Transaction.
func (Transaction) Fields() []ent.Field {
	return []ent.Field{
		field.Int("id").Unique(),
		field.Int64("time"),
		field.String("description"),
		field.Float("amount").Default(0.0),
		field.Bool("ignored").Default(false),
		field.Int("category_id").Optional().Nillable(),
		field.Int("reimbursed_by_id").Optional().Nillable(),
	}
}

// Edges of the Transaction.
func (Transaction) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("category", Category.Type).Ref("transactions").Unique().Field("category_id"),
		edge.To("reimbursed_by_transaction", Transaction.Type).Unique().Field("reimbursed_by_id"),
	}
}
