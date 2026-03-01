Prompt for Creating the Player Site
I need to build a Myanmar 2D/3D Lottery Player Web Application that connects to my existing Gambling Management Dashboard system (which handles Admin, Master, and Agent roles). This Player site should be a separate project but follow the same design language and integrate with the betting flow.

Project Context:
Parent System: I have an Admin/Master/Agent dashboard for managing lottery operations
This Player Site: A customer-facing application where players can place 2D/3D bets, view their balance, check bet history, and see results
Connection Point: Players are created by Agents in the parent system, and this player site is where they log in to place their own bets
Design System (Match Parent Project):
Visual Theme:
Colors:
Primary: Royal Blue to Purple gradients (from-blue-600 to-purple-600)
Accent: Green for wins, Red for losses
Background: Light mode with subtle blue/slate gradients
Cards: White with glassmorphism effects (backdrop blur, transparency)
Typography:
Myanmar Font: Pyidaungsu (primary), Myanmar Text (fallback)
English Font: Inter, system sans-serif
Use Myanmar language labels with English where appropriate
Currency: MMK (Myanmar Kyat) formatting with thousand separators (e.g., "500,000 MMK")
Components: Modern, rounded corners (12-16px), subtle shadows, smooth transitions
Responsive Design:
Mobile-first approach (most players use mobile phones)
Support both portrait and landscape orientations
Touch-friendly button sizes (minimum 44px tap targets)
Core Features Required:
1. Player Authentication:
Login page with username and password (created by Agent in parent system)
Player profile display: Name, Phone Number, Current Balance
Logout functionality
Session management
2. Bet Placement Interface (replicate Agent's "Place Bet for Player" flow):
Betting Modes:

2D Betting: Two-digit numbers (00-99)
3D Betting: Three-digit numbers (000-999)
Round Selection: Morning, Evening (or custom rounds based on local lottery schedule)
Bet Entry Methods:

Manual Entry: Type number and amount directly
Quick Patterns (Myanmar lottery patterns):
Power (ပါ၀ါ): Power-2, Power-3 number generation
Break (ထီခွဲ): Break-2, Break-3 combinations
Round (ပတ်): All permutations of given digits
Khwe (ခွေ): Reverse number pairs
Apone/Apout (အပုံး/အပေါက်): Leading/trailing digit patterns
Brothers (ညီအစ်ကို): Sequential number patterns
Twin (အမွှာ): Identical digit numbers (11, 22, etc.)
Natkhat Body (နပ်ခတ်ကိုယ်): Body numbers for given head/tail
Bet Management:

Add multiple bets to cart before submission
Edit bet amounts before confirmation
Remove individual bets from cart
View total bet amount before submission
Minimum/Maximum bet limits per number (configurable)
Pattern grouping (show which bets came from same pattern)
Blocked Numbers:

Check if number is blocked by Agent/Master before allowing bet
Display clear message if number is unavailable
Real-time validation during entry
3. Balance & Wallet Management:
Display current balance prominently at top
Real-time balance updates after bet placement
Insufficient balance warnings
Balance transaction history:
Deposits (from Agent)
Bet placements (deductions)
Winnings (credits)
Timestamp for each transaction
4. Betting History & Records:
Active Bets (pending results):

Game type (2D/3D)
Round (Morning/Evening)
Bet numbers and amounts
Placed timestamp
Status: Pending
Past Bets (completed):

Filter by: Date range, Game type, Status (Won/Lost/Cancelled)
Show: Bet details, Result, Win/Loss amount
Downloadable history (optional)
Grouping by Session:

Group bets by submission time (like agent's dashboard)
Show total amount per session
Expandable/collapsible view
5. Results & Notifications:
Today's Results:

Display winning 2D and 3D numbers
Show morning and evening results separately
Highlight if player has winning bets
Win/Loss Summary:

Total bets placed today
Total amount wagered
Total winnings
Net profit/loss
Notifications:

Push notification when results are announced (if possible)
Badge icon for new results
Win/Loss alerts
6. Payout Rate Display:
Show current payout rates set by Agent/Master:
2D Payout: e.g., "85x" (bet 1,000 → win 85,000)
3D Payout: e.g., "500x" (bet 1,000 → win 500,000)
Display prominently so players understand potential winnings
7. Quick Bet / Favorite Numbers:
Save frequently bet numbers for quick access
One-tap betting on saved favorites
Manage favorite numbers list
8. Responsible Gaming:
Daily bet limit warnings (optional, configurable)
Session time tracking
Self-exclusion options (optional)
Technical Requirements:
Frontend:
React + TypeScript
Tailwind CSS v4 for styling
Responsive design (mobile-first)
State management for cart, balance, and bet history
Form validation for bet entry
Data Structure Examples:
Player Object:

interface Player {
  id: string;
  name: string;
  username: string;
  password: string;
  phoneNumber: string;
  balance: number;
  agentId: string; // Link to parent Agent
  status: 'active' | 'suspended';
  createdAt: string;
}
Bet Object:

interface Bet {
  id: string;
  playerId: string;
  playerName: string;
  gameType: '2D' | '3D';
  betNumber: string;
  amount: number;
  round: 'Morning' | 'Evening';
  placedAt: string;
  status: 'Pending' | 'Won' | 'Lost';
  winAmount?: number;
  pattern?: {
    type: 'manual' | 'power-2' | 'power-3' | 'break-2' | 'break-3' | 'round' | 'khwe' | 'apone' | 'apout' | 'brothers' | 'twin' | 'natkhat-body';
    input: string;
    label: string;
  };
}
Cart Item:

interface CartItem {
  id: string;
  gameMode: '2D' | '3D';
  number: string;
  amount: number;
  pattern?: Pattern;
}
User Flow:
Login → Player enters username/password
Dashboard → See balance, active bets, today's results
Place Bet →
Select game type (2D/3D)
Choose round (Morning/Evening)
Enter numbers (manual or patterns)
Add to cart
Review and confirm
View History → Check past bets and results
Check Results → See if bets won/lost
Logout
Key UI Components Needed:
Login Page: Simple, centered form with Player branding
Dashboard: Balance card, quick bet section, active bets summary
Bet Entry Modal/Page: Game mode toggle, number input, pattern selector, cart
Cart Component: List of pending bets with amounts, total, submit button
History Page: Filterable list of past bets with status badges
Results Page: Today's winning numbers display, animated reveals
Balance Card: Prominent display with Myanmar currency formatting
Notification Bell: Badge for new results/updates
Myanmar Language Labels (Bilingual):
Balance: လက်ကျန်ငွေ (Balance)
Place Bet: ထီထိုးမည် (Place Bet)
2D/3D: ၂လုံး / ၃လုံး
Morning: နံနက် (Morning)
Evening: ညနေ (Evening)
Amount: ပမာဏ (Amount)
Total: စုစုပေါင်း (Total)
Win: နိုင် (Win)
Loss: ရှုံး (Loss)
History: မှတ်တမ်း (History)
Results: ထီပေါက်စဉ် (Results)
Special Features from Agent Dashboard to Include:
Pattern Generator UI:

Replicate the pattern dropdowns and input fields from agent's bet entry
Generate numbers automatically based on selected pattern
Show preview of generated numbers before adding to cart
Number Blocking Check:

Before submitting cart, validate all numbers against blocked list
Show which numbers are blocked and why
Option to remove blocked numbers from cart
Session-based Betting:

Group bets by submission time
Allow viewing/deleting entire betting session before confirmation
Myanmar Pattern Logic:

Implement all the pattern generation algorithms (power, break, round, khwe, etc.)
Use the same logic as Agent dashboard for consistency
Additional Considerations:
Offline Mode: Cache bet history for offline viewing (optional)
Multi-language: Support Myanmar and English UI toggle (optional)
Print Receipt: Allow printing bet confirmation receipts (optional)
SMS Notifications: Send bet confirmation via SMS (optional, requires backend)
Backend Integration (if applicable):
If you're building a backend API to connect Player site with Admin dashboard:

Authentication API: Login/Logout
Bet Placement API: Submit bets, validate against balance and blocked numbers
Balance API: Fetch current balance, transaction history
History API: Fetch bet history with filters
Results API: Fetch daily results
Sample Pages/Views:
Login Page
Player Dashboard (balance, quick stats, today's results)
Bet Entry Page (game mode, patterns, cart)
Betting History Page (filterable list)
Results Page (winning numbers, player's matches)
Profile Page (player info, settings)
Example Bet Entry Flow to Replicate:
From Agent Dashboard → Player should experience the same:

Select 2D or 3D game mode
Choose bet entry method:
Type number manually → Enter amount → Add to cart
Select pattern (e.g., "Break-2") → Enter input (e.g., "456") → Generated numbers appear → Enter amount → Add all to cart
Cart shows all bets with numbers, amounts, and total
Click "Submit All Bets" → Confirm → Balance deducted → Bets saved
See confirmation message with bet details