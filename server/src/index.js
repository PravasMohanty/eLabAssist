import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import BillRouter from "./routes/bill.routes.js";
import supabase from './config/db.js';

dotenv.config();

const app = express();

app.get('/test-db', async (req, res) => {
    try {
        // Simple query to fetch doctors from your Supabase table
        const { data, error } = await supabase.from('doctors').select('*');

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/bills", BillRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    
    // Check DB Connection on startup
    try {
        const { error } = await supabase.from('bills').select('bill_id').limit(1);
        // Supabase REST client: If it responds with 'relation does not exist' (42P01), 
        // it means the DB URL & Key are completely valid and reachable!
        if (error && error.code !== '42P01') {
            console.error('Supabase connection failed ❌:', error.message);
        } else {
            console.log('Supabase connection successful ✅');
        }
    } catch (err) {
        console.error('Failed to connect to Supabase ❌:', err.message);
    }
});