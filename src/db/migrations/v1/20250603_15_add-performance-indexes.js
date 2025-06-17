export function up(knex) {
  return knex.raw(`
    -- Create indexes only if they don't exist
    
    -- Prescriptions indexes
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_prescriptions_date_status') THEN
        CREATE INDEX idx_prescriptions_date_status ON prescriptions (date, status);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_prescriptions_created_at') THEN
        CREATE INDEX idx_prescriptions_created_at ON prescriptions ("createdAt");
      END IF;
    END $$;
    
    -- Patients indexes
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_patients_fullname') THEN
        CREATE INDEX idx_patients_fullname ON patients ("firstName", "lastName");
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_patients_cnic') THEN
        CREATE INDEX idx_patients_cnic ON patients (cnic);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_patients_contact') THEN
        CREATE INDEX idx_patients_contact ON patients (contact);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_patients_age_gender') THEN
        CREATE INDEX idx_patients_age_gender ON patients ("dateOfBirth", gender);
      END IF;
    END $$;
    
    -- Medical history indexes
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_medical_history_patient') THEN
        CREATE INDEX idx_medical_history_patient ON medical_history ("patientId");
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_medical_history_updated') THEN
        CREATE INDEX idx_medical_history_updated ON medical_history ("updatedAt");
      END IF;
    END $$;
  `);
}

export function down(knex) {
  return knex.schema
    .alterTable("prescriptions", (table) => {
      table.dropIndex([], "idx_prescriptions_date_status");
      table.dropIndex([], "idx_prescriptions_created_at");
    })
    .then(() => {
      return knex.schema.alterTable("patients", (table) => {
        table.dropIndex([], "idx_patients_fullname");
        table.dropIndex([], "idx_patients_cnic");
        table.dropIndex([], "idx_patients_contact");
        table.dropIndex([], "idx_patients_age_gender");
      });
    })
    .then(() => {
      return knex.schema.alterTable("medical_history", (table) => {
        table.dropIndex([], "idx_medical_history_patient");
        table.dropIndex([], "idx_medical_history_updated");
      });
    });
}
