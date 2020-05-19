Database = require('arangojs').Database;
db = new Database('http://127.0.0.1:8529');

const bcrypt = require('bcryptjs');

module.exports = {
    getUserData : async function(){
        const cursor = await db.query(`
            FOR x IN users FILTER x.visible == true SORT x.email RETURN {
                "email": x.email,
                "role": x.role,
                "_key": x._key
            }
        `);
        try{
            const data = await cursor.all();

            return data;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    getUserByEmail : async function(email){
        const cursor = await db.query(`
            FOR x IN users FILTER x.email == "${email}" RETURN {
                "email": x.email,
                "role": x.role,
                "_key": x._key
            }
        `);
        try{
            const key = await cursor.all();

            return key;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    getUserQueryData : async function(userID){
        const cursor = await db.query(`FOR x IN queryList FILTER x.userID == "${userID}" SORT x.date DESC RETURN x`);
        try{
            const key = await cursor.all();

            return key;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    findRememberedUser : async function(loginString, email){
        const cursor = await db.query(`FOR x IN users FILTER x.email == "${email}" RETURN x.loginString`);
        try{
            const hash = await cursor.all();

            const isCorrect = await bcrypt.compare(loginString, hash[0]);

            if (isCorrect){
                const cursor = await db.query(`
                FOR x IN users FILTER x.email == "${email}" RETURN {
                    "email": x.email,
                    "role": x.role,
                    "_key": x._key
                }
                `);
                try{
                    const user = await cursor.all();

                    return user;
                } catch (err) {
                    console.error("Error: " + err);
                }
            }
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    checkPassword : async function(email, password){
        const cursor = await db.query(`FOR x IN users FILTER x.email == "${email}" RETURN x.password`);
        try{
            const hash = await cursor.all();

            const isCorrect = await bcrypt.compare(password, hash[0]);

            return isCorrect;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    setLoginString : async function(key, loginString){
        const cursor = await db.query(`
            LET user = DOCUMENT("users/${key}")
            UPDATE user WITH
                {"loginString": "${loginString}"}
            IN users RETURN NEW.loginString
        `);
        try{
            const data = await cursor.all();

            return data;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    addUser : async function(email, hash){
        const cursor = await db.query(`
            INSERT {
                "email": "${email}",
                "role": "regular",
                "password": "${hash}",
                "loginString": "",
                "visible": true
            } INTO users RETURN NEW._key
        `);
        try{
            const key = await cursor.all();
            return key;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    setRole : async function(key, role){
        const cursor = await db.query(`
            LET user = DOCUMENT("users/${key}")
            UPDATE user WITH
                {"role": "${role}"}
            IN users RETURN {
                "email": NEW.email,
                "role": NEW.role,
                "_key": NEW._key
            }
        `);
        try{
            const data = await cursor.all();

            return data;
        } catch (err) {
            console.error("Error: " + err);
        }
    },

    addToQueryList : async function(type, firstParameter, secondParameter, userID, date){
        const cursor = await db.query(`
            INSERT {
                "type": "${type}",
                "firstParameter": "${firstParameter}",
                "secondParameter": "${secondParameter}",
                "userID": "${userID}",
                "date": ${date}
            } INTO queryList RETURN NEW
        `);
        try{
            const key = await cursor.all();
            return key;
        } catch (err) {
            console.error("Error: " + err);
        }
    },
}