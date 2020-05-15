class FileObject{
    constructor(obj){
        this.date = obj.date;
        this.description = obj.description;
        this.filename = obj.filename;
        this.title = obj.title;
        this.type = obj.type;
        this.id = obj._key;
        this.relations = [];
        this.uploadedBy = obj.uploadedBy;
    }

    setRelations(rel){
        this.relations = rel;
    }

    getDate(){
        return this.date;
    }

    getDescription(){
        return this.description;
    }

    getFilename(){
        return this.filename;
    }

    getTitle(){
        return this.title;
    }

    getType(){
        return this.type;
    }

    getRelations(){
        return this.relations;
    }

    getUploadedBy(){
        return this.uploadedBy;
    }

    getID(){
        return this.id;
    }

    getInfo(){
        return `Título: ${this.title} / Tipo: ${this.type} / Descripción: ${this.description} / ID: ${this.id}`;
    }

    getFormattedDate(){
        const dtf = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' });
        const [{ value: day },,{ value: month },,{ value: year }] = dtf.formatToParts(this.date);

        return `${day} de ${month} de ${year}`;
    }

    deleteRelation(relation){
        let index = this.relations.indexOf(relation);
        this.relations.splice(index, 1);
    }

    addRelation(relation){
        this.relations.push(relation);
    }
}

export default FileObject;