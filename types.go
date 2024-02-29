package main

type Category struct {
	Name   string `json:"name"`
	Target int    `json:"target"`
	Colour string `json:"colour"`
}

type Count struct {
	Count int `json:"count"`
}