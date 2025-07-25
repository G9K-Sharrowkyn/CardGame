// ULEPSZONA SZTUCZNA INTELIGENCJA - GOTOWA DO UŻYTKU
// System AI dla gry z botem

import cardsSpecifics from '../frontend/src/mechanics/CardsSpecifics.js';

class AdvancedBot {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.gameState = null;
    this.personality = this.generatePersonality(difficulty);
  }

  generatePersonality(difficulty) {
    const personalities = {
      easy: {
        aggression: 0.3,
        cardValue: 0.4,
        planning: 0.2,
        riskTaking: 0.6,
        mistakes: 0.3
      },
      medium: {
        aggression: 0.5,
        cardValue: 0.7,
        planning: 0.6,
        riskTaking: 0.4,
        mistakes: 0.1
      },
      hard: {
        aggression: 0.7,
        cardValue: 0.9,
        planning: 0.9,
        riskTaking: 0.2,
        mistakes: 0.05
      }
    };
    
    return personalities[difficulty] || personalities.medium;
  }

  initialize(gameState) {
    this.gameState = gameState;
  }

  // Ocena wartości karty
  evaluateCard(card) {
    const details = cardsSpecifics.find(c => c.name === card.name);
    if (!details) return 0;

    let value = 0;
    
    // Podstawowa wartość na podstawie statystyk
    value += (details.attack || 0) * 2;
    value += (details.defense || 0) * 1.5;
    
    // Kara za koszt
    value -= (details.commandCost || 0) * 1.2;
    
    // Bonus za specjalne typy
    if (details.type && details.type.includes('Shipyard')) {
      value += 3; // Shipyards generują mana
    }
    
    // Modyfikatory na podstawie osobowości
    value *= (1 + this.personality.cardValue * 0.5);
    
    return Math.max(0, value);
  }

  // Wybór najlepszej karty do zagrania
  chooseCardToPlay(hand, availableMana, phase) {
    if (!hand || hand.length === 0) return null;

    let bestCard = null;
    let bestValue = -1;

    for (const card of hand) {
      const details = cardsSpecifics.find(c => c.name === card.name);
      if (!details) continue;

      // Sprawdź czy można zagrać kartę
      if (phase === 'COMMAND' && details.type && details.type.includes('Shipyard')) {
        const value = this.evaluateCard(card);
        if (value > bestValue) {
          bestValue = value;
          bestCard = card;
        }
      } else if (phase === 'DEPLOYMENT' && details.commandCost <= availableMana) {
        let value = this.evaluateCard(card);
        
        // Modyfikatory na podstawie fazy gry
        if (this.personality.aggression > 0.6 && details.attack > 0) {
          value *= 1.3; // Preferuj jednostki atakujące
        }
        
        if (value > bestValue) {
          bestValue = value;
          bestCard = card;
        }
      }
    }

    // Losowe błędy dla łatwiejszych botów
    if (Math.random() < this.personality.mistakes) {
      const playableCards = hand.filter(card => {
        const details = cardsSpecifics.find(c => c.name === card.name);
        if (phase === 'COMMAND') {
          return details && details.type && details.type.includes('Shipyard');
        } else if (phase === 'DEPLOYMENT') {
          return details && details.commandCost <= availableMana;
        }
        return false;
      });
      
      if (playableCards.length > 0) {
        bestCard = playableCards[Math.floor(Math.random() * playableCards.length)];
      }
    }

    return bestCard;
  }

  // Decyzja o ataku
  shouldAttack(myUnits, enemyUnits, enemyHP) {
    if (!myUnits || myUnits.length === 0) return false;

    const totalAttack = myUnits.reduce((sum, unit) => {
      const details = cardsSpecifics.find(c => c.name === unit.name);
      return sum + (details ? details.attack || 0 : 0);
    }, 0);

    // Agresywne boty atakują częściej
    const aggressionThreshold = 1 - this.personality.aggression;
    
    // Atak bezpośredni jeśli przeciwnik nie ma obrony
    if (enemyUnits.length === 0 && totalAttack > 0) {
      return Math.random() > aggressionThreshold * 0.3;
    }

    // Atak jeśli mamy przewagę
    const enemyDefense = enemyUnits.reduce((sum, unit) => {
      const details = cardsSpecifics.find(c => c.name === unit.name);
      return sum + (details ? details.defense || 0 : 0);
    }, 0);

    if (totalAttack > enemyDefense * 1.2) {
      return Math.random() > aggressionThreshold * 0.5;
    }

    // Desperacki atak jeśli przeciwnik ma dużo HP a my mało
    if (enemyHP > 15 && Math.random() > aggressionThreshold * 0.8) {
      return true;
    }

    return false;
  }

  // Główna funkcja podejmowania decyzji
  makeDecision(gameState) {
    this.gameState = gameState;
    
    const { hand, availableMana, currentPhase, myUnits, enemyUnits, enemyHP } = gameState;

    switch (currentPhase) {
      case 'COMMAND':
        return {
          action: 'playCard',
          card: this.chooseCardToPlay(hand, availableMana, 'COMMAND'),
          zone: 'command'
        };
        
      case 'DEPLOYMENT':
        return {
          action: 'playCard',
          card: this.chooseCardToPlay(hand, availableMana, 'DEPLOYMENT'),
          zone: 'unit'
        };
        
      case 'BATTLE':
        if (this.shouldAttack(myUnits, enemyUnits, enemyHP)) {
          return {
            action: 'attack',
            attackers: myUnits.filter(unit => {
              const details = cardsSpecifics.find(c => c.name === unit.name);
              return details && details.attack > 0;
            })
          };
        }
        return { action: 'endPhase' };
        
      default:
        return { action: 'endPhase' };
    }
  }
}

export default AdvancedBot;