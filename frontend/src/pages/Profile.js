import React, { useState, useEffect } from 'react';
import API from '../api';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    API.get('/users/me').then(res => setProfile(res.data));
  }, []);

  if (!profile) return null;

  return (
    <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded">
      <h2 className="text-2xl mb-4">Mój Profil</h2>
      <p><span className="font-bold">Nazwa:</span> {profile.username}</p>
      <p><span className="font-bold">Email:</span> {profile.email}</p>
      <p><span className="font-bold">Punkty:</span> {profile.points}</p>
      <div className="mt-4">
        <h3 className="text-xl mb-2">Moja Kolekcja</h3>
        <div className="grid grid-cols-4 gap-4">
          {profile.collection.map((card) => (
            <div key={card._id} className="bg-gray-700 p-2 rounded">
              <img src={card.imageUrl} alt={card.name} className="w-full h-auto" />
              <p className="text-center mt-2">{card.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
