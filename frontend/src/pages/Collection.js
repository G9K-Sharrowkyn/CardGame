import React, { useState, useEffect } from 'react';
import API from '../api';

const Collection = () => {
  const [cards, setCards] = useState([]);
  const [myCollection, setMyCollection] = useState([]);

  useEffect(() => {
    API.get('/users/cards').then(res => setCards(res.data));
    API.get('/users/me').then(res => setMyCollection(res.data.collection.map(c => c._id)));
  }, []);

  const addCard = async (id) => {
    await API.post('/users/collection', { cardId: id });
    setMyCollection(prev => [...prev, id]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl mb-4">Wszystkie Karty</h2>
      <div className="grid grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card._id} className="bg-gray-700 p-2 rounded">
            <img src={card.imageUrl} alt={card.name} className="w-full h-auto" />
            <p className="text-center mt-2">{card.name}</p>
            {myCollection.includes(card._id) ? (
              <button className="w-full bg-gray-500 py-1 rounded mt-2" disabled>Posiadasz</button>
            ) : (
              <button className="w-full bg-blue-600 py-1 rounded mt-2" onClick={() => addCard(card._id)}>Dodaj</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collection;
