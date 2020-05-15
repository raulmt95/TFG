class PersonObject{
    constructor(obj){
        this.name = obj.name;
        this.surname = obj.surname;
        this.birthdate = obj.birthdate;
        this.estimatedDate = obj.estimatedDate;
        this.gender = obj.gender;
        this.createdBy = obj.createdBy;
        this.id = obj._key;
        this.relations = [];
    }

    setRelations(rel){
        this.relations = rel;
    }

    getName(){
        return this.name;
    }

    getSurname(){
        return this.surname;
    }

    getBirthdate(){
        return this.birthdate;
    }

    getEstimatedDate(){
        return this.estimatedDate;
    }

    getGender(){
        return this.gender;
    }

    getCreatedBy(){
        return this.createdBy;
    }

    getRelations(){
        return this.relations;
    }

    getID(){
        return this.id;
    }

    getInfo(){
        return `Nombre: ${this.name} ${this.surname} / Género: ${this.gender} / ID: ${this.id}`;
    }

    getFullName(){
        return this.name + " " + this.surname;
    }

    getFormattedBirthdate(){
        const dtf = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' });
        const [{ value: day },,{ value: month },,{ value: year }] = dtf.formatToParts(this.birthdate);

        return `${day} de ${month} de ${year}`;
    }

    getEstimatedBirthYear(){
        const dtf = new Intl.DateTimeFormat('es', { year: 'numeric' });
        const [{ value: year }] = dtf.formatToParts(this.birthdate);

        return `circa ${year}`;
    }

    deleteRelation(relation){
        let index = this.relations.indexOf(relation);
        this.relations.splice(index, 1);
    }

    addRelation(relation){
        this.relations.push(relation);
    }

    getParents(){
        let parentList = [];
        this.relations.forEach(relation => {
            if (relation.getType() === "childOf"){
                parentList.push(relation.getTo());
            }
        });

        return parentList;
    }

    getChildren(){
        let childList = [];
        this.relations.forEach(relation => {
            if (relation.getType() === "parentOf"){
                childList.push(relation.getTo());
            }
        });

        return childList;
    }

    getSiblings(){
        let siblingList = [];

        this.getParents().forEach(function(parent){
            parent.getChildren().forEach(function(child){
                if (child.getID() !== this.id && !siblingList.includes(child)){
                    siblingList.push(child);
                }
            }, this);
        }, this);

        return siblingList;
    }
}

export default PersonObject;