import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { NewDashboard } from './components/NewDashboard';
import { NewBetScreen } from './components/NewBetScreen';
import { NewHistoryScreen } from './components/NewHistoryScreen';
import { NewResultsScreen } from './components/NewResultsScreen';
import { NewTransactionsScreen } from './components/NewTransactionsScreen';
import { NewProfileScreen } from './components/NewProfileScreen';
import { NewLoginScreen } from './components/NewLoginScreen';
import { NewBottomNav } from './components/NewBottomNav';
import { LeftSidebar } from './components/LeftSidebar';
import { PlayerBettingInterface } from './components/PlayerBettingInterface';
import { SessionSelectionModal } from './components/SessionSelectionModal';
import { AppProvider, useApp } from './context/NewAppContext';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [showSessionSelection, setShowSessionSelection] = useState(false);
  const [showQuickBetModal, setShowQuickBetModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<'AM' | 'PM'>('AM');
  
  const {
    isAuthenticated,
    language,
    setLanguage,
    player,
    balance,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    cartTotal,
    placeBets,
    bets,
    activeBets,
    pastBets,
    dailyResults,
    transactions,
    getBetsBySession,
    getTodayResults,
    getPayoutRate,
    checkBlockedNumber,
    hasBlockedNumbersInCart,
    removeBlockedFromCart,
    favoriteNumbers,
    login,
    logout,
    t
  } = useApp();

  // If not authenticated, show login screen
  if (!isAuthenticated || !player) {
    return (
      <>
        <NewLoginScreen
          onLogin={login}
          t={t}
          language={language}
          setLanguage={setLanguage}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  // Render current screen
  const renderScreen = () => {
    const screenProps = {
      onNavigate: setCurrentScreen,
      t,
      language
    };

    switch (currentScreen) {
      case 'dashboard':
        return (
          <NewDashboard
            {...screenProps}
            onShowQuickBet={() => setShowSessionSelection(true)}
            player={player}
            balance={balance}
            activeBets={activeBets}
            getTodayResults={getTodayResults}
            bets={bets}
            addToCart={addToCart}
          />
        );

      case 'place-bet':
      case 'my-bets':
        return (
          <NewBetScreen
            {...screenProps}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            cartTotal={cartTotal}
            balance={balance}
            placeBets={placeBets}
            checkBlockedNumber={checkBlockedNumber}
            hasBlockedNumbersInCart={hasBlockedNumbersInCart}
            removeBlockedFromCart={removeBlockedFromCart}
            getPayoutRate={getPayoutRate}
            favoriteNumbers={favoriteNumbers}
          />
        );

      case 'history':
        return (
          <NewHistoryScreen
            {...screenProps}
            bets={bets}
            activeBets={activeBets}
            pastBets={pastBets}
            getBetsBySession={getBetsBySession}
          />
        );

      case 'results':
        return (
          <NewResultsScreen
            {...screenProps}
            dailyResults={dailyResults}
            bets={bets}
          />
        );

      case 'profile':
        return (
          <NewProfileScreen
            {...screenProps}
            setLanguage={setLanguage}
            player={player}
            balance={balance}
            logout={logout}
          />
        );

      case 'transactions':
        return (
          <NewTransactionsScreen
            {...screenProps}
            transactions={transactions}
            balance={balance}
          />
        );

      default:
        return (
          <NewDashboard
            {...screenProps}
            player={player}
            balance={balance}
            activeBets={activeBets}
            getTodayResults={getTodayResults}
            bets={bets}
            addToCart={addToCart}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Left Sidebar - Desktop Only */}
      <LeftSidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        t={t}
        language={language}
        player={player}
        balance={balance}
        logout={logout}
      />
      
      {/* Main Content Area */}
      <div className="min-h-screen lg:ml-64 relative">
        <div className="max-w-[430px] lg:max-w-full mx-auto min-h-screen">
          {renderScreen()}
        </div>
        
        {/* Bottom Navigation - Mobile Only */}
        <NewBottomNav
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          onShowQuickBet={() => setShowSessionSelection(true)}
          t={t}
          language={language}
        />
      </div>

      {/* Session Selection Modal */}
      {showSessionSelection && (
        <SessionSelectionModal
          onSelectSession={(session) => {
            setSelectedSession(session);
            setShowSessionSelection(false);
            setShowQuickBetModal(true);
          }}
          onClose={() => setShowSessionSelection(false)}
          language={language}
        />
      )}

      {/* Quick Bet Modal - Shows after session selection */}
      {showQuickBetModal && (
        <PlayerBettingInterface
          onClose={() => setShowQuickBetModal(false)}
          onNavigate={setCurrentScreen}
          language={language}
          playerName={player.name}
          playerNameMM={player.nameMM}
          session={selectedSession === 'AM' ? 'Morning' : 'Evening'}
          onAddToCart={(items) => {
            addToCart(items);
            setShowQuickBetModal(false);
          }}
          balance={balance}
          t={t}
        />
      )}
      
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}