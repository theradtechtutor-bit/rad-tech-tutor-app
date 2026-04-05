export type Access = 'free' | 'paid';

export type Lesson = {
  id: string;
  title: string;
  minutes?: number;
  access: Access;
  blurb: string;
  videoUrl?: string; // optional: later you can drop in YouTube links
};

export type Module = {
  id: string;
  title: string;
  access: Access;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  shortTitle: string;
  access: Access;
  examWeightHint: 'High' | 'Medium' | 'Lower';
  description: string;
  modules: Module[];
};

// ARRT Radiography “big buckets” (high-level): Patient Care, Safety, Image Production, Procedures.
// This structure drills down into the specific sub-skills students actually get tested on.
export const courses: Course[] = [
  {
    id: 'patient-care',
    title: 'Patient Care (ARRT) — Communication, Assessment, & Safety Basics',
    shortTitle: 'Patient Care',
    access: 'free',
    examWeightHint: 'Medium',
    description:
      'Core patient interactions, mobility, asepsis, vitals, oxygen, and contrast-related basics that show up as scenario questions.',
    modules: [
      {
        id: 'communication-ethics',
        title: 'Communication, Consent, Legal/Ethical',
        access: 'free',
        lessons: [
          {
            id: 'pc-hipaa-consent',
            title: 'Consent, HIPAA, and Documentation (What ARRT Actually Asks)',
            minutes: 9,
            access: 'free',
            blurb:
              'Informed consent vs implied, minors, refusal, and what belongs in documentation.',
          },
          {
            id: 'pc-professional-boundaries',
            title: 'Professional Boundaries & Patient Dignity',
            minutes: 6,
            access: 'free',
            blurb:
              'Chaperones, sensitive exams, communication pitfalls, and de-escalation basics.',
          },
        ],
      },
      {
        id: 'mobility-transfers',
        title: 'Patient Mobility, Transfers, & Fall Prevention',
        access: 'free',
        lessons: [
          {
            id: 'pc-transfer-101',
            title: 'Transfers & Body Mechanics (Bed, Wheelchair, Stretcher)',
            minutes: 8,
            access: 'free',
            blurb:
              'Key safety steps and common ARRT “what should you do first?” traps.',
          },
          {
            id: 'pc-lines-tubes',
            title: 'Managing Lines/Tubes/O2 During Imaging',
            minutes: 7,
            access: 'free',
            blurb:
              'NG, Foley, chest tubes, IVs—what you can/can’t move and who to call.',
          },
        ],
      },
      {
        id: 'infection-control',
        title: 'Infection Control & Aseptic Technique',
        access: 'free',
        lessons: [
          {
            id: 'pc-standard-precautions',
            title: 'Standard vs Transmission-Based Precautions',
            minutes: 10,
            access: 'free',
            blurb:
              'Contact/droplet/airborne: PPE, room entry order, and imaging workflow.',
          },
          {
            id: 'pc-sterile-field',
            title: 'Sterile Field Basics for OR & Fluoro',
            minutes: 8,
            access: 'paid',
            blurb:
              'Scrub vs non-scrub roles, where you can stand, and contamination traps.',
          },
        ],
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety (ARRT) — Radiation Biology, Dose, & Protection',
    shortTitle: 'Safety',
    access: 'free',
    examWeightHint: 'High',
    description:
      'Radiation effects, dose limits, pregnancy rules, shielding, and operational safety that the exam loves to test.',
    modules: [
      {
        id: 'bio-effects',
        title: 'Radiobiology & Cellular Effects',
        access: 'free',
        lessons: [
          {
            id: 'safety-stochastic-vs-deterministic',
            title: 'Stochastic vs Deterministic Effects (With Examples)',
            minutes: 10,
            access: 'free',
            blurb:
              'What changes with dose, thresholds, and which effects are which.',
          },
          {
            id: 'safety-law-bergonie',
            title: 'Bergonié & Tribondeau + Tissue Radiosensitivity',
            minutes: 7,
            access: 'free',
            blurb:
              'Why some tissues take the hit first and how ARRT frames it.',
          },
        ],
      },
      {
        id: 'protection',
        title: 'ALARA, Shielding, & Operational Protection',
        access: 'free',
        lessons: [
          {
            id: 'safety-time-distance-shielding',
            title: 'Time, Distance, Shielding (Inverse Square in Plain English)',
            minutes: 9,
            access: 'free',
            blurb:
              'How to reason through protection questions fast—no memorization panic.',
          },
          {
            id: 'safety-dose-limits',
            title: 'Dose Limits, Badges, and Reportable Events',
            minutes: 8,
            access: 'free',
            blurb:
              'Whole body, lens, extremity, embryo/fetus—what matters for the test.',
          },
          {
            id: 'safety-pregnancy',
            title: 'Pregnancy Policy: Patient vs Worker',
            minutes: 8,
            access: 'free',
            blurb:
              'Declared pregnancy, counseling, shielding, and the “do we image?” logic.',
          },
        ],
      },
    ],
  },
  {
    id: 'image-production',
    title: 'Image Production (ARRT) — Technique, Exposure, Digital, & QC',
    shortTitle: 'Image Production',
    access: 'free',
    examWeightHint: 'High',
    description:
      'Everything that controls image quality: kVp/mAs, receptors, grids, AEC, digital processing, artifacts, and QC.',
    modules: [
      {
        id: 'technique-factors',
        title: 'Technique Factors & Image Quality',
        access: 'free',
        lessons: [
          {
            id: 'ip-kvp-mas',
            title: 'kVp vs mAs: Contrast, Density, Dose (No Confusion)',
            minutes: 12,
            access: 'free',
            blurb:
              'How each factor changes the image and patient dose—ARRT style.',
          },
          {
            id: 'ip-distance-oid-sid',
            title: 'SID/OID, Magnification, Distortion',
            minutes: 10,
            access: 'free',
            blurb:
              'How geometry changes sharpness and size + common positioning traps.',
          },
          {
            id: 'ip-15-rule',
            title: '15% Rule & Technique Conversions',
            minutes: 9,
            access: 'free',
            blurb:
              'Fast math for the exam: when you double mAs, when kVp changes.',
          },
        ],
      },
      {
        id: 'grids-aec',
        title: 'Grids, Scatter, AEC, and Beam Limitation',
        access: 'free',
        lessons: [
          {
            id: 'ip-scatter-grid-basics',
            title: 'Scatter Control: Collimation, Grids, Air-Gap',
            minutes: 11,
            access: 'free',
            blurb:
              'When to choose what, and why grid errors look the way they do.',
          },
          {
            id: 'ip-aec',
            title: 'AEC: Chamber Selection, Back-Up Time, and Failure Patterns',
            minutes: 10,
            access: 'paid',
            blurb:
              'A “must” for consistent scores—this is where people bleed points.',
          },
        ],
      },
      {
        id: 'digital',
        title: 'Digital Imaging: CR/DR, EI, Processing, and Artifacts',
        access: 'free',
        lessons: [
          {
            id: 'ip-cr-vs-dr',
            title: 'CR vs DR + Image Processing Terms You Need',
            minutes: 10,
            access: 'free',
            blurb:
              'Histogram/VOI, rescaling, bit depth, LUTs—explained like a tech.',
          },
          {
            id: 'ip-exposure-index',
            title: 'Exposure Index & Dose Creep (How to Read EI Questions)',
            minutes: 9,
            access: 'free',
            blurb:
              'Different EI systems exist—learn the logic so any EI question is easy.',
          },
          {
            id: 'ip-artifacts',
            title: 'Digital Artifacts: Cause → Appearance → Fix',
            minutes: 12,
            access: 'paid',
            blurb:
              'Grid aliasing, dead pixels, moiré, lag, saturation, stitching issues.',
          },
        ],
      },
      {
        id: 'qc',
        title: 'Quality Control & Equipment Checks',
        access: 'free',
        lessons: [
          {
            id: 'ip-qc-schedule',
            title: 'QC Frequency & What Each Test Detects',
            minutes: 10,
            access: 'paid',
            blurb:
              'Processor (legacy), exposure reproducibility, collimation, alignment.',
          },
        ],
      },
    ],
  },
  {
    id: 'procedures',
    title: 'Procedures (ARRT) — Positioning, Trauma, Mobile, OR, Fluoro',
    shortTitle: 'Procedures',
    access: 'free',
    examWeightHint: 'High',
    description:
      'Positioning + why we do it: CR, anatomy landmarks, breathing, and special views—built for test day.',
    modules: [
      {
        id: 'chest-abdomen',
        title: 'Chest & Abdomen',
        access: 'free',
        lessons: [
          {
            id: 'proc-chest-pa-lat',
            title: 'Chest PA & Lateral: Positioning, Breathing, and Image Critique',
            minutes: 14,
            access: 'free',
            blurb:
              'Your “bread and butter” view—ARRT loves rotation and inspiration cues.',
          },
          {
            id: 'proc-kub-acute-abd',
            title: 'KUB & Acute Abdomen Series (When/Why)',
            minutes: 10,
            access: 'free',
            blurb:
              'Supine/upright/decub logic and what the images are looking for.',
          },
        ],
      },
      {
        id: 'upper-extremity',
        title: 'Upper Extremity',
        access: 'free',
        lessons: [
          {
            id: 'proc-hand',
            title: 'Hand/Wrist/Forearm: PA/Oblique/Lateral + Common Mistakes',
            minutes: 12,
            access: 'free',
            blurb:
              'Rotation, flexion, and why your lateral isn’t truly lateral.',
          },
          {
            id: 'proc-elbow',
            title: 'Elbow Trauma & Modified Views',
            minutes: 10,
            access: 'paid',
            blurb:
              'Partial flexion series, radial head/capitellum, and why the exam asks it.',
          },
        ],
      },
      {
        id: 'lower-extremity',
        title: 'Lower Extremity',
        access: 'free',
        lessons: [
          {
            id: 'proc-knee',
            title: 'Knee: AP/Oblique/Lateral + Patella/Sunrise Basics',
            minutes: 12,
            access: 'free',
            blurb:
              'Landmarks, condyles, and how to fix joint space issues fast.',
          },
          {
            id: 'proc-ankle-foot',
            title: 'Ankle/Foot: Mortise Logic + 3-View Series',
            minutes: 11,
            access: 'free',
            blurb:
              'Mortise is the exam favorite—learn the reason, not the angle.',
          },
        ],
      },
      {
        id: 'spine-pelvis',
        title: 'Spine, Pelvis, & Hip',
        access: 'free',
        lessons: [
          {
            id: 'proc-cspine',
            title: 'C-Spine: Trauma Series + Odontoid Problem Solving',
            minutes: 14,
            access: 'paid',
            blurb:
              'Cross-table lateral, swimmer, open-mouth—common “can’t see it” fixes.',
          },
          {
            id: 'proc-lspine',
            title: 'L-Spine: Obliques, Spot, and Breathing',
            minutes: 12,
            access: 'paid',
            blurb:
              'Pars, zygapophyseal joints, and when to use respiration techniques.',
          },
          {
            id: 'proc-hip-femur',
            title: 'Hip/Femur Trauma: Cross-Table Lateral and Key Safety Moves',
            minutes: 12,
            access: 'paid',
            blurb:
              'How to avoid moving the patient and still get diagnostic images.',
          },
        ],
      },
      {
        id: 'mobile-or',
        title: 'Mobile & Surgical',
        access: 'free',
        lessons: [
          {
            id: 'proc-mobile-chest',
            title: 'Portable Chest: Lines, Rotation, and Technique',
            minutes: 10,
            access: 'free',
            blurb:
              'ET tube/NG placement checks, scapula management, and common errors.',
          },
          {
            id: 'proc-carm',
            title: 'C-Arm Basics: Geometry, Dose, and Sterile Workflow',
            minutes: 12,
            access: 'paid',
            blurb:
              'If you know this, OR questions become freebies.',
          },
        ],
      },
      {
        id: 'fluoro-contrast',
        title: 'Fluoro & Contrast Studies',
        access: 'paid',
        lessons: [
          {
            id: 'proc-ugi-barium',
            title: 'UGI/Barium Studies: Prep, Contraindications, and Complications',
            minutes: 12,
            access: 'paid',
            blurb:
              'Aspiration risk, perforation, and when iodine replaces barium.',
          },
          {
            id: 'proc-iv-contrast-reactions',
            title: 'Contrast Reactions: Mild → Severe and First Actions',
            minutes: 11,
            access: 'paid',
            blurb:
              'Recognition + what you do first. Exam scenarios simplified.',
          },
        ],
      },
    ],
  },
];

export function getCourse(courseId: string) {
  return courses.find((c) => c.id === courseId) ?? null;
}

export function getLesson(lessonId: string) {
  for (const c of courses) {
    for (const m of c.modules) {
      const found = m.lessons.find((l) => l.id === lessonId);
      if (found) return { course: c, module: m, lesson: found };
    }
  }
  return null;
}
