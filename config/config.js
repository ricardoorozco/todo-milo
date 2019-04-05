/** TOKEN */
process.env.secrect = 'the-secrect-word';
process.env.expiresIn = '24h';

/** ACCESS DATA ACCORDING TO THE ENVIRONMENT */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

if (process.env.NODE_ENV == 'prod') {
    console.log("RUN APP IN PROD MODE");
    process.env.PORT = process.env.PORT || 3000;
    process.env.dbhost = 'ip';
    process.env.dbport = '27017';
    process.env.dbuser = 'user';
    process.env.dbpasswd = 'passwd';
    process.env.dbdatabase = 'tt_milo';
} else {
    console.log("RUN APP IN DEV MODE");
    process.env.PORT = process.env.PORT || 29000;
    process.env.dbhost = 'localhost';
    process.env.dbport = '27017';
    process.env.dbuser = '';
    process.env.dbpasswd = '';
    process.env.dbdatabase = 'tt_milo';
}