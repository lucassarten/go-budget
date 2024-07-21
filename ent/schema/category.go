package schema

import (
	"regexp"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Category holds the schema definition for the Category entity.
type Category struct {
	ent.Schema
}

// Fields of the Category.
func (Category) Fields() []ent.Field {
	return []ent.Field{
		field.Int("id").Unique(),
		field.String("name"),
		field.Float("monthly").Default(0.0),
		field.Float("weekly").Default(0.0),
		field.String("colour"),
		field.String("type").Match(regexp.MustCompile("Expense|Income")).Default("expense"),
	}
}

// Edges of the Category.
func (Category) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("transactions", Transaction.Type),
	}
}
