package db

type Category struct {
	ID      int     `json:"id"`
	Name    string  `json:"name"`
	Monthly float64 `json:"monthly"`
	Weekly  float64 `json:"weekly"`
	Colour  string  `json:"colour"`
}

type Transaction struct {
	ID           int     `json:"id"`
	Time         int64   `json:"time"`
	Description  string  `json:"description"`
	Amount       float64 `json:"amount"`
	CategoryID   int     `json:"category_id"`
	ReimbursedBy *int    `json:"reimbursed_by_id"`
}
