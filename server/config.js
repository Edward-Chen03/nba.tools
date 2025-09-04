const { mongoose } = require('mongoose')
const { MongoClient, ServerApiVersion, GridFSBucket } = require('mongodb');
const uri = process.env.NBAMONGO;

let gfsBucket;
let playerIconsDb;

const connectDB = async () => {
    await mongoose.connect(uri)
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
        console.log("DB connected!");

    });
}

const connectGridFS = async () => {

    const playerIconsClient = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverApi: ServerApiVersion.v1,
    });

    await playerIconsClient.connect()
        .then(() => {
            playerIconsDb = playerIconsClient.db('playericons');
            gfsBucket = new GridFSBucket(playerIconsDb, { bucketName: 'images' });
            console.log('Connected to playericons DB and GridFSBucket');
        })
        .catch(err => {
            console.error('Error connecting to playericons DB:', err);
        });

}


module.exports = { connectDB, connectGridFS, getGfsBucket: () => gfsBucket,getPlayerIconsDb: () => playerIconsDb}