import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataDir, 'users.json');

async function loadUsers() {
  try {
    const data = await fs.readFile(usersFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export const protect = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Brak tokena' });
  }
  token = token.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await loadUsers();
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Nieprawidłowy token (użytkownik nie istnieje)' });
    }
    req.user = { id: user.id, username: user.username, email: user.email };
    next();
  } catch {
    res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};
