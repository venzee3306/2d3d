# Withdrawal Management System

## Overview
A comprehensive withdrawal management system has been implemented for the Myanmar Lottery Agent Management System, allowing Agents and Masters to request withdrawals and have them approved by their upstream managers.

## Features

### Desktop View
- **Full Withdrawal Management Interface** (`/src/app/components/Withdrawals.tsx`)
  - Request withdrawal with payment details
  - View all withdrawal requests (yours and those you need to approve)
  - Filter by status (All, Pending, Approved, Rejected)
  - Search by name, account number, or amount
  - Approve/reject withdrawal requests with reasons
  - Real-time balance checking

### Mobile View
- **Mobile-Optimized Interface** (`/src/app/components/MobileWithdrawals.tsx`)
  - Bottom-sheet style withdrawal request form
  - Touch-optimized approval/rejection interface
  - Compact card layout for easy scrolling
  - Status badges and color coding

## User Flow

### For Agents:
1. Navigate to **Withdrawals** tab (desktop sidebar or mobile bottom nav)
2. Click **"ငွေထုတ်ယူမည်"** (Request Withdrawal) button
3. Fill in the form:
   - Amount (minimum 10,000 units)
   - Payment method (KBZ Pay, Wave Money, CB Pay, etc.)
   - Account number
   - Account name
   - Optional note
4. Submit request
5. Wait for Master approval
6. Upon approval, units are added back to Agent's balance and Master sends money to the specified account

### For Masters:
- **Request Own Withdrawals**: Same as agents, but requests go to Admin
- **Approve Agent Withdrawals**: 
  1. View pending requests from agents
  2. Verify account details
  3. Approve and send money via the payment method, OR
  4. Reject with a reason

### For Admin:
- **Approve Master Withdrawals**:
  1. View pending requests from masters
  2. Verify account details
  3. Approve and send money, OR
  4. Reject with a reason

## Technical Implementation

### New Files Created:
1. `/src/app/components/Withdrawals.tsx` - Desktop component
2. `/src/app/components/MobileWithdrawals.tsx` - Mobile component
3. `/src/app/views/WithdrawalsView.tsx` - View wrapper

### Modified Files:
1. `/src/app/types/units.ts` - Added `WithdrawalRequest` interface
2. `/src/app/App.tsx` - Added state management and handlers
3. `/src/app/components/AgentSidebar.tsx` - Added withdrawals tab
4. `/src/app/components/MobileDashboard.tsx` - Added withdrawals to bottom nav (5 tabs)
5. `/src/app/views/MobileView.tsx` - Added withdrawal route

### State Management:
```typescript
// Withdrawal request state
const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([...]);

// Handlers
const handleRequestWithdrawal = (requestData) => { ... }
const handleApproveWithdrawal = (requestId) => { ... }
const handleRejectWithdrawal = (requestId, reason) => { ... }
```

### Data Flow:
1. **Request Creation**: User submits form → Handler creates request with status 'pending'
2. **Approval**: Approver clicks approve → Handler deducts from approver's balance → Adds to requester's balance → Creates transaction records → Updates request status to 'approved'
3. **Rejection**: Approver provides reason → Handler updates request status to 'rejected' with reason

## Hierarchical Structure

```
Admin (Balance: 10,000,000)
  ↓
Master 1 (Balance: 500,000) ←─ Can request withdrawal from Admin
  ↓
Agent 1 (Balance: 50,000) ←─ Can request withdrawal from Master 1
Agent 2 (Balance: 75,000) ←─ Can request withdrawal from Master 1
  ↓
Master 2 (Balance: 300,000)
  ↓
Agent 3 (Balance: 100,000) ←─ Can request withdrawal from Master 2
```

## UI Features

### Desktop:
- Large stat cards showing pending/approved/rejected counts
- Filter tabs with counts
- Search functionality
- Detailed request cards with account information
- Action buttons with confirmation
- Balance validation before approval
- Modal forms with validation

### Mobile:
- Bottom navigation with 5 tabs (Dashboard, Bet Entry, Players, Deposits, Withdrawals)
- Swipe-friendly cards
- Bottom-sheet modals
- Touch-optimized buttons
- Real-time balance display
- Status color coding

## Validation Rules

1. **Minimum Withdrawal**: 10,000 units
2. **Maximum Withdrawal**: Current balance
3. **Required Fields**:
   - Amount
   - Payment method
   - Account number
   - Account name
4. **Approval Validation**:
   - Approver must have sufficient balance
   - Cannot approve if balance < withdrawal amount

## Payment Methods Supported
- KBZ Pay
- Wave Money
- CB Pay
- AYA Pay
- Mobile Banking
- Bank Transfer

## Myanmar Language Support
All UI text includes Myanmar translations:
- ငွေထုတ်ယူမည် (Request Withdrawal)
- အတည်ပြုမည် (Approve)
- ငြင်းပယ်မည် (Reject)
- စောင့်ဆိုင်းဆဲ (Pending)
- အတည်ပြုပြီး (Approved)
- ငြင်းပယ်ပြီး (Rejected)

## Demo Accounts

```
Admin: admin / admin123
Master 1: master1 / master123
Master 2: master2 / master123
Agent 1: agent1 / agent123
Agent 2: agent2 / agent123
Agent 3: agent3 / agent123
```

## Sample Data
The system comes with 3 sample withdrawal requests:
1. Agent requesting 50,000 from Master (Pending)
2. Agent requesting 75,000 from Master (Approved)
3. Master requesting 200,000 from Admin (Pending)

## Notes
- Withdrawals are processed manually outside the system
- The system only tracks the request/approval flow
- Actual money transfer happens via Myanmar payment apps
- Transaction history is automatically created for all approvals
- Rejection reasons are stored and displayed to requesters
