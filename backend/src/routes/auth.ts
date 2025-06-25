import { Router } from 'express';
import { hashPassword, verifyPassword } from './argon';
const router = Router();

// #TODO: Move user interface to a separate file and import once the project structure is finalized.
interface User {
  username: string;
  email: string;
  encryptedPassword: string;
}

let users: User[] = []

router.post('/api/auth/register', async (req: any, res: any) => {
    const { username, email, password: plainPassword } = req.body
    if (!username || !email || !plainPassword) {
        return res.status(400).json({ error: 'Username, email, and password are required.' });
    }
    try {
        if (users.find(user => user.username === username)) {
            return res.status(400).json({ error: 'Username already exists.' });
        } else if (users.find(user => user.email === email)) {
            return res.status(400).json({ error: 'Email already exists.' });
        } else {
            const encryptedPassword = await hashPassword(plainPassword);
            users.push({ username, email, encryptedPassword });
            return res.status(201).json({ message: 'User registered successfully.' });
        }
    } catch (err) {
        console.error('Error during registration:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
})

router.post('/api/auth/login', async (req: any, res: any) => {
    const { username, password: plainPassword } = req.body
    if (!username || !plainPassword) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }
    try {
        const user: User | undefined = users.find(u => u.username === username);
        if (!user || !(await verifyPassword(plainPassword, user.encryptedPassword))) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        } else {
            req.session.user = user;
            return res.json({ message: 'Login successful.' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
})

router.post('/api/auth/logout', (req: any, res: any) => {
    req.session.destroy((err: any) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Logout failed.' });
        } else {
            res.clearCookie('sessionId');
            return res.json({ message: 'Logout successful.' });
        }
    })
})

module.exports = router;