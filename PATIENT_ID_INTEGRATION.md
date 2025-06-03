# Patient ID Integration with Oracle System

## Overview

This document explains how our Hospital Management System integrates with the existing Oracle system by using the Oracle-generated patient IDs as primary keys in our database.

## Implementation Details

1. **Database Schema**:

   - The `patients` table uses `patientId` (string) as the primary key instead of an auto-incremented integer
   - All foreign key references to patients use `patientId` string format
   - Migration file `20250603_10_update_patient_primary_key.js` handles the transition for existing data

2. **API Changes**:

   - When creating new patients, a valid Oracle-generated `patientId` must be provided
   - All endpoints that reference patients use the Oracle ID in the URL (e.g., `/api/patients/:id`)

3. **Model Changes**:

   - The `Patient` model has been updated to use `patientId` as the primary identifier
   - Legacy methods have been maintained for backward compatibility
   - The `findById` method now looks up patients by `patientId`

4. **Error Handling**:
   - Patient creation will fail if no Oracle `patientId` is provided
   - Proper error messages have been added to guide users

## For Developers

When working with patient data, remember:

- Never generate your own patient IDs
- Always use the Oracle-provided ID
- Don't attempt to modify the `patientId` after creation
- When querying by ID, use the Oracle ID format

## Migration Process

To apply these changes to an existing database:

```
npm run migrate
```

If you need to rollback these changes:

```
npm run migrate:rollback
```
