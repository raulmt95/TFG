class UserObject{
    constructor(obj){
        this.email = obj.email;
        this.role = obj.role;
        this.id = obj._key;
    }

    getEmail(){
        return this.email;
    }

    getRole(){
        return this.role;
    }

    getID(){
        return this.id;
    }
}

export default UserObject;