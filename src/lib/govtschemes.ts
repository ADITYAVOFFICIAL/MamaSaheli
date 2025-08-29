export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  benefits: string;
  documentsRequired: string;
  category: "Financial Assistance" | "Health & Nutrition" | "Child Care" | "General Welfare" | "Education";
  applicationLink?: string;
  sourceLink: string;
  state?: string;
}

export interface SchemeCategory {
  title: "For Pregnant Women" | "For Newborn Babies" | "For the Girl Child" | "For Those Trying to Conceive";
  description: string;
  schemes: GovernmentScheme[];
}

const schemesData: SchemeCategory[] = [
  {
    title: "For Pregnant Women",
    description: "Financial and healthcare support during pregnancy and after delivery.",
    schemes: [
      {
        id: "pmmvy",
        name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        description: "A maternity benefit program providing partial wage compensation to women for wage-loss during childbirth and to ensure safe delivery and good nutrition.",
        eligibility: "- Pregnant women aged 19 years or older.\n- For the first living child (and second, if a girl).\n- Not employed with Central/State Government or PSUs.",
        benefits: "- **First child:** ₹5,000 in two installments.\n- **Second child (if a girl):** ₹6,000 in a single installment.",
        documentsRequired: "- Properly filled Application Form 1-A\n- Copy of MCP (Mother and Child Protection) Card\n- Copy of Aadhaar Card\n- Copy of Bank/Post Office Account Passbook",
        category: "Financial Assistance",
        applicationLink: "https://pmmvy.wcd.gov.in/",
        sourceLink: "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana",
      },
      {
        id: "jsy",
        name: "Janani Suraksha Yojana (JSY)",
        description: "A safe motherhood intervention under the National Health Mission (NHM) to reduce maternal and neonatal mortality by promoting institutional delivery.",
        eligibility: "- All pregnant women in Low Performing States (LPS).\n- BPL, SC, ST pregnant women aged 19+ in High Performing States (HPS).",
        benefits: "- **Rural (LPS):** ₹1,400 cash assistance.\n- **Urban (LPS):** ₹1,000 cash assistance.\n- **Rural (HPS):** ₹700 cash assistance.\n- **Urban (HPS):** ₹600 cash assistance.\n- ASHA worker incentives for facilitation.",
        documentsRequired: "- JSY Card\n- Aadhaar Card\n- Bank Passbook\n- Delivery Certificate from the institution",
        category: "Health & Nutrition",
        sourceLink: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309",
      },
      {
        id: "jssk",
        name: "Janani Shishu Suraksha Karyakram (JSSK)",
        description: "An initiative to provide completely free and cashless services to pregnant women and sick newborns in government health institutions.",
        eligibility: "- All pregnant women delivering in public health institutions.\n- All sick newborns up to one year of age accessing public health institutions.",
        benefits: "- Free and cashless delivery (including C-section).\n- Free drugs, consumables, and diagnostics.\n- Free diet during stay (up to 3 days for normal, 7 for C-section).\n- Free blood provision.\n- Free transport from home to facility and back.",
        documentsRequired: "- Registration at a government health facility is the primary requirement.",
        category: "Health & Nutrition",
        sourceLink: "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=842&lid=308",
      },
    ],
  },
  {
    title: "For Newborn Babies",
    description: "Support schemes for infants ensuring their health and well-being.",
    schemes: [
      {
        id: "pm-cares-children",
        name: "PM CARES for Children Scheme",
        description: "A comprehensive support scheme for children who have lost both parents or legal guardian(s) to the COVID-19 pandemic.",
        eligibility: "- Children who have lost both parents or surviving parent or legal guardian/adoptive parents due to COVID-19, from March 11, 2020, to February 28, 2022.\n- Child should not have completed 18 years of age on the date of death of parents.",
        benefits: "- A corpus of ₹10 lakh for each child, accessible upon turning 23.\n- Health insurance coverage of ₹5 lakh under Ayushman Bharat.\n- Support for schooling, higher education loans, and monthly stipends.",
        documentsRequired: "- Death certificate of parents\n- Child's birth certificate\n- Proof of guardianship (if applicable)",
        category: "General Welfare",
        applicationLink: "https://pmcaresforchildren.in/",
        sourceLink: "https://pmcaresforchildren.in/about-scheme",
      },
    ],
  },
  {
    title: "For the Girl Child",
    description: "Schemes focused on the education, protection, and financial empowerment of girls.",
    schemes: [
      {
        id: "bbbp",
        name: "Beti Bachao Beti Padhao (BBBP)",
        description: "A national campaign to address the declining Child Sex Ratio (CSR) and promote the empowerment of the girl child through education and protection.",
        eligibility: "- This is a national campaign, not a direct benefit transfer scheme. It focuses on awareness and improving efficiency of welfare services for girls.",
        benefits: "- Aims to prevent gender-biased sex-selective elimination.\n- Ensures survival, protection, and education of the girl child.",
        documentsRequired: "- Not applicable (it's a campaign, not an individual application scheme).",
        category: "General Welfare",
        sourceLink: "https://wcd.nic.in/bbbp-schemes",
      },
      {
        id: "ssy",
        name: "Sukanya Samriddhi Yojana (SSY)",
        description: "A small deposit savings scheme for the girl child, offering a high interest rate and tax benefits to build a fund for her education and marriage expenses.",
        eligibility: "- Girl child below the age of 10.\n- Account must be opened by parents or legal guardians.\n- Maximum of two accounts per family (exceptions for twins/triplets).",
        benefits: "- High interest rate (currently 8.2% p.a., subject to quarterly revision).\n- Tax deduction under Section 80C.\n- Tax-free interest and maturity amount.",
        documentsRequired: "- Girl child's birth certificate\n- Guardian's ID and address proof (Aadhaar, PAN)\n- Initial deposit (min. ₹250)",
        category: "Financial Assistance",
        sourceLink: "https://www.indiapost.gov.in/Financial/Pages/Content/sukanya-samriddhi-yojana.aspx",
      },
      {
        id: "kanyashree",
        name: "Kanyashree Prakalpa",
        state: "West Bengal",
        description: "A conditional cash transfer scheme by the Government of West Bengal to incentivize the education of girls and prevent child marriage.",
        eligibility: "- Unmarried girls aged 13-19, residing in West Bengal.\n- Enrolled in a recognized educational institution (Class VIII or above).\n- Family annual income up to ₹1,20,000.",
        benefits: "- **K1:** Annual scholarship of ₹750 for girls aged 13-18.\n- **K2:** One-time grant of ₹25,000 upon turning 18, if unmarried and continuing education.",
        documentsRequired: "- Birth certificate\n- Unmarried status declaration\n- Proof of school enrollment\n- Bank account details",
        category: "Education",
        applicationLink: "https://www.wbkanyashree.gov.in/kp_4.0/index.php",
        sourceLink: "https://wb.gov.in/kanyashree-prakalpa.aspx",
      },
    ],
  },
  {
    title: "For Those Trying to Conceive",
    description: "Information on government support and initiatives for fertility treatments.",
    schemes: [
      {
        id: "ivf-support",
        name: "Government Support for Fertility Treatment (IVF)",
        description: "While there is no single national scheme for free IVF, several states and central programs offer limited, subsidized, or insurance-covered fertility treatments.",
        eligibility: "- Varies significantly by state and scheme.\n- Often tied to BPL status, employee insurance schemes (ESIS, CGHS), or specific state health programs.",
        benefits: "- Free or subsidized IVF cycles in select government hospitals (e.g., in Tamil Nadu, Rajasthan).\n- Limited coverage under PM-JAY and ESIS for eligible beneficiaries.",
        documentsRequired: "- Proof of income (BPL card)\n- Domicile certificate for state schemes\n- Medical records confirming infertility\n- Aadhaar card and other standard KYC",
        category: "Health & Nutrition",
        sourceLink: "https://nhm.gov.in/",
      },
    ],
  },
];

export const getGovtSchemes = (): SchemeCategory[] => {
  return schemesData;
};