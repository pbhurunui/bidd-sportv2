/**
 * Android Widget System for BIDD-Sport PWA
 * Manages home screen shortcuts and badging
 */

class BiddSportWidget {
  constructor() {
    this.updateInterval = null;
  }

  /**
   * Initialize widget system
   */
  init() {
    console.log('🎯 Initializing BIDD-Sport Widget System');
    
    // Handle deep links from shortcuts
    this.handleDeepLink();
    
    // Update badge with tournament count
    this.updateBadge();
    
    // Update badge periodically
    this.startPeriodicUpdate();
    
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateBadge();
      }
    });
  }

  /**
   * Handle deep links from app shortcuts
   */
  handleDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    
    if (!action) return;
    
    console.log('🔗 Deep link action:', action);
    
    switch(action) {
      case 'new-tournament':
        setTimeout(() => {
          document.getElementById('newTournamentBtn')?.click();
        }, 500);
        break;
        
      case 'view-results':
        setTimeout(() => {
          showView('results');
          window.history.replaceState({}, document.title, './');
        }, 500);
        break;
        
      case 'sync-data':
        setTimeout(() => {
          syncDataToFirestore();
          window.history.replaceState({}, document.title, './');
        }, 500);
        break;
    }
  }

  /**
   * Update app badge with tournament count
   */
  async updateBadge() {
    if (!navigator.setAppBadge) {
      console.warn('⚠️ App Badge API not supported');
      return;
    }

    try {
      // Count active tournaments
      const activeTournaments = tournaments?.filter(t => {
        const tournamentDate = new Date(t.date);
        return tournamentDate >= new Date();
      }).length || 0;

      if (activeTournaments > 0) {
        await navigator.setAppBadge(activeTournaments);
        console.log(`📌 Badge updated: ${activeTournaments} active tournaments`);
      } else {
        await navigator.clearAppBadge();
        console.log('📌 Badge cleared');
      }
    } catch (error) {
      console.warn('Badge update failed:', error);
    }
  }

  /**
   * Start periodic badge updates
   */
  startPeriodicUpdate() {
    // Update badge every 5 minutes
    this.updateInterval = setInterval(() => {
      this.updateBadge();
    }, 5 * 60 * 1000);
  }

  /**
   * Stop periodic updates
   */
  stopPeriodicUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Get widget data for display
   */
  getWidgetData() {
    return {
      activeTournaments: tournaments?.filter(t => new Date(t.date) >= new Date()).length || 0,
      totalEvents: events?.length || 0,
      totalCompetitors: competitors?.length || 0,
      recentResults: results?.slice(-5) || [],
      syncStatus: document.getElementById('syncStatus')?.textContent || 'Ready'
    };
  }

  /**
   * Show widget info popup (for testing)
   */
  showWidgetInfo() {
    const data = this.getWidgetData();
    alert(`
📊 BIDD-Sport Widget Info
━━━━━━━━━━━━━━━━━━━━━
🏆 Active Tournaments: ${data.activeTournaments}
🎯 Total Events: ${data.totalEvents}
👥 Total Competitors: ${data.totalCompetitors}
📡 Sync Status: ${data.syncStatus}

Shortcuts available:
• New Tournament
• View Results
• Sync Data
    `.trim());
  }
}

// Initialize widget when app loads
const biddWidget = new BiddSportWidget();
document.addEventListener('DOMContentLoaded', () => {
  biddWidget.init();
});

// Update badge when data changes
function updateWidgetBadge() {
  biddWidget.updateBadge();
}

// Export for use in main app
window.BiddWidget = biddWidget;
