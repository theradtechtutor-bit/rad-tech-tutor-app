export type BankQuestion = {
  id: string;
  stem: string;
  choices: string[];
  answerIndex: number;
  tags: {
    course: 'patient-care';
    section: 'ethical' | 'infection' | 'emergency';
    subsection:
      | 'consent'
      | 'hipaa'
      | 'chain'
      | 'precautions'
      | 'contrast'
      | 'seizure';
  };
};

export const questionBank: BankQuestion[] = [
  {
    id: 'PC-001',
    stem: 'Which document ensures patient consent for a radiologic procedure?',
    choices: [
      'Incident report',
      'Informed consent form',
      'Chart note',
      'HIPAA disclosure form',
    ],
    answerIndex: 1,
    tags: { course: 'patient-care', section: 'ethical', subsection: 'consent' },
  },

  // add more later...
];
