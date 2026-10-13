import crypto from 'crypto';
import { prisma, checkDatabaseConnection } from '@chikitsaalye/database';
import type {
  Department,
  Subdepartment,
  StaffProfile,
  DoctorProfile,
  Ward,
  Room,
  Bed,
  HospitalService,
  InvestigationMaster,
  MedicineMaster,
  DiagnosisMaster,
  ProcedureMaster,
  TariffMaster,
  InsuranceProviderMaster,
  GovernmentSchemeMaster,
  BedStatus,
  BedType,
  DepartmentType,
  ProfessionalRole,
  WardType,
  RoomType,
  ServiceCategory,
  InvestigationCategory,
  SpecimenSampleType,
  DosageForm,
  MedicineUnit,
  DiagnosisCodingSystem,
  ProcedureCategory,
  TariffRateType,
  AuthContext,
} from '@chikitsaalye/types';
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateSubdepartmentInput,
  UpdateSubdepartmentInput,
  CreateStaffProfileInput,
  UpdateStaffProfileInput,
  CreateDoctorProfileInput,
  UpdateDoctorProfileInput,
  CreateWardInput,
  UpdateWardInput,
  CreateRoomInput,
  UpdateRoomInput,
  CreateBedInput,
  UpdateBedInput,
  UpdateBedStatusInput,
  CreateHospitalServiceInput,
  UpdateHospitalServiceInput,
  CreateInvestigationMasterInput,
  UpdateInvestigationMasterInput,
  CreateMedicineMasterInput,
  UpdateMedicineMasterInput,
  CreateDiagnosisMasterInput,
  UpdateDiagnosisMasterInput,
  CreateProcedureMasterInput,
  UpdateProcedureMasterInput,
  CreateTariffMasterInput,
  UpdateTariffMasterInput,
  CreateInsuranceProviderMasterInput,
  UpdateInsuranceProviderMasterInput,
  CreateGovernmentSchemeMasterInput,
  UpdateGovernmentSchemeMasterInput,
} from '@chikitsaalye/validation';
import { NotFoundError, ConflictError, ValidationError } from '../../middleware/errors.js';
import { auditService } from '../../services/audit.service.js';

export interface MasterDataSummary {
  hospital: {
    id: string;
    code: string;
    name: string;
    city: string;
    state: string;
  };
  counts: {
    departments: number;
    subdepartments: number;
    staffProfiles: number;
    doctorProfiles: number;
    wards: number;
    rooms: number;
    beds: number;
    bedsAvailable: number;
    bedsOccupied: number;
    bedsCleaning: number;
    bedsReserved: number;
    bedsMaintenance: number;
    services: number;
    investigations: number;
    medicines: number;
    diagnoses: number;
    procedures: number;
    tariffs: number;
    insuranceProviders: number;
    schemes: number;
  };
}

export class MasterDataService {
  // In-memory data store for testing and disconnected environments
  private departments = new Map<string, Department>();
  private subdepartments = new Map<string, Subdepartment>();
  private staffProfiles = new Map<string, StaffProfile>();
  private doctorProfiles = new Map<string, DoctorProfile>();
  private wards = new Map<string, Ward>();
  private rooms = new Map<string, Room>();
  private beds = new Map<string, Bed>();
  private services = new Map<string, HospitalService>();
  private investigations = new Map<string, InvestigationMaster>();
  private medicines = new Map<string, MedicineMaster>();
  private diagnoses = new Map<string, DiagnosisMaster>();
  private procedures = new Map<string, ProcedureMaster>();
  private tariffs = new Map<string, TariffMaster>();
  private insuranceProviders = new Map<string, InsuranceProviderMaster>();
  private schemes = new Map<string, GovernmentSchemeMaster>();

  constructor() {
    this.seedDefaultData();
  }

  private logAudit(
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, unknown>,
    auth?: AuthContext
  ) {
    auditService.logEvent({
      actor: {
        id: auth?.userId || 'system',
        type: auth ? 'USER' : 'SYSTEM',
        department: auth?.department || undefined,
      },
      action,
      resource,
      resourceId,
      requestId: auth?.requestId || `req_${Date.now()}`,
      metadata,
    });
  }

  // --------------------------------------------------------------------------
  // Seed UPUMS Teaching Hospital Master Data
  // --------------------------------------------------------------------------
  private seedDefaultData() {
    const now = new Date();

    // 1. Departments
    const depts: Department[] = [
      { id: 'dept-gen-med', hospitalId: 'UPUMS-MAIN', code: 'GEN_MED', name: 'General Medicine', type: 'CLINICAL', description: 'Internal Medicine, adult inpatient and outpatient clinics', headOfDepartmentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'dept-gen-surg', hospitalId: 'UPUMS-MAIN', code: 'GEN_SURG', name: 'General Surgery', type: 'CLINICAL', description: 'Comprehensive operative and surgical care', headOfDepartmentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'dept-cardio', hospitalId: 'UPUMS-MAIN', code: 'CARDIO', name: 'Cardiology', type: 'CLINICAL', description: 'Interventional and non-invasive cardiovascular medicine', headOfDepartmentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'dept-pedia', hospitalId: 'UPUMS-MAIN', code: 'PEDIA', name: 'Pediatrics & Neonatology', type: 'CLINICAL', description: 'Infant, child, and adolescent healthcare', headOfDepartmentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'dept-ortho', hospitalId: 'UPUMS-MAIN', code: 'ORTHO', name: 'Orthopedics', type: 'CLINICAL', description: 'Bone, joint, trauma and reconstructive orthopedics', headOfDepartmentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'dept-obgyn', hospitalId: 'UPUMS-MAIN', code: 'OBGYN', name: 'Obstetrics & Gynecology', type: 'CLINICAL', description: 'Maternal-fetal health and gynecology services', headOfDepartmentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'dept-emerg', hospitalId: 'UPUMS-MAIN', code: 'EMERGENCY', name: 'Emergency & Trauma', type: 'CLINICAL', description: '24x7 Level 1 Trauma Care and Resuscitation', headOfDepartmentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'dept-icu', hospitalId: 'UPUMS-MAIN', code: 'ICU_CCM', name: 'Critical Care Medicine (ICU)', type: 'CLINICAL', description: 'Intensive care, life support and mechanical ventilation', headOfDepartmentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'dept-path', hospitalId: 'UPUMS-MAIN', code: 'PATHOLOGY', name: 'Pathology & Laboratory Medicine', type: 'DIAGNOSTIC', description: 'Clinical biochemistry, hematology, microbiology and histopathology', headOfDepartmentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'dept-radio', hospitalId: 'UPUMS-MAIN', code: 'RADIOLOGY', name: 'Radiodiagnosis & Imaging', type: 'DIAGNOSTIC', description: 'Digital X-ray, Ultrasound, CT, and MRI diagnostics', headOfDepartmentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'dept-pharm', hospitalId: 'UPUMS-MAIN', code: 'PHARMACY', name: 'Hospital Pharmacy & Stores', type: 'SUPPORT', description: 'Central inpatient dispensing and retail pharmacy stores', headOfDepartmentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'dept-admin', hospitalId: 'UPUMS-MAIN', code: 'HOSP_ADMIN', name: 'Hospital Administration & Billing', type: 'ADMINISTRATIVE', description: 'Governance, patient registration, billing and insurance desks', headOfDepartmentId: null, isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const d of depts) this.departments.set(d.id, d);

    // 2. Subdepartments
    const subdepts: Subdepartment[] = [
      { id: 'sub-card-noninv', departmentId: 'dept-cardio', code: 'CARD_NON_INV', name: 'Non-Invasive Cardiology (ECG/ECHO)', description: 'Diagnostic non-invasive cardiac testing', isActive: true, createdAt: now, updatedAt: now },
      { id: 'sub-med-neuro', departmentId: 'dept-gen-med', code: 'NEURO_MED', name: 'Neurology Clinic', description: 'Adult neurology disorders', isActive: true, createdAt: now, updatedAt: now },
      { id: 'sub-ped-neo', departmentId: 'dept-pedia', code: 'NEONATOLOGY', name: 'Neonatal Intensive Care (NICU)', description: 'Specialized pre-term and neonatal care', isActive: true, createdAt: now, updatedAt: now },
      { id: 'sub-path-histo', departmentId: 'dept-path', code: 'HISTOPATH', name: 'Histopathology & Cytology', description: 'Biopsy and cytology tissue examinations', isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const s of subdepts) this.subdepartments.set(s.id, s);

    // 3. Staff & Doctor Profiles
    const staff: StaffProfile[] = [
      { id: 'staff-dr-sharma', userId: 'usr-doctor-sharma', staffCode: 'DOC-MED-001', departmentId: 'dept-gen-med', professionalRole: 'DOCTOR', designation: 'Senior Consultant & Professor', phone: '+91 98765 43210', email: 'sharma.sk@upums.ac.in', isActive: true, createdAt: now, updatedAt: now },
      { id: 'staff-dr-gupta', userId: 'usr-doctor-gupta', staffCode: 'DOC-SURG-001', departmentId: 'dept-gen-surg', professionalRole: 'DOCTOR', designation: 'Associate Professor & Surgical Head', phone: '+91 98765 43211', email: 'gupta.rk@upums.ac.in', isActive: true, createdAt: now, updatedAt: now },
      { id: 'staff-nurse-anita', userId: 'usr-nurse-anita', staffCode: 'NUR-EMER-001', departmentId: 'dept-emerg', professionalRole: 'NURSE', designation: 'Senior Nursing Officer', phone: '+91 98765 43212', email: 'anita.roy@upums.ac.in', isActive: true, createdAt: now, updatedAt: now },
      { id: 'staff-tech-vikram', userId: 'usr-tech-vikram', staffCode: 'LAB-TECH-001', departmentId: 'dept-path', professionalRole: 'LAB_TECHNICIAN', designation: 'Chief Medical Lab Technologist', phone: '+91 98765 43213', email: 'vikram.singh@upums.ac.in', isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const st of staff) this.staffProfiles.set(st.id, st);

    const doctors: DoctorProfile[] = [
      { id: 'doc-sharma', staffProfileId: 'staff-dr-sharma', departmentId: 'dept-gen-med', medicalCouncilRegistrationNumber: 'UP-MCI-48921', specialization: 'Internal Medicine', qualifications: 'MBBS, MD (Medicine), FIAMS', opdRoomNumber: 'OPD-102', consultationFee: 100, isActive: true, createdAt: now, updatedAt: now },
      { id: 'doc-gupta', staffProfileId: 'staff-dr-gupta', departmentId: 'dept-gen-surg', medicalCouncilRegistrationNumber: 'UP-MCI-31450', specialization: 'General & Laparoscopic Surgery', qualifications: 'MBBS, MS (General Surgery), FMAS', opdRoomNumber: 'OPD-105', consultationFee: 150, isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const doc of doctors) this.doctorProfiles.set(doc.id, doc);

    // 4. Wards
    const wrds: Ward[] = [
      { id: 'ward-emer-01', hospitalId: 'UPUMS-MAIN', departmentId: 'dept-emerg', code: 'WARD_EMER_01', name: 'Emergency Resuscitation & Observation Ward', wardType: 'EMERGENCY', floor: 'Ground Floor, Block A', genderAllowed: 'ALL', totalBeds: 20, isActive: true, createdAt: now, updatedAt: now },
      { id: 'ward-mmw-01', hospitalId: 'UPUMS-MAIN', departmentId: 'dept-gen-med', code: 'WARD_MMW_01', name: 'Male Medical Ward 1', wardType: 'GENERAL', floor: '2nd Floor, Block B', genderAllowed: 'MALE', totalBeds: 30, isActive: true, createdAt: now, updatedAt: now },
      { id: 'ward-fmw-01', hospitalId: 'UPUMS-MAIN', departmentId: 'dept-gen-med', code: 'WARD_FMW_01', name: 'Female Medical Ward 1', wardType: 'GENERAL', floor: '2nd Floor, Block B', genderAllowed: 'FEMALE', totalBeds: 30, isActive: true, createdAt: now, updatedAt: now },
      { id: 'ward-msw-01', hospitalId: 'UPUMS-MAIN', departmentId: 'dept-gen-surg', code: 'WARD_MSW_01', name: 'Male Surgical Ward', wardType: 'GENERAL', floor: '3rd Floor, Block B', genderAllowed: 'MALE', totalBeds: 25, isActive: true, createdAt: now, updatedAt: now },
      { id: 'ward-ticu-01', hospitalId: 'UPUMS-MAIN', departmentId: 'dept-icu', code: 'WARD_TICU_01', name: 'Trauma & Surgical Intensive Care Unit', wardType: 'ICU', floor: '1st Floor, Critical Wing', genderAllowed: 'ALL', totalBeds: 12, isActive: true, createdAt: now, updatedAt: now },
      { id: 'ward-ped-01', hospitalId: 'UPUMS-MAIN', departmentId: 'dept-pedia', code: 'WARD_PED_01', name: 'Pediatric Inpatient Ward', wardType: 'PEDIATRIC', floor: '4th Floor, Mother & Child Wing', genderAllowed: 'ALL', totalBeds: 20, isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const w of wrds) this.wards.set(w.id, w);

    // 5. Rooms
    const rms: Room[] = [
      { id: 'rm-emer-bay-a', wardId: 'ward-emer-01', code: 'RM_EMER_BAY_A', name: 'Emergency Bay A (Trauma & Resus)', roomType: 'ICU_BAY', maxOccupancy: 6, isActive: true, createdAt: now, updatedAt: now },
      { id: 'rm-mmw-101', wardId: 'ward-mmw-01', code: 'RM_MMW_101', name: 'MMW Bay 101', roomType: 'GENERAL', maxOccupancy: 6, isActive: true, createdAt: now, updatedAt: now },
      { id: 'rm-ticu-main', wardId: 'ward-ticu-01', code: 'RM_TICU_MAIN', name: 'Trauma ICU Central Bay', roomType: 'ICU_BAY', maxOccupancy: 6, isActive: true, createdAt: now, updatedAt: now },
      { id: 'rm-pvt-201', wardId: 'ward-mmw-01', code: 'RM_PVT_201', name: 'Private Room 201', roomType: 'PRIVATE', maxOccupancy: 1, isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const r of rms) this.rooms.set(r.id, r);

    // 6. Beds
    const bds: Bed[] = [
      { id: 'bed-emr-01', wardId: 'ward-emer-01', roomId: 'rm-emer-bay-a', code: 'BED_EMR_01', name: 'Emergency Trolley 01', bedType: 'TRAUMA_BAY', status: 'AVAILABLE', dailyRate: 200, isActive: true, createdAt: now, updatedAt: now },
      { id: 'bed-emr-02', wardId: 'ward-emer-01', roomId: 'rm-emer-bay-a', code: 'BED_EMR_02', name: 'Emergency Trolley 02', bedType: 'TRAUMA_BAY', status: 'OCCUPIED', dailyRate: 200, isActive: true, createdAt: now, updatedAt: now },
      { id: 'bed-emr-03', wardId: 'ward-emer-01', roomId: 'rm-emer-bay-a', code: 'BED_EMR_03', name: 'Emergency Trolley 03', bedType: 'TRAUMA_BAY', status: 'CLEANING', dailyRate: 200, isActive: true, createdAt: now, updatedAt: now },
      { id: 'bed-mmw-101-1', wardId: 'ward-mmw-01', roomId: 'rm-mmw-101', code: 'BED_MMW_101_1', name: 'Bed 101-1', bedType: 'STANDARD', status: 'AVAILABLE', dailyRate: 150, isActive: true, createdAt: now, updatedAt: now },
      { id: 'bed-mmw-101-2', wardId: 'ward-mmw-01', roomId: 'rm-mmw-101', code: 'BED_MMW_101_2', name: 'Bed 101-2', bedType: 'STANDARD', status: 'OCCUPIED', dailyRate: 150, isActive: true, createdAt: now, updatedAt: now },
      { id: 'bed-ticu-01', wardId: 'ward-ticu-01', roomId: 'rm-ticu-main', code: 'BED_TICU_01', name: 'ICU Bed 01 (Ventilator)', bedType: 'ICU_VENTILATOR', status: 'OCCUPIED', dailyRate: 2500, isActive: true, createdAt: now, updatedAt: now },
      { id: 'bed-ticu-02', wardId: 'ward-ticu-01', roomId: 'rm-ticu-main', code: 'BED_TICU_02', name: 'ICU Bed 02 (Ventilator)', bedType: 'ICU_VENTILATOR', status: 'AVAILABLE', dailyRate: 2500, isActive: true, createdAt: now, updatedAt: now },
      { id: 'bed-pvt-201', wardId: 'ward-mmw-01', roomId: 'rm-pvt-201', code: 'BED_PVT_201', name: 'Deluxe Private Bed 201', bedType: 'STANDARD', status: 'AVAILABLE', dailyRate: 1200, isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const b of bds) this.beds.set(b.id, b);

    // 7. Hospital Services
    const srvs: HospitalService[] = [
      { id: 'srv-opd-gen', code: 'SRV_OPD_GEN', name: 'General OPD Consultation & Registration', description: 'Standard outpatient consultation fee', departmentId: 'dept-gen-med', category: 'CONSULTATION', isActive: true, createdAt: now, updatedAt: now },
      { id: 'srv-emr-tri', code: 'SRV_EMR_TRI', name: 'Emergency Triage & Primary Evaluation', description: 'Emergency resuscitation and initial evaluation', departmentId: 'dept-emerg', category: 'EMERGENCY', isActive: true, createdAt: now, updatedAt: now },
      { id: 'srv-icu-mon', code: 'SRV_ICU_MON', name: 'ICU Per-Day Monitoring & Life Support', description: 'Intensive care specialized clinical monitoring', departmentId: 'dept-icu', category: 'ICU', isActive: true, createdAt: now, updatedAt: now },
      { id: 'srv-nurs-gen', code: 'SRV_NURS_GEN', name: 'General Ward Nursing Care (Per Day)', description: 'Daily routine nursing station care', departmentId: 'dept-gen-med', category: 'NURSING', isActive: true, createdAt: now, updatedAt: now },
      { id: 'srv-bed-gen', code: 'SRV_BED_GEN', name: 'General Inpatient Bed Charge (Per Day)', description: 'Standard non-ICU ward accommodation', departmentId: 'dept-gen-med', category: 'GENERAL', isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const s of srvs) this.services.set(s.id, s);

    // 8. Investigations
    const invs: InvestigationMaster[] = [
      { id: 'inv-cbc', code: 'INV_CBC', name: 'Complete Blood Count (CBC) with Automated Differential', category: 'HEMATOLOGY', sampleType: 'BLOOD', departmentId: 'dept-path', turnaroundHours: 4, isActive: true, createdAt: now, updatedAt: now },
      { id: 'inv-lft', code: 'INV_LFT', name: 'Liver Function Test (LFT Profile)', category: 'BIOCHEMISTRY', sampleType: 'BLOOD', departmentId: 'dept-path', turnaroundHours: 6, isActive: true, createdAt: now, updatedAt: now },
      { id: 'inv-kft', code: 'INV_KFT', name: 'Kidney Function Test / Renal Profile (KFT)', category: 'BIOCHEMISTRY', sampleType: 'BLOOD', departmentId: 'dept-path', turnaroundHours: 6, isActive: true, createdAt: now, updatedAt: now },
      { id: 'inv-cxr-pa', code: 'INV_CXR_PA', name: 'Chest X-Ray (Posteroanterior View)', category: 'RADIOLOGY_XRAY', sampleType: 'NOT_APPLICABLE', departmentId: 'dept-radio', turnaroundHours: 2, isActive: true, createdAt: now, updatedAt: now },
      { id: 'inv-ct-brain', code: 'INV_CT_BRAIN', name: 'CT Scan Head / Brain (Plain)', category: 'RADIOLOGY_CT', sampleType: 'NOT_APPLICABLE', departmentId: 'dept-radio', turnaroundHours: 4, isActive: true, createdAt: now, updatedAt: now },
      { id: 'inv-usg-abd', code: 'INV_USG_ABD', name: 'Ultrasound Whole Abdomen and Pelvis', category: 'ULTRASOUND', sampleType: 'NOT_APPLICABLE', departmentId: 'dept-radio', turnaroundHours: 3, isActive: true, createdAt: now, updatedAt: now },
      { id: 'inv-ecg-12', code: 'INV_ECG_12', name: '12-Lead Electrocardiogram (ECG)', category: 'ECG', sampleType: 'NOT_APPLICABLE', departmentId: 'dept-cardio', turnaroundHours: 1, isActive: true, createdAt: now, updatedAt: now },
      { id: 'inv-urine-re', code: 'INV_URINE_RE', name: 'Urine Routine and Microscopic Examination', category: 'PATHOLOGY', sampleType: 'URINE', departmentId: 'dept-path', turnaroundHours: 3, isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const inv of invs) this.investigations.set(inv.id, inv);

    // 9. Medicines
    const meds: MedicineMaster[] = [
      { id: 'med-pcm-500', code: 'MED_PCM_500', genericName: 'Paracetamol', brandName: 'Dolo 500 / Calpol', dosageForm: 'TABLET', strength: '500', unit: 'MG', therapeuticCategory: 'Analgesic / Antipyretic', isHighAlert: false, isNarcotic: false, isActive: true, createdAt: now, updatedAt: now },
      { id: 'med-amox-625', code: 'MED_AMOX_625', genericName: 'Amoxicillin and Clavulanate Potassium', brandName: 'Augmentin 625 Duo', dosageForm: 'TABLET', strength: '625', unit: 'MG', therapeuticCategory: 'Broad-Spectrum Antibiotic', isHighAlert: false, isNarcotic: false, isActive: true, createdAt: now, updatedAt: now },
      { id: 'med-met-500', code: 'MED_MET_500', genericName: 'Metformin Hydrochloride', brandName: 'Glycomet 500', dosageForm: 'TABLET', strength: '500', unit: 'MG', therapeuticCategory: 'Oral Hypoglycemic / Antidiabetic', isHighAlert: false, isNarcotic: false, isActive: true, createdAt: now, updatedAt: now },
      { id: 'med-ceft-1g', code: 'MED_CEFT_1G', genericName: 'Ceftriaxone Sodium Injection', brandName: 'Monocef 1g Inj', dosageForm: 'INJECTION', strength: '1000', unit: 'MG', therapeuticCategory: 'Cephalosporin Antibiotic', isHighAlert: false, isNarcotic: false, isActive: true, createdAt: now, updatedAt: now },
      { id: 'med-pant-40', code: 'MED_PANT_40', genericName: 'Pantoprazole Gastro-resistant', brandName: 'Pan 40', dosageForm: 'TABLET', strength: '40', unit: 'MG', therapeuticCategory: 'Proton Pump Inhibitor', isHighAlert: false, isNarcotic: false, isActive: true, createdAt: now, updatedAt: now },
      { id: 'med-rl-500', code: 'MED_RL_500', genericName: "Ringer's Lactate Solution", brandName: 'RL Infusion 500ml', dosageForm: 'IV_FLUID', strength: '500', unit: 'ML', therapeuticCategory: 'Intravenous Crystalloid', isHighAlert: false, isNarcotic: false, isActive: true, createdAt: now, updatedAt: now },
      { id: 'med-tram-50', code: 'MED_TRAM_50', genericName: 'Tramadol Hydrochloride', brandName: 'Tramazac 50 Inj', dosageForm: 'INJECTION', strength: '50', unit: 'MG', therapeuticCategory: 'Opioid Analgesic', isHighAlert: true, isNarcotic: true, isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const m of meds) this.medicines.set(m.id, m);

    // 10. Diagnoses (ICD-10)
    const diags: DiagnosisMaster[] = [
      { id: 'diag-a09', code: 'A09', name: 'Infectious gastroenteritis and colitis, unspecified', codingSystem: 'ICD_10', category: 'Infectious Diseases', isChronic: false, isActive: true, createdAt: now, updatedAt: now },
      { id: 'diag-e11-9', code: 'E11.9', name: 'Type 2 diabetes mellitus without complications', codingSystem: 'ICD_10', category: 'Endocrine and Metabolic', isChronic: true, isActive: true, createdAt: now, updatedAt: now },
      { id: 'diag-i10', code: 'I10', name: 'Essential (primary) hypertension', codingSystem: 'ICD_10', category: 'Cardiovascular Diseases', isChronic: true, isActive: true, createdAt: now, updatedAt: now },
      { id: 'diag-j18-9', code: 'J18.9', name: 'Pneumonia, unspecified organism', codingSystem: 'ICD_10', category: 'Respiratory Diseases', isChronic: false, isActive: true, createdAt: now, updatedAt: now },
      { id: 'diag-k35-80', code: 'K35.80', name: 'Unspecified acute appendicitis', codingSystem: 'ICD_10', category: 'Digestive System / Acute Surgical', isChronic: false, isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const d of diags) this.diagnoses.set(d.id, d);

    // 11. Procedures
    const procs: ProcedureMaster[] = [
      { id: 'proc-intub', code: 'PROC_INTUB', name: 'Endotracheal Intubation & Airway Management', category: 'OTHER', departmentId: 'dept-emerg', typicalDurationMinutes: 20, isActive: true, createdAt: now, updatedAt: now },
      { id: 'proc-debrid', code: 'PROC_DEBRID', name: 'Wound Debridement and Suturing (Major)', category: 'MINOR_SURGERY', departmentId: 'dept-gen-surg', typicalDurationMinutes: 45, isActive: true, createdAt: now, updatedAt: now },
      { id: 'proc-appen', code: 'PROC_APPEN', name: 'Open / Laparoscopic Appendectomy', category: 'MAJOR_SURGERY', departmentId: 'dept-gen-surg', typicalDurationMinutes: 90, isActive: true, createdAt: now, updatedAt: now },
      { id: 'proc-cvc', code: 'PROC_CVC', name: 'Central Venous Catheter Insertion (CVC)', category: 'OTHER', departmentId: 'dept-icu', typicalDurationMinutes: 30, isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const p of procs) this.procedures.set(p.id, p);

    // 12. Tariffs
    const trfs: TariffMaster[] = [
      { id: 'trf-std-cbc', code: 'TRF_STD_CBC', name: 'Standard Rate: CBC Test', serviceId: null, investigationId: 'inv-cbc', procedureId: null, rateType: 'STANDARD', standardPrice: 250, schemePrice: 250, effectiveFrom: now, effectiveTo: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'trf-pmjay-cbc', code: 'TRF_PMJAY_CBC', name: 'PMJAY Rate: CBC Test', serviceId: null, investigationId: 'inv-cbc', procedureId: null, rateType: 'PMJAY_SCHEME', standardPrice: 250, schemePrice: 120, effectiveFrom: now, effectiveTo: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'trf-std-lft', code: 'TRF_STD_LFT', name: 'Standard Rate: LFT Test', serviceId: null, investigationId: 'inv-lft', procedureId: null, rateType: 'STANDARD', standardPrice: 450, schemePrice: 450, effectiveFrom: now, effectiveTo: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'trf-std-cxr', code: 'TRF_STD_CXR', name: 'Standard Rate: Chest X-Ray PA', serviceId: null, investigationId: 'inv-cxr-pa', procedureId: null, rateType: 'STANDARD', standardPrice: 300, schemePrice: 300, effectiveFrom: now, effectiveTo: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'trf-std-ct', code: 'TRF_STD_CT', name: 'Standard Rate: CT Scan Brain', serviceId: null, investigationId: 'inv-ct-brain', procedureId: null, rateType: 'STANDARD', standardPrice: 1800, schemePrice: 1800, effectiveFrom: now, effectiveTo: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'trf-std-opd', code: 'TRF_STD_OPD', name: 'Standard Rate: OPD Registration', serviceId: 'srv-opd-gen', investigationId: null, procedureId: null, rateType: 'STANDARD', standardPrice: 50, schemePrice: 50, effectiveFrom: now, effectiveTo: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'trf-std-appen', code: 'TRF_STD_APPEN', name: 'Standard Rate: Appendectomy Surgery', serviceId: null, investigationId: null, procedureId: 'proc-appen', rateType: 'STANDARD', standardPrice: 12000, schemePrice: 12000, effectiveFrom: now, effectiveTo: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'trf-pmjay-appen', code: 'TRF_PMJAY_APPEN', name: 'PMJAY Rate: Appendectomy Package', serviceId: null, investigationId: null, procedureId: 'proc-appen', rateType: 'PMJAY_SCHEME', standardPrice: 12000, schemePrice: 8500, effectiveFrom: now, effectiveTo: null, isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const t of trfs) this.tariffs.set(t.id, t);

    // 13. Insurance Providers
    const ins: InsuranceProviderMaster[] = [
      { id: 'ins-star', code: 'INS_STAR', name: 'Star Health and Allied Insurance Co.', tpaName: 'Star Health In-House TPA', contactPerson: 'Hospital Desk Executive', phone: '+91 1800 425 2255', email: 'cashless@starhealth.in', isActive: true, createdAt: now, updatedAt: now },
      { id: 'ins-icici', code: 'INS_ICICI', name: 'ICICI Lombard General Insurance', tpaName: 'Medi Assist Insurance TPA Pvt Ltd', contactPerson: 'Desk Lead', phone: '+91 1800 2666', email: 'hospitaldesk@icicilombard.com', isActive: true, createdAt: now, updatedAt: now },
      { id: 'ins-newindia', code: 'INS_NEWINDIA', name: 'The New India Assurance Co. Ltd.', tpaName: 'MDIndia Health Insurance TPA', contactPerson: 'TPA Coordinator', phone: '+91 1800 209 7700', email: 'support@mdindia.com', isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const i of ins) this.insuranceProviders.set(i.id, i);

    // 14. Government Schemes
    const sch: GovernmentSchemeMaster[] = [
      { id: 'sch-pmjay', code: 'SCH_PMJAY', name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)', nodalAgency: 'National Health Authority (NHA)', coverageCap: 500000, discountPercentage: 100, isActive: true, createdAt: now, updatedAt: now },
      { id: 'sch-mmjay', code: 'SCH_MMJAY', name: 'Mukhyamantri Jan Arogya Yojana (UP-MMJAY)', nodalAgency: 'State Health Agency (SHA) Uttar Pradesh', coverageCap: 500000, discountPercentage: 100, isActive: true, createdAt: now, updatedAt: now },
      { id: 'sch-echs', code: 'SCH_ECHS', name: 'Ex-Servicemen Contributory Health Scheme (ECHS)', nodalAgency: 'Department of Ex-Servicemen Welfare, MoD', coverageCap: 1000000, discountPercentage: 100, isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const s of sch) this.schemes.set(s.id, s);
  }

  // --------------------------------------------------------------------------
  // Summary & Stats
  // --------------------------------------------------------------------------
  async getSummary(): Promise<MasterDataSummary> {
    const bedsArray = Array.from(this.beds.values()).filter((b) => b.isActive);
    return {
      hospital: {
        id: 'UPUMS-MAIN',
        code: 'UPUMS_SAIFAI',
        name: 'Uttar Pradesh University of Medical Sciences (UPUMS) Hospital',
        city: 'Saifai, Etawah',
        state: 'Uttar Pradesh',
      },
      counts: {
        departments: Array.from(this.departments.values()).filter((d) => d.isActive).length,
        subdepartments: Array.from(this.subdepartments.values()).filter((s) => s.isActive).length,
        staffProfiles: Array.from(this.staffProfiles.values()).filter((s) => s.isActive).length,
        doctorProfiles: Array.from(this.doctorProfiles.values()).filter((d) => d.isActive).length,
        wards: Array.from(this.wards.values()).filter((w) => w.isActive).length,
        rooms: Array.from(this.rooms.values()).filter((r) => r.isActive).length,
        beds: bedsArray.length,
        bedsAvailable: bedsArray.filter((b) => b.status === 'AVAILABLE').length,
        bedsOccupied: bedsArray.filter((b) => b.status === 'OCCUPIED').length,
        bedsCleaning: bedsArray.filter((b) => b.status === 'CLEANING').length,
        bedsReserved: bedsArray.filter((b) => b.status === 'RESERVED').length,
        bedsMaintenance: bedsArray.filter((b) => b.status === 'MAINTENANCE').length,
        services: Array.from(this.services.values()).filter((s) => s.isActive).length,
        investigations: Array.from(this.investigations.values()).filter((i) => i.isActive).length,
        medicines: Array.from(this.medicines.values()).filter((m) => m.isActive).length,
        diagnoses: Array.from(this.diagnoses.values()).filter((d) => d.isActive).length,
        procedures: Array.from(this.procedures.values()).filter((p) => p.isActive).length,
        tariffs: Array.from(this.tariffs.values()).filter((t) => t.isActive).length,
        insuranceProviders: Array.from(this.insuranceProviders.values()).filter((i) => i.isActive).length,
        schemes: Array.from(this.schemes.values()).filter((s) => s.isActive).length,
      },
    };
  }

  // --------------------------------------------------------------------------
  // Departments
  // --------------------------------------------------------------------------
  async listDepartments(filter?: { type?: DepartmentType; search?: string; isActive?: boolean }): Promise<Department[]> {
    let items = Array.from(this.departments.values());
    if (filter?.isActive !== undefined) {
      items = items.filter((d) => d.isActive === filter.isActive);
    }
    if (filter?.type) {
      items = items.filter((d) => d.type === filter.type);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q));
    }
    return items;
  }

  async getDepartmentById(idOrCode: string): Promise<Department> {
    const item = Array.from(this.departments.values()).find((d) => d.id === idOrCode || d.code === idOrCode);
    if (!item) {
      throw new NotFoundError(`Department '${idOrCode}' not found`);
    }
    return item;
  }

  async createDepartment(data: CreateDepartmentInput, auth?: AuthContext): Promise<Department> {
    const existing = Array.from(this.departments.values()).find((d) => d.code === data.code && d.isActive);
    if (existing) {
      throw new ConflictError(`Department code '${data.code}' is already registered.`);
    }

    const now = new Date();
    const dept: Department = {
      id: crypto.randomUUID(),
      hospitalId: 'UPUMS-MAIN',
      code: data.code,
      name: data.name,
      type: data.type as DepartmentType,
      description: data.description || null,
      headOfDepartmentId: data.headOfDepartmentId || null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.departments.set(dept.id, dept);

    this.logAudit('MASTER_CREATED', 'department', dept.id, { code: dept.code, name: dept.name, type: dept.type }, auth);

    return dept;
  }

  async updateDepartment(id: string, data: UpdateDepartmentInput, auth?: AuthContext): Promise<Department> {
    const dept = await this.getDepartmentById(id);
    if (data.code && data.code !== dept.code) {
      const conflict = Array.from(this.departments.values()).find((d) => d.code === data.code && d.id !== dept.id && d.isActive);
      if (conflict) {
        throw new ConflictError(`Department code '${data.code}' is already in use.`);
      }
    }

    const updated: Department = {
      ...dept,
      code: data.code ?? dept.code,
      name: data.name ?? dept.name,
      type: (data.type as DepartmentType) ?? dept.type,
      description: data.description !== undefined ? data.description : dept.description,
      headOfDepartmentId: data.headOfDepartmentId !== undefined ? data.headOfDepartmentId : dept.headOfDepartmentId,
      isActive: data.isActive ?? dept.isActive,
      updatedAt: new Date(),
    };
    this.departments.set(dept.id, updated);

    this.logAudit('MASTER_UPDATED', 'department', dept.id, { code: updated.code, name: updated.name }, auth);

    return updated;
  }

  async deactivateDepartment(id: string, auth?: AuthContext): Promise<Department> {
    const dept = await this.getDepartmentById(id);
    const deactivated: Department = { ...dept, isActive: false, updatedAt: new Date() };
    this.departments.set(dept.id, deactivated);

    this.logAudit('MASTER_DEACTIVATED', 'department', dept.id, { code: dept.code }, auth);

    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Subdepartments
  // --------------------------------------------------------------------------
  async listSubdepartments(filter?: { departmentId?: string; search?: string }): Promise<Subdepartment[]> {
    let items = Array.from(this.subdepartments.values()).filter((s) => s.isActive);
    if (filter?.departmentId) {
      items = items.filter((s) => s.departmentId === filter.departmentId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    }
    return items;
  }

  async getSubdepartmentById(idOrCode: string): Promise<Subdepartment> {
    const item = Array.from(this.subdepartments.values()).find((s) => s.id === idOrCode || s.code === idOrCode);
    if (!item) {
      throw new NotFoundError(`Subdepartment '${idOrCode}' not found`);
    }
    return item;
  }

  async createSubdepartment(data: CreateSubdepartmentInput, auth?: AuthContext): Promise<Subdepartment> {
    await this.getDepartmentById(data.departmentId);

    const existing = Array.from(this.subdepartments.values()).find((s) => s.code === data.code && s.isActive);
    if (existing) {
      throw new ConflictError(`Subdepartment code '${data.code}' is already registered.`);
    }

    const now = new Date();
    const subdept: Subdepartment = {
      id: crypto.randomUUID(),
      departmentId: data.departmentId,
      code: data.code,
      name: data.name,
      description: data.description || null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.subdepartments.set(subdept.id, subdept);

    this.logAudit('MASTER_CREATED', 'subdepartment', subdept.id, { code: subdept.code, departmentId: subdept.departmentId }, auth);

    return subdept;
  }

  async updateSubdepartment(id: string, data: UpdateSubdepartmentInput, auth?: AuthContext): Promise<Subdepartment> {
    const sub = await this.getSubdepartmentById(id);
    if (data.departmentId) {
      await this.getDepartmentById(data.departmentId);
    }
    if (data.code && data.code !== sub.code) {
      const conflict = Array.from(this.subdepartments.values()).find((s) => s.code === data.code && s.id !== sub.id && s.isActive);
      if (conflict) {
        throw new ConflictError(`Subdepartment code '${data.code}' is already in use.`);
      }
    }

    const updated: Subdepartment = {
      ...sub,
      departmentId: data.departmentId ?? sub.departmentId,
      code: data.code ?? sub.code,
      name: data.name ?? sub.name,
      description: data.description !== undefined ? data.description : sub.description,
      isActive: data.isActive ?? sub.isActive,
      updatedAt: new Date(),
    };
    this.subdepartments.set(sub.id, updated);
    return updated;
  }

  async deactivateSubdepartment(id: string, auth?: AuthContext): Promise<Subdepartment> {
    const sub = await this.getSubdepartmentById(id);
    const deactivated = { ...sub, isActive: false, updatedAt: new Date() };
    this.subdepartments.set(sub.id, deactivated);
    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Staff Profiles
  // --------------------------------------------------------------------------
  async listStaff(filter?: { departmentId?: string; role?: ProfessionalRole; search?: string }): Promise<StaffProfile[]> {
    let items = Array.from(this.staffProfiles.values()).filter((s) => s.isActive);
    if (filter?.departmentId) items = items.filter((s) => s.departmentId === filter.departmentId);
    if (filter?.role) items = items.filter((s) => s.professionalRole === filter.role);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((s) => s.designation.toLowerCase().includes(q) || s.staffCode.toLowerCase().includes(q));
    }
    return items;
  }

  async getStaffById(idOrCode: string): Promise<StaffProfile> {
    const item = Array.from(this.staffProfiles.values()).find((s) => s.id === idOrCode || s.staffCode === idOrCode);
    if (!item) {
      throw new NotFoundError(`Staff profile '${idOrCode}' not found`);
    }
    return item;
  }

  async createStaff(data: CreateStaffProfileInput, auth?: AuthContext): Promise<StaffProfile> {
    await this.getDepartmentById(data.departmentId);

    const existingCode = Array.from(this.staffProfiles.values()).find((s) => s.staffCode === data.staffCode && s.isActive);
    if (existingCode) {
      throw new ConflictError(`Staff code '${data.staffCode}' is already registered.`);
    }

    const existingUser = Array.from(this.staffProfiles.values()).find((s) => s.userId === data.userId && s.isActive);
    if (existingUser) {
      throw new ConflictError(`A staff profile is already linked to user '${data.userId}'.`);
    }

    const now = new Date();
    const stf: StaffProfile = {
      id: crypto.randomUUID(),
      userId: data.userId,
      staffCode: data.staffCode,
      departmentId: data.departmentId,
      subdepartmentId: data.subdepartmentId || null,
      professionalRole: data.professionalRole as ProfessionalRole,
      designation: data.designation,
      phone: data.phone || null,
      email: data.email || null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.staffProfiles.set(stf.id, stf);

    this.logAudit('MASTER_CREATED', 'staff_profile', stf.id, { staffCode: stf.staffCode, role: stf.professionalRole }, auth);

    return stf;
  }

  async updateStaff(id: string, data: UpdateStaffProfileInput, auth?: AuthContext): Promise<StaffProfile> {
    const stf = await this.getStaffById(id);
    if (data.departmentId) await this.getDepartmentById(data.departmentId);

    if (data.staffCode && data.staffCode !== stf.staffCode) {
      const conflict = Array.from(this.staffProfiles.values()).find((s) => s.staffCode === data.staffCode && s.id !== stf.id && s.isActive);
      if (conflict) {
        throw new ConflictError(`Staff code '${data.staffCode}' is already in use.`);
      }
    }

    const updated: StaffProfile = {
      ...stf,
      departmentId: data.departmentId ?? stf.departmentId,
      subdepartmentId: data.subdepartmentId !== undefined ? data.subdepartmentId : stf.subdepartmentId,
      professionalRole: (data.professionalRole as ProfessionalRole) ?? stf.professionalRole,
      designation: data.designation ?? stf.designation,
      phone: data.phone !== undefined ? data.phone : stf.phone,
      email: data.email !== undefined ? data.email : stf.email,
      isActive: data.isActive ?? stf.isActive,
      updatedAt: new Date(),
    };
    this.staffProfiles.set(stf.id, updated);
    return updated;
  }

  async deactivateStaff(id: string, auth?: AuthContext): Promise<StaffProfile> {
    const stf = await this.getStaffById(id);
    const deactivated = { ...stf, isActive: false, updatedAt: new Date() };
    this.staffProfiles.set(stf.id, deactivated);
    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Doctors
  // --------------------------------------------------------------------------
  async listDoctors(filter?: { departmentId?: string; specialization?: string; search?: string }): Promise<DoctorProfile[]> {
    let items = Array.from(this.doctorProfiles.values()).filter((d) => d.isActive);
    if (filter?.departmentId) items = items.filter((d) => d.departmentId === filter.departmentId);
    if (filter?.specialization) {
      const spec = filter.specialization.toLowerCase();
      items = items.filter((d) => d.specialization.toLowerCase().includes(spec));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((d) => d.specialization.toLowerCase().includes(q) || d.medicalCouncilRegistrationNumber.toLowerCase().includes(q));
    }
    return items;
  }

  async getDoctorById(idOrReg: string): Promise<DoctorProfile> {
    const item = Array.from(this.doctorProfiles.values()).find((d) => d.id === idOrReg || d.medicalCouncilRegistrationNumber === idOrReg);
    if (!item) {
      throw new NotFoundError(`Doctor profile '${idOrReg}' not found`);
    }
    return item;
  }

  async createDoctor(data: CreateDoctorProfileInput, auth?: AuthContext): Promise<DoctorProfile> {
    await this.getStaffById(data.staffProfileId);
    await this.getDepartmentById(data.departmentId);

    const existingReg = Array.from(this.doctorProfiles.values()).find((d) => d.medicalCouncilRegistrationNumber === data.medicalCouncilRegistrationNumber && d.isActive);
    if (existingReg) {
      throw new ConflictError(`Medical Council Registration '${data.medicalCouncilRegistrationNumber}' is already registered.`);
    }

    const existingStaffDoc = Array.from(this.doctorProfiles.values()).find((d) => d.staffProfileId === data.staffProfileId && d.isActive);
    if (existingStaffDoc) {
      throw new ConflictError(`Staff profile '${data.staffProfileId}' already has an active doctor profile.`);
    }

    const now = new Date();
    const doc: DoctorProfile = {
      id: crypto.randomUUID(),
      staffProfileId: data.staffProfileId,
      departmentId: data.departmentId,
      subdepartmentId: data.subdepartmentId || null,
      medicalCouncilRegistrationNumber: data.medicalCouncilRegistrationNumber,
      specialization: data.specialization,
      qualifications: data.qualifications,
      opdRoomNumber: data.opdRoomNumber || null,
      consultationFee: data.consultationFee ?? 0,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.doctorProfiles.set(doc.id, doc);

    this.logAudit('MASTER_CREATED', 'doctor_profile', doc.id, { regNo: doc.medicalCouncilRegistrationNumber, specialization: doc.specialization }, auth);

    return doc;
  }

  async updateDoctor(id: string, data: UpdateDoctorProfileInput, auth?: AuthContext): Promise<DoctorProfile> {
    const doc = await this.getDoctorById(id);
    if (data.departmentId) await this.getDepartmentById(data.departmentId);

    if (data.medicalCouncilRegistrationNumber && data.medicalCouncilRegistrationNumber !== doc.medicalCouncilRegistrationNumber) {
      const conflict = Array.from(this.doctorProfiles.values()).find((d) => d.medicalCouncilRegistrationNumber === data.medicalCouncilRegistrationNumber && d.id !== doc.id && d.isActive);
      if (conflict) {
        throw new ConflictError(`Registration number '${data.medicalCouncilRegistrationNumber}' is already registered.`);
      }
    }

    const updated: DoctorProfile = {
      ...doc,
      departmentId: data.departmentId ?? doc.departmentId,
      subdepartmentId: data.subdepartmentId !== undefined ? data.subdepartmentId : doc.subdepartmentId,
      medicalCouncilRegistrationNumber: data.medicalCouncilRegistrationNumber ?? doc.medicalCouncilRegistrationNumber,
      specialization: data.specialization ?? doc.specialization,
      qualifications: data.qualifications ?? doc.qualifications,
      opdRoomNumber: data.opdRoomNumber !== undefined ? data.opdRoomNumber : doc.opdRoomNumber,
      consultationFee: data.consultationFee !== undefined ? data.consultationFee : doc.consultationFee,
      isActive: data.isActive ?? doc.isActive,
      updatedAt: new Date(),
    };
    this.doctorProfiles.set(doc.id, updated);
    return updated;
  }

  async deactivateDoctor(id: string, auth?: AuthContext): Promise<DoctorProfile> {
    const doc = await this.getDoctorById(id);
    const deactivated = { ...doc, isActive: false, updatedAt: new Date() };
    this.doctorProfiles.set(doc.id, deactivated);
    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Wards
  // --------------------------------------------------------------------------
  async listWards(filter?: { departmentId?: string; wardType?: WardType; search?: string }): Promise<Ward[]> {
    let items = Array.from(this.wards.values()).filter((w) => w.isActive);
    if (filter?.departmentId) items = items.filter((w) => w.departmentId === filter.departmentId);
    if (filter?.wardType) items = items.filter((w) => w.wardType === filter.wardType);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((w) => w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q));
    }
    return items;
  }

  async getWardById(idOrCode: string): Promise<Ward> {
    const item = Array.from(this.wards.values()).find((w) => w.id === idOrCode || w.code === idOrCode);
    if (!item) throw new NotFoundError(`Ward '${idOrCode}' not found`);
    return item;
  }

  async createWard(data: CreateWardInput, auth?: AuthContext): Promise<Ward> {
    await this.getDepartmentById(data.departmentId);

    const existing = Array.from(this.wards.values()).find((w) => w.code === data.code && w.isActive);
    if (existing) throw new ConflictError(`Ward code '${data.code}' is already registered.`);

    const now = new Date();
    const ward: Ward = {
      id: crypto.randomUUID(),
      hospitalId: 'UPUMS-MAIN',
      departmentId: data.departmentId,
      code: data.code,
      name: data.name,
      wardType: (data.wardType as WardType) || 'GENERAL',
      floor: data.floor || null,
      genderAllowed: data.genderAllowed || 'ALL',
      totalBeds: data.totalBeds ?? 0,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.wards.set(ward.id, ward);

    this.logAudit('MASTER_CREATED', 'ward', ward.id, { code: ward.code, wardType: ward.wardType }, auth);

    return ward;
  }

  async updateWard(id: string, data: UpdateWardInput, auth?: AuthContext): Promise<Ward> {
    const ward = await this.getWardById(id);
    if (data.departmentId) await this.getDepartmentById(data.departmentId);

    if (data.code && data.code !== ward.code) {
      const conflict = Array.from(this.wards.values()).find((w) => w.code === data.code && w.id !== ward.id && w.isActive);
      if (conflict) throw new ConflictError(`Ward code '${data.code}' is already registered.`);
    }

    const updated: Ward = {
      ...ward,
      departmentId: data.departmentId ?? ward.departmentId,
      code: data.code ?? ward.code,
      name: data.name ?? ward.name,
      wardType: (data.wardType as WardType) ?? ward.wardType,
      floor: data.floor !== undefined ? data.floor : ward.floor,
      genderAllowed: data.genderAllowed ?? ward.genderAllowed,
      totalBeds: data.totalBeds !== undefined ? data.totalBeds : ward.totalBeds,
      isActive: data.isActive ?? ward.isActive,
      updatedAt: new Date(),
    };
    this.wards.set(ward.id, updated);
    return updated;
  }

  async deactivateWard(id: string, auth?: AuthContext): Promise<Ward> {
    const ward = await this.getWardById(id);
    const deactivated = { ...ward, isActive: false, updatedAt: new Date() };
    this.wards.set(ward.id, deactivated);
    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Rooms
  // --------------------------------------------------------------------------
  async listRooms(filter?: { wardId?: string; roomType?: RoomType; search?: string }): Promise<Room[]> {
    let items = Array.from(this.rooms.values()).filter((r) => r.isActive);
    if (filter?.wardId) items = items.filter((r) => r.wardId === filter.wardId);
    if (filter?.roomType) items = items.filter((r) => r.roomType === filter.roomType);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
    }
    return items;
  }

  async getRoomById(idOrCode: string): Promise<Room> {
    const item = Array.from(this.rooms.values()).find((r) => r.id === idOrCode || r.code === idOrCode);
    if (!item) throw new NotFoundError(`Room '${idOrCode}' not found`);
    return item;
  }

  async createRoom(data: CreateRoomInput, auth?: AuthContext): Promise<Room> {
    await this.getWardById(data.wardId);

    const existing = Array.from(this.rooms.values()).find((r) => r.code === data.code && r.isActive);
    if (existing) throw new ConflictError(`Room code '${data.code}' is already registered.`);

    const now = new Date();
    const rm: Room = {
      id: crypto.randomUUID(),
      wardId: data.wardId,
      code: data.code,
      name: data.name,
      roomType: (data.roomType as RoomType) || 'GENERAL',
      maxOccupancy: data.maxOccupancy ?? 1,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.rooms.set(rm.id, rm);

    this.logAudit('MASTER_CREATED', 'room', rm.id, { code: rm.code, wardId: rm.wardId }, auth);

    return rm;
  }

  async updateRoom(id: string, data: UpdateRoomInput, auth?: AuthContext): Promise<Room> {
    const rm = await this.getRoomById(id);
    if (data.wardId) await this.getWardById(data.wardId);

    if (data.code && data.code !== rm.code) {
      const conflict = Array.from(this.rooms.values()).find((r) => r.code === data.code && r.id !== rm.id && r.isActive);
      if (conflict) throw new ConflictError(`Room code '${data.code}' is already registered.`);
    }

    const updated: Room = {
      ...rm,
      wardId: data.wardId ?? rm.wardId,
      code: data.code ?? rm.code,
      name: data.name ?? rm.name,
      roomType: (data.roomType as RoomType) ?? rm.roomType,
      maxOccupancy: data.maxOccupancy !== undefined ? data.maxOccupancy : rm.maxOccupancy,
      isActive: data.isActive ?? rm.isActive,
      updatedAt: new Date(),
    };
    this.rooms.set(rm.id, updated);
    return updated;
  }

  async deactivateRoom(id: string, auth?: AuthContext): Promise<Room> {
    const rm = await this.getRoomById(id);
    const deactivated = { ...rm, isActive: false, updatedAt: new Date() };
    this.rooms.set(rm.id, deactivated);
    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Beds & Status Transitions
  // --------------------------------------------------------------------------
  async listBeds(filter?: { wardId?: string; roomId?: string; status?: BedStatus; bedType?: BedType; search?: string }): Promise<Bed[]> {
    let items = Array.from(this.beds.values()).filter((b) => b.isActive);
    if (filter?.wardId) items = items.filter((b) => b.wardId === filter.wardId);
    if (filter?.roomId) items = items.filter((b) => b.roomId === filter.roomId);
    if (filter?.status) items = items.filter((b) => b.status === filter.status);
    if (filter?.bedType) items = items.filter((b) => b.bedType === filter.bedType);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((b) => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q));
    }
    return items;
  }

  async getBedById(idOrCode: string): Promise<Bed> {
    const item = Array.from(this.beds.values()).find((b) => b.id === idOrCode || b.code === idOrCode);
    if (!item) throw new NotFoundError(`Bed '${idOrCode}' not found`);
    return item;
  }

  async createBed(data: CreateBedInput, auth?: AuthContext): Promise<Bed> {
    await this.getWardById(data.wardId);
    await this.getRoomById(data.roomId);

    const existing = Array.from(this.beds.values()).find((b) => b.code === data.code && b.isActive);
    if (existing) throw new ConflictError(`Bed code '${data.code}' is already registered.`);

    const now = new Date();
    const bed: Bed = {
      id: crypto.randomUUID(),
      wardId: data.wardId,
      roomId: data.roomId,
      code: data.code,
      name: data.name,
      bedType: (data.bedType as BedType) || 'STANDARD',
      status: (data.status as BedStatus) || 'AVAILABLE',
      dailyRate: data.dailyRate ?? 0,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.beds.set(bed.id, bed);

    this.logAudit('MASTER_CREATED', 'bed', bed.id, { code: bed.code, wardId: bed.wardId, bedType: bed.bedType, initialStatus: bed.status }, auth);

    return bed;
  }

  async updateBed(id: string, data: UpdateBedInput, auth?: AuthContext): Promise<Bed> {
    const bed = await this.getBedById(id);
    if (data.wardId) await this.getWardById(data.wardId);
    if (data.roomId) await this.getRoomById(data.roomId);

    if (data.code && data.code !== bed.code) {
      const conflict = Array.from(this.beds.values()).find((b) => b.code === data.code && b.id !== bed.id && b.isActive);
      if (conflict) throw new ConflictError(`Bed code '${data.code}' is already registered.`);
    }

    const previousStatus = bed.status;
    const newStatus = (data.status as BedStatus) ?? bed.status;

    const updated: Bed = {
      ...bed,
      wardId: data.wardId ?? bed.wardId,
      roomId: data.roomId ?? bed.roomId,
      code: data.code ?? bed.code,
      name: data.name ?? bed.name,
      bedType: (data.bedType as BedType) ?? bed.bedType,
      status: newStatus,
      dailyRate: data.dailyRate !== undefined ? data.dailyRate : bed.dailyRate,
      isActive: data.isActive ?? bed.isActive,
      updatedAt: new Date(),
    };
    this.beds.set(bed.id, updated);

    if (previousStatus !== newStatus) {
      this.logAudit('BED_STATUS_CHANGED', 'bed', bed.id, { bedCode: bed.code, previousStatus, newStatus }, auth);
    }

    return updated;
  }

  async updateBedStatus(id: string, input: UpdateBedStatusInput, auth?: AuthContext): Promise<Bed> {
    const bed = await this.getBedById(id);
    const validStatuses: BedStatus[] = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'RESERVED', 'MAINTENANCE'];
    if (!validStatuses.includes(input.status as BedStatus)) {
      throw new ValidationError(`Invalid bed status '${input.status}'. Allowed: ${validStatuses.join(', ')}`);
    }

    const previousStatus = bed.status;
    const updated: Bed = {
      ...bed,
      status: input.status as BedStatus,
      updatedAt: new Date(),
    };
    this.beds.set(bed.id, updated);

    this.logAudit('BED_STATUS_CHANGED', 'bed', bed.id, { bedCode: bed.code, previousStatus, newStatus: input.status, reason: input.reason || 'Routine status update' }, auth);

    return updated;
  }

  async deactivateBed(id: string, auth?: AuthContext): Promise<Bed> {
    const bed = await this.getBedById(id);
    const deactivated = { ...bed, isActive: false, updatedAt: new Date() };
    this.beds.set(bed.id, deactivated);
    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Hospital Services
  // --------------------------------------------------------------------------
  async listServices(filter?: { category?: ServiceCategory; departmentId?: string; search?: string }): Promise<HospitalService[]> {
    let items = Array.from(this.services.values()).filter((s) => s.isActive);
    if (filter?.category) items = items.filter((s) => s.category === filter.category);
    if (filter?.departmentId) items = items.filter((s) => s.departmentId === filter.departmentId);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    }
    return items;
  }

  async getServiceById(idOrCode: string): Promise<HospitalService> {
    const item = Array.from(this.services.values()).find((s) => s.id === idOrCode || s.code === idOrCode);
    if (!item) throw new NotFoundError(`Hospital Service '${idOrCode}' not found`);
    return item;
  }

  async createService(data: CreateHospitalServiceInput, auth?: AuthContext): Promise<HospitalService> {
    if (data.departmentId) await this.getDepartmentById(data.departmentId);

    const existing = Array.from(this.services.values()).find((s) => s.code === data.code && s.isActive);
    if (existing) throw new ConflictError(`Service code '${data.code}' is already registered.`);

    const now = new Date();
    const srv: HospitalService = {
      id: crypto.randomUUID(),
      code: data.code,
      name: data.name,
      description: data.description || null,
      departmentId: data.departmentId || null,
      category: (data.category as ServiceCategory) || 'GENERAL',
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.services.set(srv.id, srv);

    this.logAudit('MASTER_CREATED', 'hospital_service', srv.id, { code: srv.code, category: srv.category }, auth);

    return srv;
  }

  async updateService(id: string, data: UpdateHospitalServiceInput, auth?: AuthContext): Promise<HospitalService> {
    const srv = await this.getServiceById(id);
    if (data.departmentId) await this.getDepartmentById(data.departmentId);

    if (data.code && data.code !== srv.code) {
      const conflict = Array.from(this.services.values()).find((s) => s.code === data.code && s.id !== srv.id && s.isActive);
      if (conflict) throw new ConflictError(`Service code '${data.code}' is already registered.`);
    }

    const updated: HospitalService = {
      ...srv,
      code: data.code ?? srv.code,
      name: data.name ?? srv.name,
      description: data.description !== undefined ? data.description : srv.description,
      departmentId: data.departmentId !== undefined ? data.departmentId : srv.departmentId,
      category: (data.category as ServiceCategory) ?? srv.category,
      isActive: data.isActive ?? srv.isActive,
      updatedAt: new Date(),
    };
    this.services.set(srv.id, updated);
    return updated;
  }

  async deactivateService(id: string, auth?: AuthContext): Promise<HospitalService> {
    const srv = await this.getServiceById(id);
    const deactivated = { ...srv, isActive: false, updatedAt: new Date() };
    this.services.set(srv.id, deactivated);
    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Investigations (Lab & Radiology Master)
  // --------------------------------------------------------------------------
  async listInvestigations(filter?: { category?: InvestigationCategory; departmentId?: string; search?: string }): Promise<InvestigationMaster[]> {
    let items = Array.from(this.investigations.values()).filter((i) => i.isActive);
    if (filter?.category) items = items.filter((i) => i.category === filter.category);
    if (filter?.departmentId) items = items.filter((i) => i.departmentId === filter.departmentId);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q));
    }
    return items;
  }

  async getInvestigationById(idOrCode: string): Promise<InvestigationMaster> {
    const item = Array.from(this.investigations.values()).find((i) => i.id === idOrCode || i.code === idOrCode);
    if (!item) throw new NotFoundError(`Investigation '${idOrCode}' not found`);
    return item;
  }

  async createInvestigation(data: CreateInvestigationMasterInput, auth?: AuthContext): Promise<InvestigationMaster> {
    if (data.departmentId) await this.getDepartmentById(data.departmentId);

    const existing = Array.from(this.investigations.values()).find((i) => i.code === data.code && i.isActive);
    if (existing) throw new ConflictError(`Investigation code '${data.code}' is already registered.`);

    const now = new Date();
    const inv: InvestigationMaster = {
      id: crypto.randomUUID(),
      code: data.code,
      name: data.name,
      category: (data.category as InvestigationCategory) || 'PATHOLOGY',
      sampleType: (data.sampleType as SpecimenSampleType) || 'NOT_APPLICABLE',
      departmentId: data.departmentId || null,
      turnaroundHours: data.turnaroundHours ?? 24,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.investigations.set(inv.id, inv);

    this.logAudit('MASTER_CREATED', 'investigation_master', inv.id, { code: inv.code, category: inv.category }, auth);

    return inv;
  }

  async updateInvestigation(id: string, data: UpdateInvestigationMasterInput, auth?: AuthContext): Promise<InvestigationMaster> {
    const inv = await this.getInvestigationById(id);
    if (data.departmentId) await this.getDepartmentById(data.departmentId);

    if (data.code && data.code !== inv.code) {
      const conflict = Array.from(this.investigations.values()).find((i) => i.code === data.code && i.id !== inv.id && i.isActive);
      if (conflict) throw new ConflictError(`Investigation code '${data.code}' is already registered.`);
    }

    const updated: InvestigationMaster = {
      ...inv,
      code: data.code ?? inv.code,
      name: data.name ?? inv.name,
      category: (data.category as InvestigationCategory) ?? inv.category,
      sampleType: (data.sampleType as SpecimenSampleType) ?? inv.sampleType,
      departmentId: data.departmentId !== undefined ? data.departmentId : inv.departmentId,
      turnaroundHours: data.turnaroundHours ?? inv.turnaroundHours,
      isActive: data.isActive ?? inv.isActive,
      updatedAt: new Date(),
    };
    this.investigations.set(inv.id, updated);
    return updated;
  }

  async deactivateInvestigation(id: string, auth?: AuthContext): Promise<InvestigationMaster> {
    const inv = await this.getInvestigationById(id);
    const deactivated = { ...inv, isActive: false, updatedAt: new Date() };
    this.investigations.set(inv.id, deactivated);
    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Medicines (Pharmacy Master)
  // --------------------------------------------------------------------------
  async listMedicines(filter?: { dosageForm?: DosageForm; search?: string; isNarcotic?: boolean }): Promise<MedicineMaster[]> {
    let items = Array.from(this.medicines.values()).filter((m) => m.isActive);
    if (filter?.dosageForm) items = items.filter((m) => m.dosageForm === filter.dosageForm);
    if (filter?.isNarcotic !== undefined) items = items.filter((m) => m.isNarcotic === filter.isNarcotic);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((m) => m.genericName.toLowerCase().includes(q) || (m.brandName && m.brandName.toLowerCase().includes(q)) || m.code.toLowerCase().includes(q));
    }
    return items;
  }

  async getMedicineById(idOrCode: string): Promise<MedicineMaster> {
    const item = Array.from(this.medicines.values()).find((m) => m.id === idOrCode || m.code === idOrCode);
    if (!item) throw new NotFoundError(`Medicine '${idOrCode}' not found`);
    return item;
  }

  async createMedicine(data: CreateMedicineMasterInput, auth?: AuthContext): Promise<MedicineMaster> {
    const existing = Array.from(this.medicines.values()).find((m) => m.code === data.code && m.isActive);
    if (existing) throw new ConflictError(`Medicine code '${data.code}' is already registered.`);

    const now = new Date();
    const med: MedicineMaster = {
      id: crypto.randomUUID(),
      code: data.code,
      genericName: data.genericName,
      brandName: data.brandName || null,
      dosageForm: (data.dosageForm as DosageForm) || 'TABLET',
      strength: data.strength,
      unit: (data.unit as MedicineUnit) || 'MG',
      therapeuticCategory: data.therapeuticCategory || null,
      isHighAlert: data.isHighAlert ?? false,
      isNarcotic: data.isNarcotic ?? false,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.medicines.set(med.id, med);

    this.logAudit('MASTER_CREATED', 'medicine_master', med.id, { code: med.code, generic: med.genericName, form: med.dosageForm }, auth);

    return med;
  }

  async updateMedicine(id: string, data: UpdateMedicineMasterInput, auth?: AuthContext): Promise<MedicineMaster> {
    const med = await this.getMedicineById(id);

    if (data.code && data.code !== med.code) {
      const conflict = Array.from(this.medicines.values()).find((m) => m.code === data.code && m.id !== med.id && m.isActive);
      if (conflict) throw new ConflictError(`Medicine code '${data.code}' is already registered.`);
    }

    const updated: MedicineMaster = {
      ...med,
      code: data.code ?? med.code,
      genericName: data.genericName ?? med.genericName,
      brandName: data.brandName !== undefined ? data.brandName : med.brandName,
      dosageForm: (data.dosageForm as DosageForm) ?? med.dosageForm,
      strength: data.strength ?? med.strength,
      unit: (data.unit as MedicineUnit) ?? med.unit,
      therapeuticCategory: data.therapeuticCategory !== undefined ? data.therapeuticCategory : med.therapeuticCategory,
      isHighAlert: data.isHighAlert ?? med.isHighAlert,
      isNarcotic: data.isNarcotic ?? med.isNarcotic,
      isActive: data.isActive ?? med.isActive,
      updatedAt: new Date(),
    };
    this.medicines.set(med.id, updated);
    return updated;
  }

  async deactivateMedicine(id: string, auth?: AuthContext): Promise<MedicineMaster> {
    const med = await this.getMedicineById(id);
    const deactivated = { ...med, isActive: false, updatedAt: new Date() };
    this.medicines.set(med.id, deactivated);
    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Diagnoses (ICD / Disease Master)
  // --------------------------------------------------------------------------
  async listDiagnoses(filter?: { codingSystem?: DiagnosisCodingSystem; isChronic?: boolean; search?: string }): Promise<DiagnosisMaster[]> {
    let items = Array.from(this.diagnoses.values()).filter((d) => d.isActive);
    if (filter?.codingSystem) items = items.filter((d) => d.codingSystem === filter.codingSystem);
    if (filter?.isChronic !== undefined) items = items.filter((d) => d.isChronic === filter.isChronic);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q));
    }
    return items;
  }

  async getDiagnosisById(idOrCode: string): Promise<DiagnosisMaster> {
    const item = Array.from(this.diagnoses.values()).find((d) => d.id === idOrCode || d.code === idOrCode);
    if (!item) throw new NotFoundError(`Diagnosis '${idOrCode}' not found`);
    return item;
  }

  async createDiagnosis(data: CreateDiagnosisMasterInput, auth?: AuthContext): Promise<DiagnosisMaster> {
    const existing = Array.from(this.diagnoses.values()).find((d) => d.code === data.code && d.isActive);
    if (existing) throw new ConflictError(`Diagnosis code '${data.code}' is already registered.`);

    const now = new Date();
    const diag: DiagnosisMaster = {
      id: crypto.randomUUID(),
      code: data.code,
      name: data.name,
      codingSystem: (data.codingSystem as DiagnosisCodingSystem) || 'ICD_10',
      category: data.category || null,
      isChronic: data.isChronic ?? false,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.diagnoses.set(diag.id, diag);

    this.logAudit('MASTER_CREATED', 'diagnosis_master', diag.id, { code: diag.code, name: diag.name }, auth);

    return diag;
  }

  async updateDiagnosis(id: string, data: UpdateDiagnosisMasterInput, auth?: AuthContext): Promise<DiagnosisMaster> {
    const diag = await this.getDiagnosisById(id);

    if (data.code && data.code !== diag.code) {
      const conflict = Array.from(this.diagnoses.values()).find((d) => d.code === data.code && d.id !== diag.id && d.isActive);
      if (conflict) throw new ConflictError(`Diagnosis code '${data.code}' is already registered.`);
    }

    const updated: DiagnosisMaster = {
      ...diag,
      code: data.code ?? diag.code,
      name: data.name ?? diag.name,
      codingSystem: (data.codingSystem as DiagnosisCodingSystem) ?? diag.codingSystem,
      category: data.category !== undefined ? data.category : diag.category,
      isChronic: data.isChronic ?? diag.isChronic,
      isActive: data.isActive ?? diag.isActive,
      updatedAt: new Date(),
    };
    this.diagnoses.set(diag.id, updated);
    return updated;
  }

  async deactivateDiagnosis(id: string, auth?: AuthContext): Promise<DiagnosisMaster> {
    const diag = await this.getDiagnosisById(id);
    const deactivated = { ...diag, isActive: false, updatedAt: new Date() };
    this.diagnoses.set(diag.id, deactivated);
    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Procedures (Surgical / Clinical Master)
  // --------------------------------------------------------------------------
  async listProcedures(filter?: { category?: ProcedureCategory; departmentId?: string; search?: string }): Promise<ProcedureMaster[]> {
    let items = Array.from(this.procedures.values()).filter((p) => p.isActive);
    if (filter?.category) items = items.filter((p) => p.category === filter.category);
    if (filter?.departmentId) items = items.filter((p) => p.departmentId === filter.departmentId);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
    }
    return items;
  }

  async getProcedureById(idOrCode: string): Promise<ProcedureMaster> {
    const item = Array.from(this.procedures.values()).find((p) => p.id === idOrCode || p.code === idOrCode);
    if (!item) throw new NotFoundError(`Procedure '${idOrCode}' not found`);
    return item;
  }

  async createProcedure(data: CreateProcedureMasterInput, auth?: AuthContext): Promise<ProcedureMaster> {
    if (data.departmentId) await this.getDepartmentById(data.departmentId);

    const existing = Array.from(this.procedures.values()).find((p) => p.code === data.code && p.isActive);
    if (existing) throw new ConflictError(`Procedure code '${data.code}' is already registered.`);

    const now = new Date();
    const proc: ProcedureMaster = {
      id: crypto.randomUUID(),
      code: data.code,
      name: data.name,
      category: (data.category as ProcedureCategory) || 'OTHER',
      departmentId: data.departmentId || null,
      typicalDurationMinutes: data.typicalDurationMinutes ?? 60,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.procedures.set(proc.id, proc);

    this.logAudit('MASTER_CREATED', 'procedure_master', proc.id, { code: proc.code, name: proc.name, category: proc.category }, auth);

    return proc;
  }

  async updateProcedure(id: string, data: UpdateProcedureMasterInput, auth?: AuthContext): Promise<ProcedureMaster> {
    const proc = await this.getProcedureById(id);
    if (data.departmentId) await this.getDepartmentById(data.departmentId);

    if (data.code && data.code !== proc.code) {
      const conflict = Array.from(this.procedures.values()).find((p) => p.code === data.code && p.id !== proc.id && p.isActive);
      if (conflict) throw new ConflictError(`Procedure code '${data.code}' is already registered.`);
    }

    const updated: ProcedureMaster = {
      ...proc,
      code: data.code ?? proc.code,
      name: data.name ?? proc.name,
      category: (data.category as ProcedureCategory) ?? proc.category,
      departmentId: data.departmentId !== undefined ? data.departmentId : proc.departmentId,
      typicalDurationMinutes: data.typicalDurationMinutes ?? proc.typicalDurationMinutes,
      isActive: data.isActive ?? proc.isActive,
      updatedAt: new Date(),
    };
    this.procedures.set(proc.id, updated);
    return updated;
  }

  async deactivateProcedure(id: string, auth?: AuthContext): Promise<ProcedureMaster> {
    const proc = await this.getProcedureById(id);
    const deactivated = { ...proc, isActive: false, updatedAt: new Date() };
    this.procedures.set(proc.id, deactivated);
    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Tariffs & Price Management
  // --------------------------------------------------------------------------
  async listTariffs(filter?: { rateType?: TariffRateType; search?: string }): Promise<TariffMaster[]> {
    let items = Array.from(this.tariffs.values()).filter((t) => t.isActive);
    if (filter?.rateType) items = items.filter((t) => t.rateType === filter.rateType);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
    }
    return items;
  }

  async getTariffById(idOrCode: string): Promise<TariffMaster> {
    const item = Array.from(this.tariffs.values()).find((t) => t.id === idOrCode || t.code === idOrCode);
    if (!item) throw new NotFoundError(`Tariff '${idOrCode}' not found`);
    return item;
  }

  async createTariff(data: CreateTariffMasterInput, auth?: AuthContext): Promise<TariffMaster> {
    if (!data.serviceId && !data.investigationId && !data.procedureId) {
      throw new ValidationError('A tariff entry must be linked to at least one Service, Investigation, or Procedure.');
    }
    if (data.serviceId) await this.getServiceById(data.serviceId);
    if (data.investigationId) await this.getInvestigationById(data.investigationId);
    if (data.procedureId) await this.getProcedureById(data.procedureId);

    const existing = Array.from(this.tariffs.values()).find((t) => t.code === data.code && t.isActive);
    if (existing) throw new ConflictError(`Tariff code '${data.code}' is already registered.`);

    const now = new Date();
    const trf: TariffMaster = {
      id: crypto.randomUUID(),
      code: data.code,
      name: data.name,
      serviceId: data.serviceId || null,
      investigationId: data.investigationId || null,
      procedureId: data.procedureId || null,
      rateType: (data.rateType as TariffRateType) || 'STANDARD',
      standardPrice: data.standardPrice ?? 0,
      schemePrice: data.schemePrice ?? 0,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : now,
      effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.tariffs.set(trf.id, trf);

    this.logAudit('TARIFF_CHANGED', 'tariff_master', trf.id, { code: trf.code, rateType: trf.rateType, standardPrice: trf.standardPrice, schemePrice: trf.schemePrice }, auth);

    return trf;
  }

  async updateTariff(id: string, data: UpdateTariffMasterInput, auth?: AuthContext): Promise<TariffMaster> {
    const trf = await this.getTariffById(id);

    if (data.code && data.code !== trf.code) {
      const conflict = Array.from(this.tariffs.values()).find((t) => t.code === data.code && t.id !== trf.id && t.isActive);
      if (conflict) throw new ConflictError(`Tariff code '${data.code}' is already registered.`);
    }
    if (data.serviceId) await this.getServiceById(data.serviceId);
    if (data.investigationId) await this.getInvestigationById(data.investigationId);
    if (data.procedureId) await this.getProcedureById(data.procedureId);

    const oldStandard = trf.standardPrice;
    const oldScheme = trf.schemePrice;

    const updated: TariffMaster = {
      ...trf,
      code: data.code ?? trf.code,
      name: data.name ?? trf.name,
      serviceId: data.serviceId !== undefined ? data.serviceId : trf.serviceId,
      investigationId: data.investigationId !== undefined ? data.investigationId : trf.investigationId,
      procedureId: data.procedureId !== undefined ? data.procedureId : trf.procedureId,
      rateType: (data.rateType as TariffRateType) ?? trf.rateType,
      standardPrice: data.standardPrice !== undefined ? data.standardPrice : trf.standardPrice,
      schemePrice: data.schemePrice !== undefined ? data.schemePrice : trf.schemePrice,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : trf.effectiveFrom,
      effectiveTo: data.effectiveTo !== undefined ? (data.effectiveTo ? new Date(data.effectiveTo) : null) : trf.effectiveTo,
      isActive: data.isActive ?? trf.isActive,
      updatedAt: new Date(),
    };
    this.tariffs.set(trf.id, updated);

    if (oldStandard !== updated.standardPrice || oldScheme !== updated.schemePrice) {
      this.logAudit('TARIFF_CHANGED', 'tariff_master', trf.id, {
        code: updated.code,
        oldStandardPrice: oldStandard,
        newStandardPrice: updated.standardPrice,
        oldSchemePrice: oldScheme,
        newSchemePrice: updated.schemePrice,
      }, auth);
    }

    return updated;
  }

  async deactivateTariff(id: string, auth?: AuthContext): Promise<TariffMaster> {
    const trf = await this.getTariffById(id);
    const deactivated = { ...trf, isActive: false, updatedAt: new Date() };
    this.tariffs.set(trf.id, deactivated);
    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Insurance Providers
  // --------------------------------------------------------------------------
  async listInsuranceProviders(filter?: { search?: string }): Promise<InsuranceProviderMaster[]> {
    let items = Array.from(this.insuranceProviders.values()).filter((i) => i.isActive);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q));
    }
    return items;
  }

  async getInsuranceProviderById(idOrCode: string): Promise<InsuranceProviderMaster> {
    const item = Array.from(this.insuranceProviders.values()).find((i) => i.id === idOrCode || i.code === idOrCode);
    if (!item) throw new NotFoundError(`Insurance Provider '${idOrCode}' not found`);
    return item;
  }

  async createInsuranceProvider(data: CreateInsuranceProviderMasterInput, auth?: AuthContext): Promise<InsuranceProviderMaster> {
    const existing = Array.from(this.insuranceProviders.values()).find((i) => i.code === data.code && i.isActive);
    if (existing) throw new ConflictError(`Insurance Provider code '${data.code}' is already registered.`);

    const now = new Date();
    const ins: InsuranceProviderMaster = {
      id: crypto.randomUUID(),
      code: data.code,
      name: data.name,
      tpaName: data.tpaName || null,
      contactPerson: data.contactPerson || null,
      phone: data.phone || null,
      email: data.email || null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.insuranceProviders.set(ins.id, ins);

    this.logAudit('MASTER_CREATED', 'insurance_provider_master', ins.id, { code: ins.code, name: ins.name }, auth);

    return ins;
  }

  async updateInsuranceProvider(id: string, data: UpdateInsuranceProviderMasterInput, auth?: AuthContext): Promise<InsuranceProviderMaster> {
    const ins = await this.getInsuranceProviderById(id);

    if (data.code && data.code !== ins.code) {
      const conflict = Array.from(this.insuranceProviders.values()).find((i) => i.code === data.code && i.id !== ins.id && i.isActive);
      if (conflict) throw new ConflictError(`Insurance Provider code '${data.code}' is already registered.`);
    }

    const updated: InsuranceProviderMaster = {
      ...ins,
      code: data.code ?? ins.code,
      name: data.name ?? ins.name,
      tpaName: data.tpaName !== undefined ? data.tpaName : ins.tpaName,
      contactPerson: data.contactPerson !== undefined ? data.contactPerson : ins.contactPerson,
      phone: data.phone !== undefined ? data.phone : ins.phone,
      email: data.email !== undefined ? data.email : ins.email,
      isActive: data.isActive ?? ins.isActive,
      updatedAt: new Date(),
    };
    this.insuranceProviders.set(ins.id, updated);
    return updated;
  }

  async deactivateInsuranceProvider(id: string, auth?: AuthContext): Promise<InsuranceProviderMaster> {
    const ins = await this.getInsuranceProviderById(id);
    const deactivated = { ...ins, isActive: false, updatedAt: new Date() };
    this.insuranceProviders.set(ins.id, deactivated);
    return deactivated;
  }

  // --------------------------------------------------------------------------
  // Government Schemes
  // --------------------------------------------------------------------------
  async listSchemes(filter?: { search?: string }): Promise<GovernmentSchemeMaster[]> {
    let items = Array.from(this.schemes.values()).filter((s) => s.isActive);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    }
    return items;
  }

  async getSchemeById(idOrCode: string): Promise<GovernmentSchemeMaster> {
    const item = Array.from(this.schemes.values()).find((s) => s.id === idOrCode || s.code === idOrCode);
    if (!item) throw new NotFoundError(`Government Scheme '${idOrCode}' not found`);
    return item;
  }

  async createScheme(data: CreateGovernmentSchemeMasterInput, auth?: AuthContext): Promise<GovernmentSchemeMaster> {
    const existing = Array.from(this.schemes.values()).find((s) => s.code === data.code && s.isActive);
    if (existing) throw new ConflictError(`Scheme code '${data.code}' is already registered.`);

    const now = new Date();
    const sch: GovernmentSchemeMaster = {
      id: crypto.randomUUID(),
      code: data.code,
      name: data.name,
      nodalAgency: data.nodalAgency,
      coverageCap: data.coverageCap ?? null,
      discountPercentage: data.discountPercentage ?? null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.schemes.set(sch.id, sch);

    this.logAudit('MASTER_CREATED', 'government_scheme_master', sch.id, { code: sch.code, name: sch.name, nodalAgency: sch.nodalAgency }, auth);

    return sch;
  }

  async updateScheme(id: string, data: UpdateGovernmentSchemeMasterInput, auth?: AuthContext): Promise<GovernmentSchemeMaster> {
    const sch = await this.getSchemeById(id);

    if (data.code && data.code !== sch.code) {
      const conflict = Array.from(this.schemes.values()).find((s) => s.code === data.code && s.id !== sch.id && s.isActive);
      if (conflict) throw new ConflictError(`Scheme code '${data.code}' is already registered.`);
    }

    const updated: GovernmentSchemeMaster = {
      ...sch,
      code: data.code ?? sch.code,
      name: data.name ?? sch.name,
      nodalAgency: data.nodalAgency ?? sch.nodalAgency,
      coverageCap: data.coverageCap !== undefined ? data.coverageCap : sch.coverageCap,
      discountPercentage: data.discountPercentage !== undefined ? data.discountPercentage : sch.discountPercentage,
      isActive: data.isActive ?? sch.isActive,
      updatedAt: new Date(),
    };
    this.schemes.set(sch.id, updated);
    return updated;
  }

  async deactivateScheme(id: string, auth?: AuthContext): Promise<GovernmentSchemeMaster> {
    const sch = await this.getSchemeById(id);
    const deactivated = { ...sch, isActive: false, updatedAt: new Date() };
    this.schemes.set(sch.id, deactivated);
    return deactivated;
  }
}

export const masterDataService = new MasterDataService();
