# MoodSpace - Navigation & User Flow

## FlutterFlow Navigation Setup

### Bottom Navigation Bar Structure
Create a 4-tab bottom navigation with these screens:
1. **Home** (🏠) - Dashboard and daily check-in
2. **Journal** (📝) - Writing and entries history  
3. **Insights** (📊) - Weekly trends and AI analysis
4. **Resources** (💚) - Help and support tools

### Navigation Flow Logic

#### Primary User Journey
```
Onboarding → Home Dashboard → Mood Check-in → Journal Entry → Save & Return to Home
```

#### Daily Flow
```
App Launch → Home → Quick Mood Selection → Optional Journal → View Insights
```

#### Weekly Flow  
```
Home → Insights Tab → Review Weekly Trends → Read AI Suggestions → Return to Home
```

### Screen Transitions
- **Onboarding**: Horizontal page view with smooth transitions
- **Mood Selection**: Modal overlay from home screen
- **Journal Entry**: Full-screen push with slide-up animation
- **Insights**: Tab navigation with fade transition
- **Resources**: Tab navigation with immediate access

### FlutterFlow Implementation
1. **Create Bottom Navigation Bar Widget**
   - 4 tabs with icons and labels
   - Active state highlighting
   - Badge notifications for insights

2. **Set Up Page Routes**
   - Home: `/home` (default)
   - Journal: `/journal` 
   - Insights: `/insights`
   - Resources: `/resources`

3. **Modal Overlays**
   - Mood selector: Modal from home
   - Journal entry: Full-screen modal
   - Settings: Slide-in drawer

4. **Deep Linking**
   - Direct access to journal entry
   - Quick mood check-in shortcut
   - Crisis resources immediate access

### User Experience Considerations
- **One-Tap Access**: Most common actions (mood, journal) accessible in 1 tap
- **Gentle Transitions**: Smooth, calming animations between screens
- **Back Navigation**: Clear exit paths from all screens
- **Emergency Access**: Crisis resources always accessible from any screen
- **Privacy Gestures**: Quick app lock/hide functionality

### State Management
- Preserve user input during navigation
- Auto-save journal drafts
- Remember last mood entry
- Maintain insights cache for offline viewing
