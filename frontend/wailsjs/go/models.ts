export namespace db {
	
	export class Category {
	    name: string;
	    monthly: number;
	    weekly: number;
	    colour: string;
	
	    static createFrom(source: any = {}) {
	        return new Category(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.monthly = source["monthly"];
	        this.weekly = source["weekly"];
	        this.colour = source["colour"];
	    }
	}
	
	export class Transaction {
	    id: number;
	    date: string;
	    description: string;
	    amount: number;
	    category: string;
	    reimbursedBy?: number;
	
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
	        this.reimbursedBy = source["reimbursedBy"];
	    }
	}

}

