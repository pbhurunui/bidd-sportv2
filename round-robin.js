// ROUND ROBIN TOURNAMENT SYSTEM
// Complete implementation for Badminton and Squash tournaments
// With Role-Based Access Control (Read-only for competitors)

// ============================================================================
// 0. ROLE-BASED ACCESS CONTROL
// ============================================================================
// NOTE: userRole and competitorId are declared in index.html
// This file uses those globals to maintain role-based access

function setUserAsCompetitor(competitorIdValue) {
    /**
     * Set user role to competitor (read-only)
     * Called when user signs up for tournament
     */
    userRole = 'competitor';
    competitorId = competitorIdValue;
    localStorage.setItem('userRole', 'competitor');
    localStorage.setItem('competitorId', competitorIdValue);
}

function setUserAsOrganizer() {
    /**
     * Set user role to organizer (full edit access)
     * Called after sign in with admin account
     */
    userRole = 'organizer';
    competitorId = null;
    localStorage.setItem('userRole', 'organizer');
    localStorage.removeItem('competitorId');
}

function isOrganizer() {
    return currentUser && currentUser.role === 'organizer';
}

function isCompetitor() {
    return currentUser && currentUser.role === 'competitor' && competitorId;
}

function requireOrganizerAccess(actionName) {
    /**
     * Prevent competitors from editing
     */
    if (!isOrganizer()) {
        console.warn(`Competitor attempted to ${actionName} - access denied`);
        alert('This action is only available to tournament organizers');
        return false;
    }
    return true;
}

// Restore role on page load
window.addEventListener('load', () => {
    const savedRole = localStorage.getItem('userRole');
    const savedComId = localStorage.getItem('competitorId');
    
    if (savedRole === 'competitor' && savedComId) {
        setUserAsCompetitor(savedComId);
    }
});

// ============================================================================
// 1. SWISS SYSTEM PAIRING ALGORITHM
// ============================================================================

function generateRoundPairings(tournamentId, round, competitorList) {
    /**
     * Swiss System: Pairs competitors with similar records
     * competitorList: optional - if provided, only pair these competitors (for gender split)
     * - Winners play winners, losers play losers
     * - Avoids previous matchups
     * - Fair and balanced
     */
    
    console.log('generateRoundPairings called:', { tournamentId, round, competitorListLength: competitorList?.length });
    
    const tournament = roundRobinTournaments.find(t => t.id === tournamentId);
    if (!tournament) {
        console.error('Tournament not found:', tournamentId);
        return [];
    }
    console.log('Tournament found:', tournament);
    
    // Get standings - filter by competitors if provided
    let standings = roundRobinStandings.filter(s => s.tournamentId === tournamentId);
    console.log('All standings for tournament:', standings.length, standings);
    
    if (competitorList) {
        const competitorIds = competitorList.map(c => c.id);
        console.log('Filtering by competitor IDs:', competitorIds);
        standings = standings.filter(s => competitorIds.includes(s.competitorId));
        console.log('Standings after filtering:', standings.length, standings);
    }
    
    // If first round, pair by random/skill level
    if (round === 1) {
        standings = standings.sort(() => Math.random() - 0.5);
    } else {
        // Sort by points (descending), then by head-to-head record
        standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            // Tiebreaker: win percentage
            const aWinPct = a.wins / Math.max(a.wins + a.losses + a.draws, 1);
            const bWinPct = b.wins / Math.max(b.wins + b.losses + b.draws, 1);
            return bWinPct - aWinPct;
        });
    }
    
    // Get previous matchups to avoid repeats
    const previousMatchups = new Set();
    roundRobinMatches
        .filter(m => m.tournamentId === tournamentId && m.round < round)
        .forEach(m => {
            const key = [m.competitor1Id, m.competitor2Id].sort().join('|');
            previousMatchups.add(key);
        });
    
    // Generate pairings
    const matches = [];
    const used = new Set();
    
    console.log('Starting match generation with standings:', standings.length);
    
    for (let i = 0; i < standings.length - 1; i++) {
        if (used.has(standings[i].competitorId)) continue;
        used.add(standings[i].competitorId);
        
        // Find next unpaired competitor that hasn't played this one
        for (let j = i + 1; j < standings.length; j++) {
            if (used.has(standings[j].competitorId)) continue;
            
            const matchKey = [standings[i].competitorId, standings[j].competitorId].sort().join('|');
            if (!previousMatchups.has(matchKey)) {
                matches.push({
                    id: `match_${Date.now()}_${Math.random()}`,
                    tournamentId,
                    round,
                    competitor1Id: standings[i].competitorId,
                    competitor2Id: standings[j].competitorId,
                    date: new Date().toISOString(),
                    status: 'scheduled',
                    winner: null,
                    loser: null
                });
                console.log('Match created:', matches[matches.length - 1]);
                used.add(standings[j].competitorId);
                break;
            }
        }
    }
    
    console.log('Total matches generated:', matches.length, matches);
    return matches;
}

// ============================================================================
// 2. STANDINGS CALCULATION
// ============================================================================

function calculateStandings(tournamentId) {
    /**
     * Calculate standings based on match results
     * Points: 3 for win, 1 for draw, 0 for loss
     */
    
    // Get all competitors in tournament
    const competitors = roundRobinSignups.filter(s => s.tournamentId === tournamentId);
    
    // Initialize or update standings
    let standings = roundRobinStandings.filter(s => s.tournamentId === tournamentId);
    
    // For new competitors, create standing entry
    competitors.forEach(comp => {
        if (!standings.find(s => s.competitorId === comp.id)) {
            standings.push({
                id: `standing_${Date.now()}_${Math.random()}`,
                tournamentId,
                competitorId: comp.id,
                wins: 0,
                losses: 0,
                draws: 0,
                points: 0,
                rank: 0
            });
        }
    });
    
    // Reset counters
    standings.forEach(s => {
        s.wins = 0;
        s.losses = 0;
        s.draws = 0;
        s.points = 0;
    });
    
    // Get completed matches
    const completedMatches = roundRobinMatches.filter(
        m => m.tournamentId === tournamentId && m.status === 'completed'
    );
    
    // Calculate results
    completedMatches.forEach(match => {
        const comp1Standing = standings.find(s => s.competitorId === match.competitor1Id);
        const comp2Standing = standings.find(s => s.competitorId === match.competitor2Id);
        
        if (!comp1Standing || !comp2Standing) return;
        
        if (match.winner === match.competitor1Id) {
            // Competitor 1 won
            comp1Standing.wins++;
            comp1Standing.points += 3;
            comp2Standing.losses++;
        } else if (match.winner === match.competitor2Id) {
            // Competitor 2 won
            comp2Standing.wins++;
            comp2Standing.points += 3;
            comp1Standing.losses++;
        } else {
            // Draw
            comp1Standing.draws++;
            comp1Standing.points += 1;
            comp2Standing.draws++;
            comp2Standing.points += 1;
        }
    });
    
    // Sort and rank
    standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        // Tiebreaker: win percentage
        const aWinPct = a.wins / Math.max(a.wins + a.losses + a.draws, 1);
        const bWinPct = b.wins / Math.max(b.wins + b.losses + b.draws, 1);
        return bWinPct - aWinPct;
    });
    
    // Assign ranks
    standings.forEach((s, idx) => {
        s.rank = idx + 1;
    });
    
    // Update global standings
    roundRobinStandings = roundRobinStandings.filter(s => s.tournamentId !== tournamentId);
    roundRobinStandings.push(...standings);
    
    return standings;
}

// ============================================================================
// 3. MATCH RESULT PROCESSING
// ============================================================================

function recordMatchResult(matchId, winner, loser) {
    /**
     * Record match result and update standings
     * PROTECTED: Only organizers can record results
     */
    if (!requireOrganizerAccess('record match result')) return false;
    
    const match = roundRobinMatches.find(m => m.id === matchId);
    if (!match) return false;
    
    // Validate competitors
    if (![match.competitor1Id, match.competitor2Id].includes(winner)) {
        return false;
    }
    
    const other = match.competitor1Id === winner ? match.competitor2Id : match.competitor1Id;
    
    // Update match
    match.winner = winner;
    match.loser = other;
    match.status = 'completed';
    
    // Recalculate standings
    calculateStandings(match.tournamentId);
    
    // Check if round is complete
    const roundMatches = roundRobinMatches.filter(
        m => m.tournamentId === match.tournamentId && m.round === match.round
    );
    const allComplete = roundMatches.every(m => m.status === 'completed');
    
    if (allComplete) {
        const tournament = roundRobinTournaments.find(t => t.id === match.tournamentId);
        if (tournament && tournament.currentRound < tournament.rounds) {
            // Auto-generate next round
            const nextRound = tournament.currentRound + 1;
            const nextMatches = generateRoundPairings(match.tournamentId, nextRound);
            roundRobinMatches.push(...nextMatches);
            tournament.currentRound = nextRound;
            
            // Trigger email notification
            sendRoundScheduleNotification(match.tournamentId, nextRound);
        }
    }
    
    saveData();
    
    // Sync to Firestore and re-render
    if (typeof syncDataToFirestore === 'function') {
        syncDataToFirestore().catch(err => console.warn('Sync failed:', err));
    }
    if (typeof renderTournaments === 'function') {
        renderTournaments();
    }
    
    return true;
}

// ============================================================================
// 4. TOURNAMENT CREATION
// ============================================================================

function createRoundRobinTournament(name, rounds, maxCompetitors, signupDeadline, emailNotifications) {
    /**
     * Create new round robin tournament
     * PROTECTED: Only organizers can create tournaments
     */
    if (!requireOrganizerAccess('create tournament')) return null;
    
    const tournament = {
        id: `rr_${Date.now()}`,
        name,
        sport: currentSport,
        rounds: parseInt(rounds),
        maxCompetitors: parseInt(maxCompetitors),
        signupDeadline: new Date(signupDeadline).toISOString(),
        emailNotifications: !!emailNotifications,
        createdAt: new Date().toISOString(),
        status: 'signup',
        currentRound: 0
    };
    
    roundRobinTournaments.push(tournament);
    saveData();
    
    // Sync to Firestore immediately and re-render
    if (typeof syncDataToFirestore === 'function') {
        syncDataToFirestore().catch(err => console.warn('Sync failed:', err));
    }
    if (typeof renderTournaments === 'function') {
        renderTournaments();
    }
    
    return tournament;
}

// ============================================================================
// 5. COMPETITOR SIGNUP
// ============================================================================

function addCompetitorSignup(tournamentId, name, email, gender, house) {
    /**
     * Register competitor for round robin tournament
     */
    
    const tournament = roundRobinTournaments.find(t => t.id === tournamentId);
    if (!tournament) return null;
    
    // Check max competitors
    const signupCount = roundRobinSignups.filter(s => s.tournamentId === tournamentId).length;
    if (signupCount >= tournament.maxCompetitors) {
        return null; // Tournament full
    }
    
    const signup = {
        id: `signup_${Date.now()}`,
        tournamentId,
        name,
        email,
        gender,
        house,
        signupDate: new Date().toISOString()
    };
    
    roundRobinSignups.push(signup);
    
    // Create standing entry
    const standing = {
        id: `standing_${Date.now()}`,
        tournamentId,
        competitorId: signup.id,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        rank: 0
    };
    roundRobinStandings.push(standing);
    
    saveData();
    
    // Sync to Firestore and re-render
    if (typeof syncDataToFirestore === 'function') {
        syncDataToFirestore().catch(err => console.warn('Sync failed:', err));
    }
    if (typeof renderTournaments === 'function') {
        renderTournaments();
    }
    
    return signup;
}

// ============================================================================
// 6. START TOURNAMENT
// ============================================================================

function startRoundRobinTournament(tournamentId) {
    /**
     * Start tournament and generate first round matches
     * PROTECTED: Only organizers can start tournaments
     */
    if (!requireOrganizerAccess('start tournament')) return false;
    
    const tournament = roundRobinTournaments.find(t => t.id === tournamentId);
    if (!tournament) return false;
    
    const signups = roundRobinSignups.filter(s => s.tournamentId === tournamentId);
    if (signups.length < 2) return false; // Need at least 2 competitors
    
    // Generate first round
    const round1Matches = generateRoundPairings(tournamentId, 1);
    roundRobinMatches.push(...round1Matches);
    
    // Update tournament status
    tournament.status = 'active';
    tournament.currentRound = 1;
    
    // Send initial notifications
    if (tournament.emailNotifications) {
        sendRoundScheduleNotification(tournamentId, 1);
    }
    
    saveData();
    
    // Sync to Firestore and re-render
    if (typeof syncDataToFirestore === 'function') {
        syncDataToFirestore().catch(err => console.warn('Sync failed:', err));
    }
    if (typeof renderTournaments === 'function') {
        renderTournaments();
    }
    
    return true;
}

// ============================================================================
// 7. EMAIL NOTIFICATIONS
// ============================================================================

function sendRoundScheduleNotification(tournamentId, round) {
    /**
     * Send schedule to all competitors via email
     * This calls the Firebase Cloud Function
     */
    
    const tournament = roundRobinTournaments.find(t => t.id === tournamentId);
    if (!tournament || !tournament.emailNotifications) return;
    
    const matches = roundRobinMatches.filter(
        m => m.tournamentId === tournamentId && m.round === round
    );
    
    const competitors = roundRobinSignups.filter(
        s => s.tournamentId === tournamentId
    );
    
    const standings = roundRobinStandings.filter(
        s => s.tournamentId === tournamentId
    ).sort((a, b) => a.rank - b.rank);
    
    // Email functionality disabled to keep on free Firebase tier
    console.log('📋 Round schedule generated - Email sending disabled');
}

// ============================================================================
// 8. PDF EXPORT
// ============================================================================

function exportSchedulePDF(tournamentId, round) {
    /**
     * Export round schedule and standings as PDF
     */
    // LOGIN CHECK: Only logged-in users can export
    if (!window.currentUser) {
        alert('❌ You must be logged in to export schedules.\n\nPlease log in first.');
        return;
    }
    
    if (typeof jsPDF === 'undefined') {
        alert('PDF library not loaded');
        return;
    }
    
    const tournament = roundRobinTournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 10;
    
    // Header
    doc.setFontSize(20);
    doc.text(`${tournament.name} - Round ${round}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.text(`Sport: ${currentSport}`, 10, yPosition);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 40, yPosition);
    yPosition += 10;
    
    // Matches
    doc.setFontSize(14);
    doc.text('Matches', 10, yPosition);
    yPosition += 8;
    
    const matches = roundRobinMatches.filter(
        m => m.tournamentId === tournamentId && m.round === round
    );
    
    doc.setFontSize(11);
    matches.forEach((match, idx) => {
        const comp1 = roundRobinSignups.find(s => s.id === match.competitor1Id);
        const comp2 = roundRobinSignups.find(s => s.id === match.competitor2Id);
        
        if (comp1 && comp2) {
            doc.text(`${idx + 1}. ${comp1.name} vs ${comp2.name}`, 15, yPosition);
            yPosition += 7;
            
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 10;
            }
        }
    });
    
    // Standings
    yPosition += 5;
    doc.setFontSize(14);
    doc.text('Current Standings', 10, yPosition);
    yPosition += 8;
    
    const standings = roundRobinStandings.filter(
        s => s.tournamentId === tournamentId
    ).sort((a, b) => a.rank - b.rank);
    
    doc.setFontSize(10);
    standings.forEach(standing => {
        const competitor = roundRobinSignups.find(s => s.id === standing.competitorId);
        if (competitor) {
            const text = `${standing.rank}. ${competitor.name} - ${standing.wins}W ${standing.losses}L ${standing.draws}D (${standing.points}pts)`;
            doc.text(text, 15, yPosition);
            yPosition += 6;
            
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 10;
            }
        }
    });
    
    doc.save(`${tournament.name}-round-${round}.pdf`);
}

// ============================================================================
// 9. QR CODE GENERATION
// ============================================================================

function generateSignupQRCode(tournamentId) {
    /**
     * Generate QR code for public signup page
     * Uses QR code generation library
     */
    
    const signupUrl = `${window.location.origin}/?roundRobinSignup=${tournamentId}&sport=${currentSport}`;
    
    // This assumes you have a QR code library loaded (e.g., qrcode.min.js)
    if (typeof QRCode !== 'undefined') {
        const qrCode = new QRCode(document.getElementById('qrCodeContainer'), {
            text: signupUrl,
            width: 200,
            height: 200
        });
        return signupUrl;
    }
    
    return signupUrl;
}

// ============================================================================
// 10. PUBLIC SIGNUP PAGE HANDLER
// ============================================================================

function renderPublicSignupPage(tournamentId) {
    /**
     * Render public signup form for given tournament
     */
    
    const tournament = roundRobinTournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    const signups = roundRobinSignups.filter(s => s.tournamentId === tournamentId);
    const isFull = signups.length >= tournament.maxCompetitors;
    
    let html = `
        <div class="max-w-2xl mx-auto">
            <div class="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl shadow-lg p-8 mb-6">
                <h1 class="text-3xl font-bold text-slate-900 mb-2">${tournament.name}</h1>
                <p class="text-slate-600 mb-4">🏸 ${currentSport.charAt(0).toUpperCase() + currentSport.slice(1)}</p>
                <p class="text-slate-700">Register for this round robin tournament</p>
                
                <div class="mt-4 p-4 bg-white rounded-lg">
                    <p class="text-sm text-slate-600">
                        <strong>Competitors Registered:</strong> ${signups.length} / ${tournament.maxCompetitors}
                    </p>
                </div>
            </div>
    `;
    
    if (!isFull) {
        html += `
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-bold text-slate-900 mb-6">Register Now</h2>
                <form onsubmit="handlePublicSignup('${tournamentId}', event)">
                    <div class="mb-4">
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                        <input type="text" name="name" required class="w-full px-4 py-2 border border-slate-300 rounded-lg">
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                        <input type="email" name="email" required class="w-full px-4 py-2 border border-slate-300 rounded-lg">
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Gender *</label>
                        <select name="gender" required class="w-full px-4 py-2 border border-slate-300 rounded-lg">
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Mixed">Mixed</option>
                        </select>
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-semibold text-slate-700 mb-2">House *</label>
                        <select name="house" required class="w-full px-4 py-2 border border-slate-300 rounded-lg">
                            <option value="">Select House</option>
                            ${houses.map(h => `<option value="${h.name}">${h.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <button type="submit" class="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg">
                        Register for Tournament
                    </button>
                </form>
            </div>
        `;
    } else {
        html += `
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
                <p class="text-yellow-800 font-semibold">Tournament is Full</p>
                <p class="text-yellow-700 text-sm mt-2">Registration is currently closed. Please try another tournament.</p>
            </div>
        `;
    }
    
    // Show registered competitors
    if (signups.length > 0) {
        html += `
            <div class="bg-white rounded-xl shadow-lg p-8 mt-6">
                <h3 class="text-xl font-bold text-slate-900 mb-4">Registered Competitors</h3>
                <div class="space-y-2">
                    ${signups.map(s => `
                        <div class="p-3 bg-slate-50 rounded">
                            <p class="font-semibold text-slate-900">${s.name}</p>
                            <p class="text-sm text-slate-600">${s.gender} • ${s.house}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    return html;
}

function handlePublicSignup(tournamentId, event) {
    event.preventDefault();
    
    const form = event.target;
    const signup = addCompetitorSignup(
        tournamentId,
        form.name.value,
        form.email.value,
        form.gender.value,
        form.house.value
    );
    
    if (signup) {
        // Save signup to localStorage
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`${currentSport}_roundRobinSignups`, JSON.stringify(roundRobinSignups));
        }
        
        alert('Successfully registered! You will receive match details via email.');
        form.reset();
        
        // Refresh page to show updated competitor count
        setTimeout(() => location.reload(), 1500);
    } else {
        alert('Registration failed. Please try again.');
    }
}

// ============================================================================
// Export for use in main app
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateRoundPairings,
        calculateStandings,
        recordMatchResult,
        createRoundRobinTournament,
        addCompetitorSignup,
        startRoundRobinTournament,
        sendRoundScheduleNotification,
        exportSchedulePDF,
        generateSignupQRCode,
        renderPublicSignupPage,
        handlePublicSignup
    };
}
