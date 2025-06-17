export function up(knex) {
  return knex.raw(`
    -- Add indexes only if they don't exist
    CREATE INDEX IF NOT EXISTS idx_prescriptions_date_status ON prescriptions (date, status);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at ON prescriptions ("createdAt");
    CREATE INDEX IF NOT EXISTS idx_patients_fullname ON patients ("firstName", "lastName");
    CREATE INDEX IF NOT EXISTS idx_patients_cnic ON patients (cnic);
    CREATE INDEX IF NOT EXISTS idx_patients_contact ON patients (contact);
    CREATE INDEX IF NOT EXISTS idx_patients_age_gender ON patients ("dateOfBirth", gender);
    CREATE INDEX IF NOT EXISTS idx_medical_history_updated ON medical_history ("updatedAt");
  `);
}

export function down(knex) {
  return knex.raw(`
    DROP INDEX IF EXISTS idx_prescriptions_date_status;
    DROP INDEX IF EXISTS idx_prescriptions_created_at;
    DROP INDEX IF EXISTS idx_patients_fullname;
    DROP INDEX IF EXISTS idx_patients_cnic;
    DROP INDEX IF EXISTS idx_patients_contact;
    DROP INDEX IF EXISTS idx_patients_age_gender;
    DROP INDEX IF EXISTS idx_medical_history_updated;
  `);
}
