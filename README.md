# 🏅 BIDD-Sport Tournament Manager

A comprehensive web-based tournament management system for organizing sports events, tracking competitors, and managing real-time scoring. Built with vanilla JavaScript and Firebase.

## 🌟 Features

### Tournament Management
- ✅ Create and manage multiple tournaments
- ✅ Support for different sports (Athletics, Swimming, etc.)
- ✅ Tournament scheduling and date management
- ✅ House-based competitions

### Event Management
- ✅ Create track and field events
- ✅ Open events with manual competitor entry
- ✅ Record management (Male/Female/Age Group records)
- ✅ Event categorization and settings

### Competitor Management
- ✅ Bulk import from CSV
- ✅ Individual competitor enrollment
- ✅ Gender and age group tracking
- ✅ House assignment

### Scoring & Results
- ✅ Real-time result entry
- ✅ Position and time/distance tracking
- ✅ Record tracking and breaking
- ✅ Heat management for multiple rounds

### Advanced Features
- ✅ Organizer role-based access control
- ✅ Audit logging for all changes
- ✅ Undo/Redo system
- ✅ Cloud sync with Firestore
- ✅ Offline support with service worker
- ✅ Public signup pages for competitors
- ✅ Export to PDF reports

## 🚀 Quick Start

### Development Login (Fast)
```javascript
// Open browser console (F12) and run:
devLogin.setPassword("your-password")  // First time only

// Then press: Ctrl+Shift+L  (or Cmd+Shift+L on Mac)
// Or type: devLogin.login()
```

### Manual Setup
1. Open `index.html` in a web browser
2. Sign in with your organizer account
3. Create a tournament
4. Add events and competitors
5. Start recording results

## 📋 Project Structure

```
BIDD-Sport V2/
├── index.html                    # Main application
├── organizer-manager.js          # Organizer & permission system
├── round-robin.js               # Tournament logic
├── undo-redo.js                 # Undo/Redo system
├── widget.js                    # Mobile widget system
├── service-worker.js            # Offline support
├── functions/                   # Firebase Cloud Functions
├── firebase.json                # Firebase config
├── manifest.json                # PWA manifest
└── documents/                   # Documentation
    ├── START_HERE.md            # Getting started guide
    ├── ORGANIZER_MANAGEMENT_GUIDE.md
    ├── DATA_RECOVERY_AND_IMPORT.md
    └── TROUBLESHOOTING_*.md     # Troubleshooting guides
```

## 🔧 Technology Stack

- **Frontend**: Vanilla JavaScript, Tailwind CSS
- **Database**: Firebase Firestore + Realtime Database
- **Authentication**: Firebase Auth REST API
- **Offline**: Service Worker
- **Build**: PWA (Progressive Web App)

## 📱 Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🔐 Security

- Email-based authentication
- Role-based access control
- Permission-based feature gates
- Audit logging for all changes
- Firestore security rules

## 🗄️ Data Management

### Local Storage
- Tournaments, events, competitors
- Results and scoring data
- User preferences

### Cloud Sync
- One-way upload to Firestore
- Manual data backup/restore
- CSV import/export

## 📚 Documentation

- [START_HERE.md](./START_HERE.md) - Getting started guide
- [ORGANIZER_MANAGEMENT_GUIDE.md](./ORGANIZER_MANAGEMENT_GUIDE.md) - Full organizer features
- [DATA_RECOVERY_AND_IMPORT.md](./DATA_RECOVERY_AND_IMPORT.md) - Data management
- [TROUBLESHOOTING_*.md](.) - Common issues and solutions

## 🛠️ Development

### Local Development
1. Open `index.html` directly in browser
2. No build step required
3. Changes auto-reload

### Browser DevTools
```javascript
// Quick dev login (from console)
devLogin.help()

// View current tournament data
console.log({tournaments, events, competitors, results})

// Check Firebase sync status
console.log(firebaseInitialized)
```

## 🚀 Deployment

### Firebase Hosting
```bash
firebase login
firebase deploy
```

### Static Hosting
Simply upload all files to any web host.

## 📝 Firebase Configuration

Create `firebase.json` or use existing config:
```json
{
  "projectId": "your-project-id",
  "appId": "your-app-id",
  "databaseURL": "https://your-project.firebaseio.com",
  "storageBucket": "your-project.appspot.com"
}
```

## 🐛 Known Issues

None currently documented. See [TROUBLESHOOTING_*.md](.) files for solutions to common issues.

## 📄 License

[Add your license here]

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a pull request

## 📞 Support

For issues and questions:
1. Check the [documentation](./START_HERE.md)
2. Review [troubleshooting guides](./TROUBLESHOOTING_NO_TOURNAMENTS.md)
3. Open an issue on GitHub

---

**Last Updated**: February 18, 2026

**Version**: 1.0.0

**Maintained by**: BIDD-Sport Team
