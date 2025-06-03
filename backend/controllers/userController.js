import fs from 'fs/promises';
import path from 'path';

const usersFile = path.join(process.cwd(), 'data', 'users.json');
const cardsFile = path.join(process.cwd(), 'data', 'cards.json');
// ↑ oba pliki będą: <cwd>/data/users.json i <cwd>/data/cards.json

async function loadUsers() {
  try {
    const data = await fs.readFile(usersFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveUsers(users) {
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
}

async function loadCards() {
  try {
    const data = await fs.readFile(cardsFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export const getProfile = async (req, res) => {
  const users = await loadUsers();
  const cards = await loadCards();
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
  }
  const userCards = user.collection
    .map(cardId => cards.find(c => c._id === cardId))
    .filter(Boolean);

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    points: user.points,
    collection: userCards
  });
};

export const addToCollection = async (req, res) => {
  const { cardId } = req.body;
  if (!cardId) {
    return res.status(400).json({ message: 'Brak ID karty' });
  }

  const users = await loadUsers();
  const cards = await loadCards();
  const userIndex = users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
  }

  const existsCard = cards.some(c => c._id === cardId);
  if (!existsCard) {
    return res.status(404).json({ message: 'Takiej karty nie ma' });
  }

  const user = users[userIndex];
  if (!user.collection.includes(cardId)) {
    user.collection.push(cardId);
    users[userIndex] = user;
    await saveUsers(users);
  }

  res.json({ message: 'Dodano do kolekcji' });
};

export const getAllCards = async (req, res) => {
  const cards = await loadCards();
  res.json(cards);
};
