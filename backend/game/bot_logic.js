/**
 * A simplified card evaluation. In a real scenario, this would be much more complex.
 * @param {object} card The card object to evaluate.
 * @returns {number} A numerical value for the card.
 */
const evaluateCard = (card) => {
    if (!card) return -1;
    let value = 0;
    value += card.attack || 0;
    value += card.health || 0;
    value -= (card.cost || 0) * 0.5; // Less valuable if it costs more
    return value;
};

/**
 * Decides the entire sequence of actions for a bot's turn.
 * @param {object} game The current game instance from game.getState().
 * @param {string} botPlayerId The ID of the bot player.
 * @returns {Array<object>} A list of action objects for the bot to perform.
 */
export const makeBotTurnActions = (game, botPlayerId) => {
    const actions = [];
    const botPlayerIndex = game.players.findIndex(p => p.id === botPlayerId);
    if (botPlayerIndex === -1) return [];

    const botKey = `player${botPlayerIndex + 1}`;
    const botHand = [...game.hands[botKey]];
    const botBoardUnits = [...game.board[botKey].units];
    let availableMana = game.mana[botKey];

    // Phase 1: Draw (This is assumed to be done by the game engine before calling this)

    // Phase 2: Play Mana
    if (!game.manaPlayedThisTurn && botHand.length > 0) {
        let worstCard = botHand[0];
        let worstValue = Infinity;
        for (const card of botHand) {
            const value = evaluateCard(card);
            if (value < worstValue) {
                worstValue = value;
                worstCard = card;
            }
        }
        actions.push({ type: 'playCardAsMana', cardId: worstCard.id });
        const cardIndex = botHand.findIndex(c => c.id === worstCard.id);
        if(cardIndex > -1) botHand.splice(cardIndex, 1);
        availableMana += worstCard.type === 'Unit' ? 1 : 2;
    } else if (botHand.length === 0) {
        actions.push({ type: 'passPhase' }); // Pass mana phase
    }

    // Phase 3: Play Units
    const playableUnits = botHand
        .filter(card => card.type === 'Unit' || card.type === 'Ship')
        .sort((a, b) => evaluateCard(b) - evaluateCard(a));

    for (const unit of playableUnits) {
        if (availableMana >= unit.cost) {
            actions.push({ type: 'playUnitCard', cardId: unit.id });
            availableMana -= unit.cost;
            const cardIndex = botHand.findIndex(c => c.id === unit.id);
            if(cardIndex > -1) botHand.splice(cardIndex, 1);
        }
    }

    // Phase 4: Attack
    actions.push({ type: 'enterAttackPhase' });

    const readyToAttackUnits = botBoardUnits.filter(u => !u.isTapped);
    if (readyToAttackUnits.length > 0) {
        const attackerIds = readyToAttackUnits.map(u => u.id);
        actions.push({ type: 'declareAttack', attackerIds });
    } else {
        actions.push({ type: 'passPhase' }); // Skip attack
    }

    // Phase 5: End Turn
    actions.push({ type: 'endTurn' });

    return actions;
};
