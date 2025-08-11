class Game {
    constructor(players, decks) {
        this.players = players; // [{ id, username }, { id, username }]
        this.decks = decks; // { [playerId]: [...cards] }
        this.turn = 0;
        this.phase = 'draw'; // draw, mana, main, attack, end
        this.board = {
            player1: {
                units: [],
                mana: []
            },
            player2: {
                units: [],
                mana: []
            }
        };
        this.hands = {
            player1: [],
            player2: []
        };
        this.life = {
            player1: 20,
            player2: 20
        };
        this.mana = {
            player1: 0,
            player2: 0
        };
        this.manaPlayedThisTurn = false;
        this.currentAttackers = null;

        this.initializeGame();
    }

    initializeGame() {
        // For now, let's assume players[0] is player1 and players[1] is player2
        const player1Id = this.players[0].id;
        const player2Id = this.players[1].id;

        // Shuffle decks
        this.decks[player1Id] = this.shuffle(this.decks[player1Id]);
        this.decks[player2Id] = this.shuffle(this.decks[player2Id]);

        // Draw initial hands
        for (let i = 0; i < 7; i++) {
            this.hands.player1.push(this.decks[player1Id].pop());
            this.hands.player2.push(this.decks[player2Id].pop());
        }
    }

    shuffle(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    // Method to get the current game state, useful for sending to clients
    getState() {
        return {
            turn: this.turn,
            phase: this.phase,
            board: this.board,
            hands: this.hands, // In a real game, you'd only send the respective player's hand
            life: this.life,
            mana: this.mana,
            players: this.players,
            manaPlayedThisTurn: this.manaPlayedThisTurn,
            currentPlayerId: this.getCurrentPlayer().id,
            currentAttackers: this.currentAttackers
        };
    }

    getCurrentPlayer() {
        return this.players[this.turn % 2];
    }

    _getPlayerState(playerId) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return null;

        const playerKey = `player${playerIndex + 1}`;
        return {
            board: this.board[playerKey],
            hand: this.hands[playerKey],
            deck: this.decks[playerId],
        };
    }

    _isCurrentPlayer(playerId) {
        if (this.getCurrentPlayer().id !== playerId) {
            throw new Error("Nie twoja tura!");
        }
    }

    drawCard(playerId) {
        this._isCurrentPlayer(playerId);
        if (this.phase !== 'draw') throw new Error("Nie jest teraz faza dobierania.");

        const playerState = this._getPlayerState(playerId);

        // Untap units at the start of the turn
        playerState.board.units.forEach(unit => (unit.isTapped = false));

        if (playerState.deck.length > 0) {
            const drawnCard = playerState.deck.pop();
            playerState.hand.push(drawnCard);
        } else {
            const playerKey = this.players[0].id === playerId ? 'player1' : 'player2';
            this.life[playerKey]--; // Fatigue damage
        }
        this.phase = 'mana';
    }

    playCardAsMana(playerId, cardId) {
        this._isCurrentPlayer(playerId);
        if (this.phase !== 'mana') throw new Error("Nie jest teraz faza many.");
        if (this.manaPlayedThisTurn) throw new Error("Już zagrałeś kartę many w tej turze.");

        const playerState = this._getPlayerState(playerId);
        const cardIndex = playerState.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) throw new Error("Karty nie ma na ręce.");

        const card = playerState.hand.splice(cardIndex, 1)[0];
        playerState.board.mana.push(card);

        const manaValue = card.type === 'Unit' ? 1 : (card.type === 'Ship' ? 2 : 0);
        const playerKey = this.players[0].id === playerId ? 'player1' : 'player2';
        this.mana[playerKey] += manaValue;

        this.manaPlayedThisTurn = true;
        this.phase = 'main';
    }

    playUnitCard(playerId, cardId) {
        this._isCurrentPlayer(playerId);
        if (this.phase !== 'main') throw new Error("Nie jest teraz faza główna.");

        const playerState = this._getPlayerState(playerId);
        const cardIndex = playerState.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) throw new Error("Karty nie ma na ręce.");

        const card = playerState.hand[cardIndex];
        const playerKey = this.players[0].id === playerId ? 'player1' : 'player2';
        const currentMana = this.mana[playerKey];

        if (currentMana < card.cost) throw new Error("Za mało many.");

        playerState.hand.splice(cardIndex, 1);
        card.isTapped = true; // Summoning sickness
        playerState.board.units.push(card);

        this.mana[playerKey] -= card.cost;
    }

    endTurn(playerId) {
        this._isCurrentPlayer(playerId);
        this.turn++;
        this.phase = 'draw';
        this.manaPlayedThisTurn = false;
    }

    // Method to skip a phase where an action is optional
    passPhase(playerId) {
        this._isCurrentPlayer(playerId);
        if (this.phase === 'mana') {
            this.phase = 'main';
        } else if (this.phase === 'attack') {
            this.phase = 'main'; // If player decides not to attack
        } else {
            throw new Error(`Cannot pass phase ${this.phase}`);
        }
    }

    enterAttackPhase(playerId) {
        this._isCurrentPlayer(playerId);
        if (this.phase !== 'main') throw new Error("Można atakować tylko z fazy głównej.");
        this.phase = 'attack';
    }

    declareAttack(playerId, attackerIds) {
        this._isCurrentPlayer(playerId);
        if (this.phase !== 'attack') throw new Error("Nie jest teraz faza ataku.");

        const playerState = this._getPlayerState(playerId);
        const opponentState = this._getPlayerState(this.players[(this.turn + 1) % 2].id);

        const attackers = [];
        for (const unitId of attackerIds) {
            const unit = playerState.board.units.find(u => u.id === unitId);
            if (!unit) throw new Error(`Jednostka ${unitId} nie została znaleziona.`);
            if (unit.isTapped) throw new Error(`Jednostka ${unit.name} jest stapowana.`);
            attackers.push(unit);
        }

        if (attackers.length === 0) {
            this.phase = 'main'; // No attackers, go back to main phase
            return;
        }

        attackers.forEach(u => u.isTapped = true);
        this.currentAttackers = attackers.map(a => ({ unit: a, blockedBy: [] }));

        // If opponent has no units, deal damage directly
        if (opponentState.board.units.length === 0) {
            this.resolveCombat();
        } else {
            this.phase = 'defend';
        }
    }

    declareDefense(playerId, assignments) {
        const opponent = this.getCurrentPlayer();
        if (this.players.find(p => p.id === playerId).id !== this.players[(this.turn + 1) % 2].id) {
            throw new Error("Tylko obrońca może deklarować blokujących.");
        }
        if (this.phase !== 'defend') throw new Error("Nie jest teraz faza obrony.");

        const defenderState = this._getPlayerState(playerId);

        for (const attackerId in assignments) {
            const attackerInfo = this.currentAttackers.find(a => a.unit.id === attackerId);
            if (!attackerInfo) throw new Error(`Atakująca jednostka ${attackerId} nie istnieje.`);

            for (const defenderId of assignments[attackerId]) {
                const defender = defenderState.board.units.find(u => u.id === defenderId);
                if (!defender) throw new Error(`Jednostka obrony ${defenderId} nie istnieje.`);
                // A unit can only block one attacker
                if (this.currentAttackers.some(a => a.blockedBy.some(d => d.id === defenderId))) {
                    throw new Error(`Jednostka ${defender.name} już blokuje.`);
                }
                attackerInfo.blockedBy.push(defender);
            }
        }
        this.resolveCombat();
    }

    resolveCombat() {
        const attackerPlayerKey = `player${(this.turn % 2) + 1}`;
        const defenderPlayerKey = `player${((this.turn + 1) % 2) + 1}`;

        const deadAttackerIds = new Set();
        const deadDefenderIds = new Set();

        this.currentAttackers.forEach(attackInfo => {
            const attacker = attackInfo.unit;

            if (attackInfo.blockedBy.length > 0) {
                // Damage calculation when blocked
                let totalBlockerDamage = 0;
                attackInfo.blockedBy.forEach(defender => {
                    totalBlockerDamage += defender.attack;
                    // Defender takes damage from attacker
                    if (attacker.attack >= defender.health) {
                        deadDefenderIds.add(defender.id);
                    }
                });
                // Attacker takes damage from all blockers
                if (totalBlockerDamage >= attacker.health) {
                    deadAttackerIds.add(attacker.id);
                }
            } else {
                // Unblocked, deal damage to player
                this.life[defenderPlayerKey] -= attacker.attack;
            }
        });

        // Remove dead units
        this.board[attackerPlayerKey].units = this.board[attackerPlayerKey].units.filter(u => !deadAttackerIds.has(u.id));
        this.board[defenderPlayerKey].units = this.board[defenderPlayerKey].units.filter(u => !deadDefenderIds.has(u.id));

        this.currentAttackers = null;
        this.phase = 'main';
    }
}

export default Game;
