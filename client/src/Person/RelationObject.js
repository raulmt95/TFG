class RelationObject{
    constructor(obj){
        this.from = obj.from;
        this.to = obj.to;
        this.type = obj.type;
        this.id = obj._key;
    }

    getFrom(){
        return this.from;
    }

    getTo(){
        return this.to;
    }

    getType(){
        return this.type;
    }

    getID(){
        return this.id;
    }

    getRelation(){
        switch (this.type){
            case "parentOf":
                switch (this.from.getGender()){
                    case "male":
                        return `${this.from.getFullName()} es PADRE de ${this.to.getFullName()}`;
                    case "female":
                        return `${this.from.getFullName()} es MADRE de ${this.to.getFullName()}`;
                    default:
                        return `${this.from.getFullName()} es PADRE/MADRE de ${this.to.getFullName()}`;
                }
            case "childOf":
                switch (this.from.getGender()){
                    case "male":
                        return `${this.from.getFullName()} es HIJO de ${this.to.getFullName()}`;
                    case "female":
                        return `${this.from.getFullName()} es HIJA de ${this.to.getFullName()}`;
                    default:
                        return `${this.from.getFullName()} es HIJO/HIJA de ${this.to.getFullName()}`;
                }
            case "partnerOf":
                return `${this.from.getFullName()} es PAREJA de ${this.to.getFullName()}`;
            default:
                return "";
        }
    }
}

export default RelationObject;