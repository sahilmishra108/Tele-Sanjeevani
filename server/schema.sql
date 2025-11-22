CREATE DATABASE IF NOT EXISTS vitalview;

USE vitalview;

-- Drop tables if they exist to ensure clean slate
DROP TABLE IF EXISTS vitals;

DROP TABLE IF EXISTS beds;

DROP TABLE IF EXISTS patients;

-- Patient Table
CREATE TABLE patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL COMMENT 'Full name of the patient',
    age INT NOT NULL CHECK (
        age >= 0
        AND age <= 150
    ) COMMENT 'Patient age in years',
    gender ENUM('Male', 'Female', 'Other') NOT NULL COMMENT 'Patient gender',
    diagnosis VARCHAR(200) NOT NULL COMMENT 'Primary diagnosis or condition',
    admission_date DATE NOT NULL COMMENT 'Date of admission to the facility',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    INDEX idx_admission_date (admission_date),
    INDEX idx_patient_name (patient_name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Patient demographic and admission information';

-- Bed Table (patient_id foreign key)
CREATE TABLE beds (
    bed_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    FOREIGN KEY (patient_id) REFERENCES patients (patient_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Bed assignments';

-- Vitals Table (linked to patient)
CREATE TABLE vitals (
    vital_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL COMMENT 'Reference to patient',
    hr INT CHECK (
        hr >= 0
        AND hr <= 300
    ) COMMENT 'Heart rate in bpm',
    pulse INT CHECK (
        pulse >= 0
        AND pulse <= 300
    ) COMMENT 'Pulse rate in bpm',
    spo2 INT CHECK (
        spo2 >= 0
        AND spo2 <= 100
    ) COMMENT 'Oxygen saturation percentage',
    abp VARCHAR(20) COMMENT 'Arterial blood pressure (systolic/diastolic/mean)',
    pap VARCHAR(20) COMMENT 'Pulmonary artery pressure (systolic/diastolic/mean)',
    etco2 INT CHECK (
        etco2 >= 0
        AND etco2 <= 100
    ) COMMENT 'End-tidal CO2 in mmHg',
    awrr INT CHECK (
        awrr >= 0
        AND awrr <= 60
    ) COMMENT 'Airway respiratory rate per minute',
    source VARCHAR(50) COMMENT 'Data source: camera, video, manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Vital signs measurement timestamp',
    FOREIGN KEY (patient_id) REFERENCES patients (patient_id) ON DELETE CASCADE,
    INDEX idx_patient_created (patient_id, created_at),
    INDEX idx_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Patient vital signs monitoring data';

-- Seed Data
INSERT INTO
    patients (
        patient_name,
        age,
        gender,
        diagnosis,
        admission_date
    )
VALUES (
        'John Doe',
        45,
        'Male',
        'Hypertension',
        '2023-10-01'
    ),
    (
        'Jane Smith',
        32,
        'Female',
        'Pneumonia',
        '2023-10-02'
    ),
    (
        'Michael Johnson',
        58,
        'Male',
        'Diabetes Type 2',
        '2023-10-03'
    ),
    (
        'Emily Davis',
        24,
        'Female',
        'Asthma',
        '2023-10-04'
    ),
    (
        'Robert Brown',
        67,
        'Male',
        'Heart Failure',
        '2023-10-05'
    ),
    (
        'Linda Wilson',
        51,
        'Female',
        'COPD',
        '2023-10-06'
    ),
    (
        'William Taylor',
        72,
        'Male',
        'Stroke Recovery',
        '2023-10-07'
    ),
    (
        'Sarah Moore',
        29,
        'Female',
        'Post-Surgery',
        '2023-10-08'
    ),
    (
        'David Anderson',
        40,
        'Male',
        'COVID-19',
        '2023-10-09'
    ),
    (
        'Jennifer Thomas',
        35,
        'Female',
        'Sepsis',
        '2023-10-10'
    ),
    (
        'James Jackson',
        60,
        'Male',
        'Cardiac Arrest',
        '2023-10-11'
    );

INSERT INTO
    beds (patient_id)
VALUES (1),
    (2),
    (3),
    (4),
    (5),
    (6),
    (7),
    (8),
    (9),
    (10),
    (11);