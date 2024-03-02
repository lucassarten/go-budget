export namespace db {
	
	export class Category {
	    name: string;
	    target: number;
	    colour: string;
	
	    static createFrom(source: any = {}) {
	        return new Category(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.target = source["target"];
	        this.colour = source["colour"];
	    }
	}
	
	export class Transaction {
	    id: number;
	    date: string;
	    description: string;
	    amount: number;
	    category: string;
	
	    static createFrom(source: any = {}) {
	        return new Transaction(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.date = source["date"];
	        this.description = source["description"];
	        this.amount = source["amount"];
	        this.category = source["category"];
	    }
	}

}

