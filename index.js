import { app } from './app.js'
import { configDotenv } from 'dotenv';
import { connect_db } from './src/db/index.js';

connect_db()
    .then(() => {
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`App is listening on port ${port}`);
        })
    })
    .catch((err) => {
        console.log(err);
    })
