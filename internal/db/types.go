package db

type Category struct {
	Name   string `json:"name"`
	Target int    `json:"target"`
	Colour string `json:"colour"`
}

type Transaction struct {
	ID          int    `json:"id"`
	Date        string `json:"date"`
	Description string `json:"description"`
	Amount      int    `json:"amount"`
	Category    string `json:"category"`
}