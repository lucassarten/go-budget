// Code generated by ent, DO NOT EDIT.

package ent

import (
	"go-budget/ent/category"
	"go-budget/ent/schema"
	"go-budget/ent/transaction"
)

// The init function reads all schema descriptors with runtime code
// (default values, validators, hooks and policies) and stitches it
// to their package variables.
func init() {
	categoryFields := schema.Category{}.Fields()
	_ = categoryFields
	// categoryDescMonthly is the schema descriptor for monthly field.
	categoryDescMonthly := categoryFields[2].Descriptor()
	// category.DefaultMonthly holds the default value on creation for the monthly field.
	category.DefaultMonthly = categoryDescMonthly.Default.(float64)
	// categoryDescWeekly is the schema descriptor for weekly field.
	categoryDescWeekly := categoryFields[3].Descriptor()
	// category.DefaultWeekly holds the default value on creation for the weekly field.
	category.DefaultWeekly = categoryDescWeekly.Default.(float64)
	// categoryDescType is the schema descriptor for type field.
	categoryDescType := categoryFields[5].Descriptor()
	// category.DefaultType holds the default value on creation for the type field.
	category.DefaultType = categoryDescType.Default.(string)
	// category.TypeValidator is a validator for the "type" field. It is called by the builders before save.
	category.TypeValidator = categoryDescType.Validators[0].(func(string) error)
	transactionFields := schema.Transaction{}.Fields()
	_ = transactionFields
	// transactionDescAmount is the schema descriptor for amount field.
	transactionDescAmount := transactionFields[3].Descriptor()
	// transaction.DefaultAmount holds the default value on creation for the amount field.
	transaction.DefaultAmount = transactionDescAmount.Default.(float64)
}
