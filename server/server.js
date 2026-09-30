import 'dotenv/config';
import app from './src/app.js';
import { connectDatabase } from './src/config/database.js';
const port=process.env.PORT||3001;
connectDatabase().then(()=>app.listen(port,()=>console.log(`KSM API listening on http://localhost:${port}`))).catch(error=>{console.error('Database connection failed:',error.message);process.exit(1)});
