const users = [];
const games = {};

const cards = [
  { id: "1", name: "Foot Soldier", type: "unit", cost: 1, mana: 1, power: 1, defense: 2 },
  { id: "2", name: "Heavy Tank", type: "unit", cost: 3, mana: 1, power: 3, defense: 3 },
  { id: "3", name: "Starship", type: "ship", cost: 5, mana: 2, power: 5, defense: 4 },
  { id: "4", name: "Scout Drone", type: "unit", cost: 2, mana: 1, power: 2, defense: 1 }
];

module.exports = { users, games, cards };