I have an existing Agent Dashboard with a comprehensive Bet Entry system, and I need to replicate that EXACT interface for my Player site. The Player should have the same betting experience as when an Agent places bets, but adapted for self-service player use.

What I Need:
Take the BetEntryView component from my Agent Dashboard project and adapt it for the Player site with these modifications:

1. Component to Replicate:
Source Component: /src/app/views/BetEntryView.tsx (from Agent Dashboard)

Key Elements to Copy Exactly:

✅ Game mode toggle (2D / 3D buttons)
✅ Pattern selector dropdown with all Myanmar patterns
✅ Number input field with validation
✅ Amount input field with MMK formatting
✅ "Add to Cart" button logic
✅ Cart display with number, amount, pattern info
✅ Total calculation at bottom
✅ Pattern generation algorithms (Power, Break, Round, Khwe, etc.)
✅ Visual styling (gradients, cards, shadows, Myanmar fonts)
✅ Blocked numbers validation
✅ Myanmar/English bilingual labels
2. Modifications Required:
A. Remove Player Selection (Agent-specific feature)
- <PlayerSelector players={players} onSelect={setSelectedPlayer} />
+ {/* Player is auto-selected from logged-in user */}
Replace with: Auto-populate selectedPlayer from current logged-in player's session

B. Header Section
// Change from Agent view:
<h1>Bet Entry - Agent Dashboard</h1>

// To Player view:
<h1>Place Your Bets</h1>
<p>Player: {currentPlayer.name}</p>
<p>Balance: {currentPlayer.balance.toLocaleString()} MMK</p>
C. Session/Round Selector
Keep the same AM/PM session selector or add custom round options if applicable

D. Submit Button Text
- "Submit Bets for Player"
+ "Submit My Bets"
E. Balance Validation
// Add check before allowing bet submission:
const totalBetAmount = cart.reduce((sum, item) => sum + item.amount, 0);

if (totalBetAmount > currentPlayer.balance) {
  showError("Insufficient balance!");
  return;
}
3. Exact UI Structure to Replicate:
<PlayerBetEntry>
  {/* Player Info Bar (NEW - replace Agent's player selector) */}
  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-xl">
    <div className="flex justify-between items-center text-white">
      <div>
        <p className="text-sm opacity-90">Player</p>
        <p className="text-xl font-bold">{player.name}</p>
      </div>
      <div className="text-right">
        <p className="text-sm opacity-90">Balance</p>
        <p className="text-xl font-bold">{balance.toLocaleString()} MMK</p>
      </div>
    </div>
  </div>

  {/* EXACT COPY from Agent's BetEntryView */}
  <div className="bg-white p-6 rounded-b-xl shadow-xl">
    
    {/* Game Mode Toggle - EXACT SAME */}
    <GameModeToggle gameMode={gameMode} onChange={setGameMode} />
    
    {/* Pattern Selector - EXACT SAME */}
    <PatternSelector 
      patterns={allPatterns} // Same Myanmar patterns
      selected={selectedPattern}
      onChange={setSelectedPattern}
    />
    
    {/* Number Input - EXACT SAME */}
    <NumberInput
      gameMode={gameMode}
      pattern={selectedPattern}
      value={numberInput}
      onChange={setNumberInput}
      onGenerate={handleGenerateNumbers}
    />
    
    {/* Generated Numbers Preview - EXACT SAME */}
    {generatedNumbers.length > 0 && (
      <GeneratedNumbersPreview numbers={generatedNumbers} />
    )}
    
    {/* Amount Input - EXACT SAME */}
    <AmountInput
      value={betAmount}
      onChange={setBetAmount}
      currency="MMK"
    />
    
    {/* Add to Cart Button - EXACT SAME */}
    <AddToCartButton onClick={handleAddToCart} />
    
    {/* Cart Display - EXACT SAME */}
    <BetCart
      items={cartItems}
      onRemove={handleRemoveFromCart}
      onClear={handleClearCart}
      gameMode={gameMode}
    />
    
    {/* Total & Submit - MODIFIED TEXT ONLY */}
    <div className="border-t pt-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold">Total Amount:</span>
        <span className="text-2xl font-bold text-purple-600">
          {calculateTotal().toLocaleString()} MMK
        </span>
      </div>
      
      {/* Balance Check Warning (NEW) */}
      {calculateTotal() > balance && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-3">
          <p className="text-red-700 text-sm font-semibold">
            ⚠️ Insufficient Balance! Need {(calculateTotal() - balance).toLocaleString()} MMK more
          </p>
        </div>
      )}
      
      <button
        onClick={handleSubmitBets}
        disabled={cartItems.length === 0 || calculateTotal() > balance}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 
                   hover:from-green-600 hover:to-green-700 text-white font-bold 
                   rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit My Bets ({cartItems.length} numbers)
      </button>
    </div>
  </div>
</PlayerBetEntry>
4. Pattern Generation Logic - Use Exact Same Code:
Copy these functions from BetEntryView.tsx without modification:

generatePowerNumbers() - ပါ၀ါ pattern
generateBreakNumbers() - ထီခွဲ pattern
generateRoundNumbers() - ပတ် pattern
generateKhweNumbers() - ခွေ pattern
generateAponeApout() - အပုံး/အပေါက် pattern
generateBrothers() - ညီအစ်ကို pattern
generateTwins() - အမွှာ pattern
generateNatkhatBody() - နပ်ခတ်ကိုယ် pattern
All other pattern generators
Do NOT modify the logic - players should get the same number generation as agents use.

5. Blocked Numbers Integration:
If your Agent system has blocked numbers, replicate the validation:

// Copy from Agent's system:
const isNumberBlocked = (number: string, gameMode: '2D' | '3D'): boolean => {
  const blockedList = blockedNumbers[currentPlayer.agentId]?.[gameMode] || [];
  return blockedList.includes(number);
};

// Before adding to cart:
const handleAddToCart = () => {
  if (isNumberBlocked(numberInput, gameMode)) {
    showError(`Number ${numberInput} is currently blocked`);
    return;
  }
  
  // ... rest of add to cart logic
};
6. Styling - Copy Exact CSS Classes:
Use the same Tailwind classes from Agent's BetEntryView:

// Game Mode Toggle - EXACT SAME
<div className="flex gap-3 mb-6">
  <button
    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
      gameMode === '2D'
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    2D (၂လုံး)
  </button>
  <button
    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
      gameMode === '3D'
        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    3D (၃လုံး)
  </button>
</div>

// Pattern Selector - EXACT SAME
<select className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl 
                   focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                   font-semibold" 
        style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
  <option value="manual">Manual Entry (ကိုယ်တိုင်ထည့်)</option>
  <option value="power-2">Power-2 (ပါ၀ါ-၂)</option>
  {/* ... all other patterns */}
</select>

// Number Input - EXACT SAME
<input
  type="text"
  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl
             focus:border-purple-500 focus:ring-2 focus:ring-purple-200
             text-lg font-bold text-center"
  placeholder={gameMode === '2D' ? '00-99' : '000-999'}
/>

// Cart Item - EXACT SAME
<div className="flex items-center justify-between p-3 bg-gradient-to-r 
                from-blue-50 to-purple-50 rounded-lg border-2 border-purple-200">
  {/* ... cart item content */}
</div>
7. Myanmar Font - Use Exact Same:
/* Copy from Agent's CSS */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@font-face {
  font-family: 'Pyidaungsu';
  src: local('Pyidaungsu'), local('Myanmar Text');
}

.myanmar-text {
  font-family: 'Pyidaungsu', 'Myanmar Text', sans-serif;
}
8. Data Flow:
// Player Bet Submission (modified from Agent's flow)
const handleSubmitBets = async () => {
  // Validate balance
  const totalAmount = calculateTotal();
  if (totalAmount > currentPlayer.balance) {
    alert("Insufficient balance!");
    return;
  }
  
  // Format bets (SAME structure as Agent's submission)
  const betsToSubmit = cartItems.map(item => ({
    playerId: currentPlayer.id,
    playerName: currentPlayer.name,
    gameType: item.gameMode,
    betNumber: item.number,
    amount: item.amount,
    round: currentSession, // 'AM' or 'PM'
    pattern: item.pattern,
    placedAt: new Date().toISOString(),
    status: 'pending'
  }));
  
  // Submit to backend/parent system (YOUR API)
  await submitPlayerBets(betsToSubmit);
  
  // Update balance
  updatePlayerBalance(currentPlayer.id, currentPlayer.balance - totalAmount);
  
  // Clear cart
  setCartItems([]);
  
  // Success message
  showSuccess(`✅ ${cartItems.length} bets placed successfully!`);
};
9. File Structure for Your Player Site:
/player-site
  /src
    /components
      /BetEntry
        PlayerBetEntry.tsx          ← Main component (copied from BetEntryView)
        GameModeToggle.tsx          ← Copy exact from Agent
        PatternSelector.tsx         ← Copy exact from Agent
        NumberInput.tsx             ← Copy exact from Agent
        AmountInput.tsx             ← Copy exact from Agent
        BetCart.tsx                 ← Copy exact from Agent
        GeneratedNumbersPreview.tsx ← Copy exact from Agent
      /shared
        PatternGenerators.ts        ← Copy ALL pattern logic from Agent
        MyanmarPatterns.ts          ← Copy pattern definitions
    /pages
      BetEntryPage.tsx              ← Wrapper page for PlayerBetEntry
    /styles
      fonts.css                     ← Copy Myanmar font imports
10. Key Differences from Agent Version:
Feature	Agent Version	Player Version
Player Selection	Dropdown to choose player	Auto-selected (logged-in user)
Balance Display	Not shown	Prominently shown at top
Balance Validation	Not required	Must check before submission
Submit Button	"Submit Bets for Player"	"Submit My Bets"
History Access	Can view all players' bets	Only own bet history
Blocked Numbers	Agent can override (maybe)	Strictly enforced
11. Implementation Steps:
Copy the entire BetEntryView.tsx from Agent Dashboard
Rename to PlayerBetEntry.tsx in Player site
Remove player selector component
Add balance display header
Add balance validation before submission
Update button text and labels
Test all pattern generators work identically
Verify Myanmar fonts render correctly
Integrate with Player's authentication/session
Connect to backend API for bet submission
12. Testing Checklist:
 Can enter 2D numbers (00-99)
 Can enter 3D numbers (000-999)
 All Myanmar patterns generate correct numbers
 Amount input accepts MMK values
 Cart displays all added bets
 Total calculation is accurate
 Balance validation prevents overspending
 Blocked numbers are rejected
 Myanmar text displays correctly
 Submit button works and clears cart
 Success message appears after submission
 Balance updates after bet placement
Final Request:
Create a Player Bet Entry component that is a 95% exact copy of the Agent's BetEntryView, with ONLY these changes:

Remove player dropdown (auto-use logged-in player)
Add balance display and validation
Change button text from "Submit Bets for Player" to "Submit My Bets"
Add insufficient balance warning
Everything else should be identical: patterns, styling, layout, Myanmar fonts, number generation, cart functionality, and visual design.