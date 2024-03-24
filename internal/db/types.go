package db

type Category struct {
	Name    string  `json:"name"`
	Monthly float64 `json:"monthly"`
	Weekly  float64 `json:"weekly"`
	Colour  string  `json:"colour"`
}

type Transaction struct {
	ID           int     `json:"id"`
	Date         string  `json:"date"`
	Description  string  `json:"description"`
	Amount       float64 `json:"amount"`
	Category     string  `json:"category"`
	ReimbursedBy *int    `json:"reimbursedBy"`
}
