class QueryObject{
    constructor(obj){
        this.firstParameter = obj.firstParameter;
        this.secondParameter = obj.secondParameter;
        this.type = obj.type;
        this.userID = obj.userID;
        this.id = obj._key;
    }

    getFirstParameter(){
        return this.firstParameter;
    }

    getSecondParameter(){
        return this.secondParameter;
    }

    getType(){
        return this.type;
    }

    getUserID(){
        return this.userID;
    }

    getID(){
        return this.id;
    }
}

export default QueryObject;