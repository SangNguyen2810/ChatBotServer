let DBconfigs = {
    clouddb: {
        dbName : "ChatBot",
        dbUsername : "dbAdmin",
        dbPassword : "0BUsLLD9izn4oNTy",
        get dbUrl() {
            const url = "mongodb+srv://"+ this.dbUsername + ":" +
                this.dbPassword +"@server.hrtw8.mongodb.net/" +
                this.dbName +"?retryWrites=true&w=majority"
            return url;
            },
        //Connect Mongo pass
        dbUrltest: "mongodb+srv://dbAdmin:0BUsLLD9izn4oNTy@server.hrtw8.mongodb.net/test"
    }

};

export default DBconfigs.clouddb;