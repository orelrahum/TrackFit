# Water Tracking Feature

## Overview
The water tracking system allows users to monitor their daily water intake and track progress towards hydration goals.

## Components

### WaterTracker.tsx
- Main component for water intake tracking
- Location: `src/components/WaterTracker.tsx`
- Features:
  - Visual representation of daily water intake
  - Quick add/remove water amounts
  - Progress towards daily goal
  - Interactive water tracking interface

## Services

### water-service.ts
- Location: `src/lib/water-service.ts`
- Responsibilities:
  - CRUD operations for water intake
  - Daily water summaries
  - Integration with Supabase
  - Water goal calculations

## Key Workflows

### Tracking Water Intake
1. User views current water intake in WaterTracker
2. Quick buttons for common amounts (e.g., glass, bottle)
3. User can add custom amounts
4. Visual feedback shows progress
5. Data syncs with Supabase

### Managing Daily Goals
1. Goals set in user preferences
2. Progress updates in real-time
3. Visual indicators for goal completion
4. Integration with overall daily targets

## Database Integration

### Water Tracking Table
```sql
-- Tracks daily water intake per user
-- Stores:
--   - Amount in ml
--   - Timestamp
--   - User ID
```

## Integration Points

### Progress Tracking
- Contributes to daily health metrics
- Integrated with ProgressBar component
- Part of daily summary statistics

### User Targets
- Water goals are part of user's daily targets
- Syncs with target-service.ts
- Displays in TargetSummary component

## UI/UX Features

### Visual Feedback
- Progress indicators
- Color coding for goal progress
- Intuitive increment/decrement controls

### Responsive Design
- Mobile-friendly interface
- Easy tap targets for quick updates
- Accessible controls

## Dependencies
- Supabase for data persistence
- UI components from shadcn/ui
- Integration with user preferences
- Progress tracking system
