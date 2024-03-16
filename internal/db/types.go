package db

type Category struct {
	Name   string  `json:"name"`
	Target float64 `json:"target"`
	Colour string  `json:"colour"`
}

type Transaction struct {
	ID           int     `json:"id"`
	Date         string  `json:"date"`
	Description  string  `json:"description"`
	Amount       float64 `json:"amount"`
	Category     string  `json:"category"`
	ReimbursedBy *int    `json:"reimbursedBy"`
}
