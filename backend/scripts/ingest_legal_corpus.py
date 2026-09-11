import sys
import os
import chromadb
from chromadb.utils import embedding_functions

# Ensure backend root is on Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Persist the vector database locally
DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "chroma_db")

# --- 1. COMPREHENSIVE INDIAN LEGAL CORPUS (EXPANDED) ---
INDIAN_LEGAL_DATA = [
    # ===================== PATENTS ACT, 1970 & PATENT RULES 2024 =====================
    {
        "id": "patents_act_1970_sec_3b",
        "statute": "Patents Act, 1970",
        "section": "Section 3(b)",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 3(b) of the Patents Act, 1970 excludes from patentability an invention the use of which could be "
            "contrary to public order or morality or which causes serious prejudice to human, animal or plant life or "
            "health or to the environment. In the AYUSH context, this provision can be invoked to reject patents on "
            "formulations that involve endangered plant species, unethical practices, or products that pose a risk to "
            "public health due to toxicity or improper processing. The Controller must assess whether the commercial "
            "exploitation of the invention would be against the accepted norms of society or would harm the environment. "
            "This aligns with the precautionary principle and ensures that traditional medicine patents do not endanger "
            "biodiversity or public welfare."
        )
    },
    {
        "id": "patents_act_1970_sec_3c",
        "statute": "Patents Act, 1970",
        "section": "Section 3(c)",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 3(c) of the Patents Act, 1970 bars the patenting of the mere discovery of any living thing or "
            "non-living substance occurring in nature. This means that naturally occurring medicinal plants, herbs, "
            "minerals, or biological resources in their raw form cannot be patented. For AYUSH, a newly discovered "
            "plant species or a naturally occurring mineral with therapeutic properties is not patentable as such. "
            "However, a purified extract, a novel formulation, or a process for isolating an active compound may be "
            "patentable if it meets the requirements of novelty and inventive step. This provision is fundamental to "
            "preventing the monopolisation of nature's bounty."
        )
    },
    {
        "id": "patents_act_1970_sec_3k",
        "statute": "Patents Act, 1970",
        "section": "Section 3(k)",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 3(k) of the Patents Act, 1970 excludes from patentability mathematical methods, business methods, "
            "computer programs per se, and algorithms. In the context of IP-SAKTI, this is relevant when protecting "
            "software tools, databases, or AI models that analyse AYUSH formulations. A software program that merely "
            "automates a known process or implements a traditional knowledge algorithm without a technical contribution "
            "is not patentable. However, a system that provides a technical solution to a technical problem, such as a "
            "novel hardware-software combination for herbal extraction monitoring, may be patentable. This section "
            "ensures that pure software innovations are not granted patents, thereby keeping the IP landscape balanced."
        )
    },
    {
        "id": "patents_act_1970_sec_11a",
        "statute": "Patents Act, 1970",
        "section": "Section 11A",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 11A of the Patents Act, 1970 provides for the publication of patent applications. Every application "
            "is published after the expiry of eighteen months from the filing date or priority date, whichever is "
            "earlier, unless a secrecy direction is in force. The publication includes the abstract, specification, and "
            "drawings. Once published, the application becomes open for public inspection, and any person may file a "
            "pre-grant opposition under Section 25(1). For AYUSH inventions, early publication allows traditional "
            "knowledge holders and competitors to scrutinise the application and oppose if it falls under Section 3(p) "
            "or other exclusions. The publication date is also crucial for determining the commencement of provisional "
            "rights."
        )
    },
    {
        "id": "patents_act_1970_sec_53",
        "statute": "Patents Act, 1970",
        "section": "Section 53",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 53 of the Patents Act, 1970 prescribes the term of a patent. Every patent is granted for a period "
            "of twenty years from the date of filing of the application. For applications filed under the PCT national "
            "phase, the term is counted from the international filing date. There is no provision for extension beyond "
            "twenty years. After expiry, the invention falls into the public domain and can be freely used by anyone. "
            "In the AYUSH sector, this means that patented herbal formulations or processes will lose protection after "
            "two decades, allowing generic manufacturers to produce them. The term also affects licensing strategies "
            "and the valuation of patent portfolios."
        )
    },
    {
        "id": "patents_act_1970_sec_107a",
        "statute": "Patents Act, 1970",
        "section": "Section 107A",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 107A of the Patents Act, 1970 defines certain acts that do not constitute infringement of a "
            "patent. These include: (a) any act of making, constructing, using, selling or importing a patented "
            "invention solely for uses reasonably related to the development and submission of information required "
            "under any law for the time being in force in India or in a country other than India that regulates the "
            "manufacture, construction, use, sale or import of any product; (b) importation of patented products by "
            "any person from a person who is duly authorised by the patentee to sell or distribute the product. This "
            "provision is commonly known as the Bolar exemption and is crucial for the development of generic AYUSH "
            "medicines and for regulatory approval of phytopharmaceuticals without infringing existing patents."
        )
    },
    {
        "id": "patents_rules_2024_rule_24b",
        "statute": "Patent Rules, 2024",
        "section": "Rule 24B",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Rule 24B of the Patent Rules, 2024 prescribes the procedure for filing a pre-grant opposition under "
            "Section 25(1) of the Patents Act, 1970. The opposition must be filed in writing and include a statement "
            "and evidence in support of the opposition. The Controller shall notify the applicant and provide an "
            "opportunity to file a reply statement and evidence. After hearing both parties, the Controller decides "
            "whether the opposition is maintainable and whether the patent should be refused. For AYUSH-related "
            "applications, this rule allows any person, including traditional knowledge holders or NGOs, to challenge "
            "patent applications that claim traditional knowledge without substantive innovation, thereby protecting "
            "the public domain."
        )
    },
    {
        "id": "patents_rules_2024_rule_24c",
        "statute": "Patent Rules, 2024",
        "section": "Rule 24C",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Rule 24C of the Patent Rules, 2024 details the procedure for post-grant opposition under Section 25(2) of "
            "the Patents Act, 1970. An interested person may file a notice of opposition within one year from the date "
            "of publication of the grant. The notice must contain a written statement and evidence. The patentee has "
            "the opportunity to file a reply and evidence. The matter is then heard by an Opposition Board constituted "
            "by the Controller. The Board submits a report with recommendations, and the Controller may revoke or "
            "maintain the patent. This rule is essential for rectifying patents wrongly granted on traditional "
            "knowledge or for non-compliance with biological source disclosure."
        )
    },
    {
        "id": "patents_act_1970_sec_3p_extended",
        "statute": "Patents Act, 1970",
        "section": "Section 3(p) (Extended)",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Extended explanation of Section 3(p): The exclusion of traditional knowledge from patentability under "
            "Section 3(p) is absolute, irrespective of whether the traditional knowledge is codified in ancient texts "
            "or exists in oral traditions. The Indian Patent Office relies heavily on the Traditional Knowledge Digital "
            "Library (TKDL) to identify prior art. Any invention that is essentially a combination of known herbs "
            "described in Ayurvedic texts, such as a mixture of Triphala and Guggul for a known purpose, is barred. "
            "To overcome this objection, the applicant must demonstrate a significant technical advancement, such as a "
            "novel extraction process that yields a new chemical entity with unexpected therapeutic properties, or a "
            "formulation with proven synergistic efficacy that is not described in the classical literature."
        )
    },
    
    # ===================== BIOLOGICAL DIVERSITY ACT, 2002 (AMENDED 2023) & BD RULES, 2024 =====================
    {
        "id": "bd_act_2002_sec_4",
        "statute": "Biological Diversity Act, 2002 (Amended 2023)",
        "section": "Section 4",
        "jurisdiction": "india",
        "category": "Biodiversity & ABS",
        "text": (
            "Section 4 of the Biological Diversity Act, 2002 establishes the National Biodiversity Authority (NBA) as "
            "a body corporate with the mandate to regulate access to biological resources and associated knowledge, "
            "and to ensure equitable sharing of benefits. The NBA consists of a chairperson, ex-officio members from "
            "various ministries, and non-official members with expertise in biodiversity. The functions of the NBA "
            "include granting approvals under Sections 3 and 6, determining benefit-sharing obligations, and advising "
            "the government on biodiversity conservation. For AYUSH enterprises, the NBA is the primary regulatory "
            "body when non-Indian entities or IPR applications are involved."
        )
    },
    {
        "id": "bd_act_2002_sec_19",
        "statute": "Biological Diversity Act, 2002 (Amended 2023)",
        "section": "Section 19",
        "jurisdiction": "india",
        "category": "Biodiversity & ABS",
        "text": (
            "Section 19 of the Biological Diversity Act, 2002 empowers the National Biodiversity Authority to grant "
            "approval for the transfer of results of research relating to biological resources to certain persons. "
            "Specifically, if an Indian citizen or entity wishes to transfer the results of research on Indian "
            "biological resources to a non-Indian person or entity, prior approval of the NBA is required. The NBA "
            "evaluates whether the transfer is in accordance with the provisions of the Act and whether benefit-sharing "
            "obligations have been met. This section is crucial for collaborative research between Indian AYUSH "
            "institutions and foreign partners, ensuring that the benefits of such research are shared fairly."
        )
    },
    {
        "id": "bd_act_2002_sec_21",
        "statute": "Biological Diversity Act, 2002 (Amended 2023)",
        "section": "Section 21",
        "jurisdiction": "india",
        "category": "Biodiversity & ABS",
        "text": (
            "Section 21 of the Biological Diversity Act, 2002 requires the National Biodiversity Authority to ensure "
            "equitable sharing of benefits arising out of the use of biological resources and associated knowledge. "
            "The NBA may impose benefit-sharing conditions while granting approvals, which may include monetary "
            "payments, royalties, joint ownership of intellectual property, technology transfer, or capacity building. "
            "The benefit-sharing is determined based on the economic value of the resource, the level of value addition, "
            "and the socio-economic conditions of the provider communities. For AYUSH products derived from medicinal "
            "plants, this section ensures that local communities and the nation receive a fair share of commercial "
            "profits."
        )
    },
    {
        "id": "bd_rules_2024_rule_14",
        "statute": "Biological Diversity Rules, 2024",
        "section": "Rule 14",
        "jurisdiction": "india",
        "category": "Biodiversity & ABS",
        "text": (
            "Rule 14 of the Biological Diversity Rules, 2024 prescribes the procedure for obtaining prior approval of "
            "the National Biodiversity Authority under Section 6 of the Act for applying for intellectual property "
            "rights. The applicant must submit Form 8 along with details of the biological resource, the nature of the "
            "IPR sought, and a declaration that the resource was legally accessed. The NBA may consult with the State "
            "Biodiversity Board and the concerned Biodiversity Management Committee. If the NBA is satisfied that the "
            "application is complete and that benefit-sharing obligations will be met, it may grant approval with "
            "conditions. The approval is valid for a specified period and must be obtained before filing the IPR "
            "application anywhere in the world."
        )
    },
    
    # ===================== DRUGS AND COSMETICS ACT, 1940 & RULES, 1945 =====================
    {
        "id": "drugs_cosmetics_act_1940_sec_33eea",
        "statute": "Drugs and Cosmetics Act, 1940",
        "section": "Section 33EEA",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Section 33EEA of the Drugs and Cosmetics Act, 1940 defines 'spurious Ayurvedic, Siddha or Unani drug' as "
            "a drug which is sold under a name which belongs to another drug, or which is an imitation of or a substitute "
            "for another drug, or which has been substituted wholly or in part by another drug or substance, or which "
            "purports to be the product of a manufacturer of whom it is not truly a product. For AYUSH manufacturers, "
            "selling a product falsely labelled as a classical formulation or using a brand name of a reputed company "
            "constitutes a spurious drug offence. The penalties include imprisonment for a term which may extend to "
            "three years and fine up to ₹10,000."
        )
    },
    {
        "id": "drugs_cosmetics_act_1940_sec_33eeb",
        "statute": "Drugs and Cosmetics Act, 1940",
        "section": "Section 33EEB",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Section 33EEB of the Drugs and Cosmetics Act, 1940 defines 'misbranded Ayurvedic, Siddha or Unani drug' "
            "as a drug which is not labelled in the prescribed manner, or which bears a label containing false or "
            "misleading information regarding its composition, efficacy, or origin. This includes drugs that do not "
            "carry the mandatory caution labels for Schedule E(1) ingredients, or that make unsubstantiated therapeutic "
            "claims. Misbranding is a serious offence and can lead to cancellation of license, imprisonment up to one "
            "year, and fine. Compliance with labelling requirements under Rule 161 is essential to avoid this offence."
        )
    },
    {
        "id": "drugs_cosmetics_act_1940_sec_33eec",
        "statute": "Drugs and Cosmetics Act, 1940",
        "section": "Section 33EEC",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Section 33EEC of the Drugs and Cosmetics Act, 1940 defines 'adulterated Ayurvedic, Siddha or Unani drug' "
            "as a drug which consists in whole or in part of any filthy, putrid or decomposed substance, or which has "
            "been prepared, packed or stored under insanitary conditions, or which contains any harmful or toxic "
            "substance, or which has been mixed with any substance that reduces its quality or strength. For AYUSH "
            "products, the presence of heavy metals beyond permissible limits, microbial contamination, or substitution "
            "of costly ingredients with cheaper ones constitutes adulteration. The penalties are severe, including "
            "imprisonment up to three years and fine."
        )
    },
    {
        "id": "drugs_cosmetics_rules_1945_rule_161",
        "statute": "Drugs and Cosmetics Rules, 1945",
        "section": "Rule 161",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Rule 161 of the Drugs and Cosmetics Rules, 1945 prescribes the conditions for the grant of loan licenses "
            "for the manufacture of Ayurvedic, Siddha or Unani drugs. A loan license allows a person who does not own "
            "a manufacturing facility to use the premises and equipment of another licensed manufacturer. The applicant "
            "must submit an application in Form 24D along with a declaration that the premises are owned or leased by "
            "them and comply with Schedule T GMP. The loan license is granted on Form 25E. This provision enables small "
            "AYUSH businesses and startups to enter the market without heavy capital investment."
        )
    },
    {
        "id": "drugs_cosmetics_rules_1945_rule_158a",
        "statute": "Drugs and Cosmetics Rules, 1945",
        "section": "Rule 158A",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Rule 158A of the Drugs and Cosmetics Rules, 1945 specifies the standards for Ayurvedic, Siddha and Unani "
            "drugs. Every ASU drug must conform to the standards set out in the authoritative texts specified in the "
            "First Schedule of the Act, and must comply with the requirements of Schedule T (GMP). The rule also "
            "prescribes that the drug must not contain any harmful ingredients beyond permissible limits and must be "
            "safe for the intended use. For patent or proprietary medicines, the standards are supplemented by the "
            "efficacy and safety data requirements under Rule 158B. Compliance with these standards is mandatory for "
            "obtaining and maintaining a manufacturing license."
        )
    },
    {
        "id": "drugs_cosmetics_rules_1945_rule_168",
        "statute": "Drugs and Cosmetics Rules, 1945",
        "section": "Rule 168",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Rule 168 of the Drugs and Cosmetics Rules, 1945 prescribes the labelling requirements for Ayurvedic, "
            "Siddha and Unani drugs. Every container must bear a label with: (i) the name of the drug, (ii) the net "
            "contents, (iii) the name and address of the manufacturer, (iv) the batch number, (v) the date of "
            "manufacture and expiry, (vi) the manufacturing license number, (vii) the list of active ingredients with "
            "quantities, (viii) the dosage, and (ix) any mandatory caution statements such as 'To be taken under "
            "medical supervision only' for Schedule E(1) substances. For patent or proprietary medicines, the label "
            "must also state 'Patent or Proprietary Medicine' and the formula. Non-compliance renders the drug "
            "misbranded under Section 33EEB."
        )
    },
    {
        "id": "drugs_cosmetics_rules_1945_schedule_z",
        "statute": "Drugs and Cosmetics Rules, 1945",
        "section": "Schedule Z",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Schedule Z of the Drugs and Cosmetics Rules, 1945 lists the requirements for the premises where Ayurvedic, "
            "Siddha and Unani drugs are manufactured. It specifies the minimum area, construction, ventilation, "
            "lighting, and sanitation standards. The schedule also mandates separate areas for raw material storage, "
            "manufacturing, quality control, and finished goods. Adequate equipment for processing, such as pulverisers, "
            "mixers, and filtration units, must be installed. Compliance with Schedule Z is a prerequisite for obtaining "
            "a manufacturing license under Forms 25D or 25E and for meeting GMP under Schedule T."
        )
    },
    
    # ===================== NEW DRUGS AND CLINICAL TRIALS (NDCT) RULES, 2019 =====================
    {
        "id": "ndct_rules_2019_rule_2_1_v",
        "statute": "New Drugs and Clinical Trials Rules, 2019",
        "section": "Rule 2(1)(v)",
        "jurisdiction": "india",
        "category": "Clinical Trials",
        "text": (
            "Rule 2(1)(v) of the New Drugs and Clinical Trials Rules, 2019 defines 'new drug' to include, among others, "
            "a phytopharmaceutical drug, a botanical extract, a new formulation of an approved drug, or a drug already "
            "approved but proposed for a new indication. In the context of AYUSH, any herbal extract or standardised "
            "fraction that is not a classical formulation under the Drugs and Cosmetics Act is considered a new drug "
            "and must undergo the regulatory pathway prescribed under these rules. This includes drugs derived from "
            "plants that have been used in traditional medicine but are now being developed as modern pharmaceuticals."
        )
    },
    {
        "id": "ndct_rules_2019_schedule_i",
        "statute": "New Drugs and Clinical Trials Rules, 2019",
        "section": "Schedule I",
        "jurisdiction": "india",
        "category": "Clinical Trials",
        "text": (
            "Schedule I of the New Drugs and Clinical Trials Rules, 2019 prescribes the format and content of "
            "pre-clinical toxicity data required for new drugs, including phytopharmaceuticals. The data must include "
            "acute, sub-acute, and chronic toxicity studies in relevant animal models, genotoxicity, reproductive "
            "toxicity, and safety pharmacology. The studies must be conducted in compliance with Good Laboratory "
            "Practices (GLP). The schedule also specifies the number of animals, dose levels, and parameters to be "
            "monitored. For AYUSH-derived drugs, this ensures that the product is safe before human trials are "
            "initiated."
        )
    },
    {
        "id": "ndct_rules_2019_schedule_vii",
        "statute": "New Drugs and Clinical Trials Rules, 2019",
        "section": "Schedule VII",
        "jurisdiction": "india",
        "category": "Clinical Trials",
        "text": (
            "Schedule VII of the New Drugs and Clinical Trials Rules, 2019 outlines the structure and content of "
            "clinical trial reports. The report must include a summary, introduction, objectives, methodology, "
            "statistical analysis, results, discussion, and conclusions. For each trial phase (I, II, III), specific "
            "data points are required, such as pharmacokinetics, dose-ranging, efficacy endpoints, and adverse events. "
            "The schedule also mandates the inclusion of patient consent forms, ethics committee approvals, and "
            "investigator brochures. Compliance with this schedule ensures that the clinical trial data submitted to "
            "the CDSCO is complete and scientifically valid."
        )
    },
    {
        "id": "ndct_rules_2019_forms_ct01_ct03",
        "statute": "New Drugs and Clinical Trials Rules, 2019",
        "section": "Forms CT-01 to CT-03",
        "jurisdiction": "india",
        "category": "Clinical Trials",
        "text": (
            "Forms CT-01, CT-02, and CT-03 under the New Drugs and Clinical Trials Rules, 2019 are used for various "
            "stages of the clinical trial application process. Form CT-01 is the application for permission to "
            "manufacture or import a new drug for clinical trial or for sale. Form CT-02 is the application for "
            "permission to conduct a clinical trial or bioavailability/bioequivalence study. Form CT-03 is the "
            "application for permission to import or manufacture a new drug for marketing without conducting a local "
            "clinical trial if it is approved in certain countries. These forms are submitted to the CDSCO and are "
            "essential for obtaining regulatory clearance for AYUSH-based new drugs."
        )
    },
    {
        "id": "ndct_rules_2019_forms_ct05_ct07",
        "statute": "New Drugs and Clinical Trials Rules, 2019",
        "section": "Forms CT-05 to CT-07",
        "jurisdiction": "india",
        "category": "Clinical Trials",
        "text": (
            "Forms CT-05, CT-06, and CT-07 under the New Drugs and Clinical Trials Rules, 2019 are used for reporting "
            "and monitoring during clinical trials. Form CT-05 is the format for serious adverse event (SAE) reporting "
            "to the CDSCO. Form CT-06 is the application for permission to conduct a clinical trial in a new site or "
            "to add an investigator. Form CT-07 is the format for submitting the clinical trial status report. These "
            "forms ensure that the regulatory authority is kept informed of the progress and safety of ongoing trials "
            "of AYUSH-derived drugs, thereby protecting patient safety."
        )
    },
    
    # ===================== FOOD SAFETY AND STANDARDS (AYURVEDA AAHAR) REGULATIONS, 2022 =====================
    {
        "id": "fssai_ayurveda_aahar_2022_reg_6",
        "statute": "FSSAI (Ayurveda Aahar) Regulations, 2022",
        "section": "Regulation 6",
        "jurisdiction": "india",
        "category": "Ayurveda Aahar",
        "text": (
            "Regulation 6 of the Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 lays down the conditions "
            "for the manufacture, storage, and sale of Ayurveda Aahar products. It requires that all such products be "
            "prepared in hygienic conditions, free from contaminants, and in compliance with the Food Safety and "
            "Standards Act, 2006. The manufacturing facility must have proper storage for raw materials, adequate "
            "processing equipment, and quality control measures. The regulation also prohibits the use of synthetic "
            "additives and requires that the products be stored and transported in a manner that prevents "
            "contamination and degradation. Compliance is verified through periodic inspections by FSSAI officials."
        )
    },
    {
        "id": "fssai_ayurveda_aahar_2022_reg_7",
        "statute": "FSSAI (Ayurveda Aahar) Regulations, 2022",
        "section": "Regulation 7",
        "jurisdiction": "india",
        "category": "Ayurveda Aahar",
        "text": (
            "Regulation 7 of the Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 prescribes the maximum "
            "limits for contaminants, toxins, and residues in Ayurveda Aahar products. These limits include heavy "
            "metals (lead, arsenic, mercury, cadmium), pesticide residues, aflatoxins, and microbial contamination. "
            "The limits are aligned with those set for general food categories under the Food Safety and Standards "
            "(Contaminants, Toxins and Residues) Regulations, 2011. For AYUSH products that contain herbs grown in "
            "various regions, monitoring these contaminants is critical to ensure consumer safety. Products exceeding "
            "the prescribed limits are deemed unsafe and cannot be sold."
        )
    },
    {
        "id": "fssai_ayurveda_aahar_2022_schedule_b",
        "statute": "FSSAI (Ayurveda Aahar) Regulations, 2022",
        "section": "Schedule B",
        "jurisdiction": "india",
        "category": "Ayurveda Aahar",
        "text": (
            "Schedule B of the Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 lists the food additives "
            "permitted for use in Ayurveda Aahar products. Only natural additives such as certain preservatives, "
            "antioxidants, and colouring agents derived from natural sources are allowed, and only in specified "
            "quantities. Synthetic additives, artificial flavours, and chemical preservatives are prohibited. The "
            "schedule also specifies the maximum levels of each additive that may be used. This ensures that Ayurveda "
            "Aahar remains a natural and wholesome food category, consistent with the principles of Ayurveda."
        )
    },
    {
        "id": "fssai_ayurveda_aahar_2022_schedule_c",
        "statute": "FSSAI (Ayurveda Aahar) Regulations, 2022",
        "section": "Schedule C",
        "jurisdiction": "india",
        "category": "Ayurveda Aahar",
        "text": (
            "Schedule C of the Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 prescribes the labelling "
            "and packaging requirements specific to Ayurveda Aahar products. The label must include the product name, "
            "net quantity, list of ingredients, nutritional information if applicable, FSSAI license number, batch "
            "number, date of manufacture and expiry, and storage conditions. It must also carry the statement 'This "
            "product is not intended to diagnose, treat, cure or prevent any disease' and must not make any medicinal "
            "claims. The packaging must be food-grade and prevent contamination. Compliance with this schedule is "
            "mandatory for all Ayurveda Aahar products in the market."
        )
    },
    {
        "id": "fssai_labelling_regulations_2020_cross_ref",
        "statute": "Food Safety and Standards (Labelling and Display) Regulations, 2020",
        "section": "Cross-Reference",
        "jurisdiction": "india",
        "category": "Ayurveda Aahar",
        "text": (
            "The Food Safety and Standards (Labelling and Display) Regulations, 2020 apply to all packaged food "
            "products, including Ayurveda Aahar, and provide general labelling requirements that supplement the "
            "specific provisions of the Ayurveda Aahar Regulations. These include mandatory declarations such as "
            "vegetarian/non-vegetarian logo, allergen information, and the name and address of the manufacturer. "
            "For Ayurveda Aahar, the label must also comply with the restrictions on medicinal claims and the "
            "prohibition of synthetic additives as per the specific regulations. The combined reading of these "
            "regulations ensures that consumers receive accurate and transparent information about the product."
        )
    },
    
    # ===================== DRUGS AND MAGIC REMEDIES ACT, 1954 =====================
    {
        "id": "dmr_act_1954_sec_5",
        "statute": "Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954",
        "section": "Section 5",
        "jurisdiction": "india",
        "category": "Advertising Law",
        "text": (
            "Section 5 of the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 empowers any Gazetted "
            "Officer authorised by the State Government to enter and search any premises where there is reason to "
            "believe that an offence under the Act has been or is being committed. The officer may seize any documents, "
            "advertisements, or drugs that are evidence of the offence. This provision is used by drug control "
            "authorities to take action against manufacturers and advertisers of AYUSH products that make prohibited "
            "disease-cure claims. The search and seizure powers are subject to the provisions of the Code of Criminal "
            "Procedure, 1973."
        )
    },
    {
        "id": "dmr_act_1954_sec_6",
        "statute": "Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954",
        "section": "Section 6",
        "jurisdiction": "india",
        "category": "Advertising Law",
        "text": (
            "Section 6 of the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 prescribes the penalty "
            "for contravention of the Act. Any person who contravenes the provisions of Section 3 or Section 4 shall "
            "be punishable with imprisonment for a term which may extend to six months, or with fine, or with both on "
            "first conviction. On a subsequent conviction, the imprisonment may extend to one year. The court may also "
            "order the forfeiture of the offending advertisements and the drugs to which they relate. This section "
            "acts as a deterrent against misleading AYUSH advertisements and ensures compliance with the prohibition "
            "on disease-cure claims."
        )
    },
    {
        "id": "dmr_act_1954_schedule_full",
        "statute": "Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954",
        "section": "Schedule (Full List)",
        "jurisdiction": "india",
        "category": "Advertising Law",
        "text": (
            "The Schedule to the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 lists the following "
            "54 diseases, disorders, and conditions for which no advertisement of a drug or remedy is permitted: "
            "1. Appendicitis; 2. Arteriosclerosis; 3. Blindness; 4. Blood poisoning; 5. Bright's disease; 6. Cancer; "
            "7. Cataract; 8. Deafness; 9. Diabetes; 10. Diseases and disorders of the brain; 11. Diseases and disorders "
            "of the optical system; 12. Diseases and disorders of the uterus; 13. Disorders of menstrual flow; "
            "14. Disorders of the nervous system; 15. Disorders of the prostatic gland; 16. Dropsy; 17. Epilepsy; "
            "18. Female diseases (in general); 19. Fevers (in general); 20. Fits; 21. Forms and structure of the female "
            "bust; 22. Gall stones, kidney stones and bladder stones; 23. Gangrene; 24. Glaucoma; 25. Goitre; "
            "26. Heart diseases; 27. High or low blood pressure; 28. Hydrocele; 29. Hysteria; 30. Infantile paralysis; "
            "31. Insanity; 32. Leprosy; 33. Leucoderma; 34. Lockjaw; 35. Locomotor ataxia; 36. Lupus; 37. Nervous "
            "debility; 38. Obesity; 39. Paralysis; 40. Plague; 41. Pleurisy; 42. Pneumonia; 43. Rheumatism; "
            "44. Ruptures; 45. Sexual impotence; 46. Smallpox; 47. Stature of persons; 48. Sterility in women; "
            "49. Trachoma; 50. Tuberculosis; 51. Tumours; 52. Typhoid fever; 53. Ulcers of the gastro-intestinal "
            "tract; 54. Venereal diseases. This exhaustive list covers all major diseases for which no AYUSH product "
            "can claim cure or prevention."
        )
    },
    
    # ===================== DIGITAL PERSONAL DATA PROTECTION (DPDP) ACT, 2023 =====================
    {
        "id": "dpdp_act_2023_sec_4",
        "statute": "Digital Personal Data Protection Act, 2023",
        "section": "Section 4",
        "jurisdiction": "india",
        "category": "Data Privacy",
        "text": (
            "Section 4 of the Digital Personal Data Protection Act, 2023 specifies the grounds for processing personal "
            "data. Processing is lawful only if based on the consent of the Data Principal, or for certain legitimate "
            "uses such as compliance with legal obligations, medical emergencies, or employment purposes. For AYUSH "
            "enterprises that collect patient data for clinical trials or user information for digital health apps, "
            "obtaining explicit consent is mandatory. The consent must be free, specific, informed, unconditional, and "
            "unambiguous, with a clear affirmative action. This section ensures that personal data is not processed "
            "without a valid legal basis."
        )
    },
    {
        "id": "dpdp_act_2023_sec_5",
        "statute": "Digital Personal Data Protection Act, 2023",
        "section": "Section 5",
        "jurisdiction": "india",
        "category": "Data Privacy",
        "text": (
            "Section 5 of the Digital Personal Data Protection Act, 2023 requires that every request for consent must "
            "be accompanied by a notice that clearly describes the personal data to be collected, the purpose of "
            "processing, the rights of the Data Principal, and how to withdraw consent. The notice must be in simple "
            "and clear language, and the Data Principal must be able to access it in English or any of the 22 "
            "languages specified in the Constitution. For AYUSH platforms that collect health-related data, this "
            "section ensures transparency and empowers users to make informed decisions about their personal "
            "information."
        )
    },
    {
        "id": "dpdp_act_2023_sec_8_1_3",
        "statute": "Digital Personal Data Protection Act, 2023",
        "section": "Section 8(1)-(3)",
        "jurisdiction": "india",
        "category": "Data Privacy",
        "text": (
            "Sections 8(1) to 8(3) of the Digital Personal Data Protection Act, 2023 impose general obligations on "
            "Data Fiduciaries. These include: (1) processing personal data only for the purpose for which it was "
            "collected; (2) ensuring the accuracy and completeness of the data; (3) implementing appropriate technical "
            "and organisational measures to protect data; (4) not retaining personal data longer than necessary; and "
            "(5) establishing grievance redressal mechanisms. For AYUSH businesses that handle sensitive health data "
            "or proprietary research data, compliance with these obligations is critical to avoid penalties and "
            "maintain trust."
        )
    },
    {
        "id": "dpdp_act_2023_sec_9",
        "statute": "Digital Personal Data Protection Act, 2023",
        "section": "Section 9",
        "jurisdiction": "india",
        "category": "Data Privacy",
        "text": (
            "Section 9 of the Digital Personal Data Protection Act, 2023 enumerates the rights of Data Principals. "
            "These include the right to access information about their personal data, the right to correction and "
            "erasure, the right to grievance redressal, and the right to nominate a representative. Data Principals "
            "also have the right to withdraw consent at any time. For AYUSH patients and research participants, this "
            "section empowers them to control their personal health information. Data Fiduciaries must establish "
            "mechanisms to facilitate these rights within specified timelines."
        )
    },
    
    # ===================== OTHER INDIAN LAWS RELEVANT TO AYUSH =====================
    {
        "id": "ppvfr_act_2001_sec_15",
        "statute": "Protection of Plant Varieties and Farmers' Rights Act, 2001",
        "section": "Section 15",
        "jurisdiction": "india",
        "category": "Plant Variety Protection",
        "text": (
            "Section 15 of the Protection of Plant Varieties and Farmers' Rights Act, 2001 specifies the criteria for "
            "registrability of plant varieties. A new variety must be novel, distinct, uniform, and stable (NDUS). "
            "An extant variety may be registered if it is distinct, uniform, and stable. For farmers' varieties, the "
            "registration is based on distinctiveness, uniformity, and stability without the novelty requirement. "
            "Medicinal plant varieties used in AYUSH, such as Ashwagandha, Tulsi, or Sarpagandha, can be registered "
            "under this Act, providing exclusive rights to the breeder or farmer. This is an alternative to patent "
            "protection and is specifically designed for plant genetic resources."
        )
    },
    {
        "id": "ppvfr_act_2001_sec_16",
        "statute": "Protection of Plant Varieties and Farmers' Rights Act, 2001",
        "section": "Section 16",
        "jurisdiction": "india",
        "category": "Plant Variety Protection",
        "text": (
            "Section 16 of the Protection of Plant Varieties and Farmers' Rights Act, 2001 lists the persons who may "
            "make an application for registration of a plant variety. These include breeders, farmers, groups of "
            "farmers, universities, and public sector institutions. For AYUSH, this allows both individual farmers "
            "who have developed a new medicinal plant strain and research institutions to seek protection. The "
            "application must be accompanied by the prescribed fee and details of the variety's pedigree, morphological "
            "characteristics, and any known traditional use."
        )
    },
    {
        "id": "gi_act_1999_sec_2",
        "statute": "Geographical Indications of Goods (Registration and Protection) Act, 1999",
        "section": "Section 2",
        "jurisdiction": "india",
        "category": "Geographical Indications",
        "text": (
            "Section 2 of the Geographical Indications of Goods (Registration and Protection) Act, 1999 defines a "
            "geographical indication (GI) as an indication that identifies goods as originating from a specific "
            "territory where a given quality, reputation, or characteristic is essentially attributable to its "
            "geographical origin. For AYUSH, products like 'Kashmiri Saffron', 'Navara Rice', 'Palakkadan Matta Rice', "
            "and certain regional herbs may be registered as GIs. GI protection prevents unauthorised use of the "
            "geographical name by producers outside the region, thereby preserving the authenticity and economic value "
            "of traditional products."
        )
    },
    {
        "id": "indian_medicine_council_act_1970_sec_2",
        "statute": "Indian Medicine Central Council Act, 1970",
        "section": "Section 2",
        "jurisdiction": "india",
        "category": "AYUSH Practitioner Regulation",
        "text": (
            "Section 2 of the Indian Medicine Central Council Act, 1970 provides definitions for the regulation of "
            "AYUSH practitioners. It defines 'Indian medicine' as the system of medicine known as Ashtang Ayurveda, "
            "Siddha, or Unani Tibb, and 'registered practitioner' as a person whose name is entered in the register "
            "maintained under the Act. This Act established the Central Council of Indian Medicine (CCIM) to regulate "
            "education and practice. For IP-SAKTI, verifying the registration status of AYUSH practitioners may be "
            "necessary when evaluating claims based on traditional knowledge or when determining exemptions under the "
            "Biological Diversity Act."
        )
    },
    {
        "id": "ncism_act_2020_sec_2",
        "statute": "National Commission for Indian System of Medicine Act, 2020",
        "section": "Section 2",
        "jurisdiction": "india",
        "category": "AYUSH Practitioner Regulation",
        "text": (
            "Section 2 of the National Commission for Indian System of Medicine Act, 2020 defines terms and "
            "establishes the National Commission for Indian System of Medicine (NCISM) as the successor to the Central "
            "Council of Indian Medicine. The NCISM regulates the education, practice, and ethics of Ayurveda, Siddha, "
            "and Unani practitioners. It sets standards for undergraduate and postgraduate education, maintains the "
            "register of practitioners, and has the power to recognise or de-recognise qualifications. For AYUSH "
            "enterprises, compliance with NCISM regulations is essential for employing qualified practitioners and for "
            "availing exemptions under the Biological Diversity Act's 2023 amendment."
        )
    },
    {
        "id": "legal_metrology_act_2009_sec_18",
        "statute": "Legal Metrology Act, 2009",
        "section": "Section 18",
        "jurisdiction": "india",
        "category": "Packaging & Labeling",
        "text": (
            "Section 18 of the Legal Metrology Act, 2009 prescribes the requirements for pre-packaged commodities, "
            "including Ayurvedic medicines and Ayurveda Aahar. Every package must bear a declaration of the net "
            "quantity in standard units of weight or measure, the name and address of the manufacturer or packer, the "
            "date of manufacture, and the maximum retail price (MRP). The declarations must be in Hindi or English and "
            "must be legible and prominent. Non-compliance can lead to penalties and confiscation of goods. For AYUSH "
            "products, this ensures that consumers receive accurate quantity and pricing information."
        )
    },
    {
        "id": "consumer_protection_act_2019_sec_2",
        "statute": "Consumer Protection Act, 2019",
        "section": "Section 2",
        "jurisdiction": "india",
        "category": "Consumer Protection",
        "text": (
            "Section 2 of the Consumer Protection Act, 2019 defines 'consumer' and 'defect' in goods and services. A "
            "consumer is any person who buys goods or hires services for consideration. A defect is any fault, "
            "imperfection, or shortcoming in the quality, quantity, potency, purity, or standard required by law. For "
            "AYUSH products, if a medicine or Ayurveda Aahar is found to be adulterated, misbranded, or does not meet "
            "the claimed efficacy, the consumer can file a complaint before the Consumer Commission. The Act provides "
            "for compensation, replacement, and punitive damages, thereby holding manufacturers accountable."
        )
    },

    {
        "id": "patents_act_1970_sec_2_1_j",
        "statute": "Patents Act, 1970",
        "section": "Section 2(1)(j)",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 2(1)(j) of the Patents Act, 1970 defines 'invention' as a new product or process involving an "
            "inventive step and capable of industrial application. This definition is foundational: any AYUSH‑related "
            "innovation must satisfy all three criteria to be patentable. A mere discovery, a scientific principle, or an "
            "abstract idea is not an invention. For traditional knowledge, a new use of a known herb without a technical "
            "advancement fails this definition. The term 'new' means not anticipated by prior art anywhere in the world, "
            "'inventive step' means a feature that is not obvious to a person skilled in the art, and 'industrial "
            "application' means capable of being made or used in an industry."
        )
    },

    {
        "id": "patents_act_1970_sec_2_1_ja",
        "statute": "Patents Act, 1970",
        "section": "Section 2(1)(ja)",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 2(1)(ja) of the Patents Act, 1970 defines 'inventive step' as a feature of an invention that involves "
            "technical advance as compared to existing knowledge or having economic significance or both, and that makes "
            "the invention not obvious to a person skilled in the art. For AYUSH formulations, simply combining known "
            "herbs in standard proportions is obvious. An inventive step may exist if the process yields a new chemical "
            "entity, an unexpected synergistic effect, or a significantly improved bioavailability. The applicant must "
            "demonstrate this with experimental evidence, not mere assertions."
        )
    },

    {
        "id": "patents_act_1970_sec_84",
        "statute": "Patents Act, 1970",
        "section": "Section 84",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 84 of the Patents Act, 1970 allows any interested person to apply for a compulsory licence after "
            "three years from the grant of a patent, on grounds that: (a) the reasonable requirements of the public have "
            "not been satisfied; (b) the patented invention is not available at a reasonably affordable price; or (c) the "
            "patented invention is not worked in India. For AYUSH, this provision can be used to ensure access to "
            "essential herbal medicines if the patentee fails to meet public demand or charges exorbitant prices. The "
            "Controller may grant a licence with terms including royalty and conditions to remedy the default."
        )
    },
    {
        "id": "patents_act_1970_sec_92a",
        "statute": "Patents Act, 1970",
        "section": "Section 92A",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 92A of the Patents Act, 1970 provides for compulsory licensing for export of patented pharmaceutical "
            "products to countries with insufficient or no manufacturing capacity, to address public health problems. "
            "This is relevant for AYUSH drugs if they are patented and needed in developing countries. The Controller may "
            "grant a licence to manufacture and export the product to a specified country, subject to conditions. This "
            "provision implements the Doha Declaration on TRIPS and Public Health."
        )
    },
    {
        "id": "bd_act_2002_sec_2_c",
        "statute": "Biological Diversity Act, 2002 (Amended 2023)",
        "section": "Section 2(c)",
        "jurisdiction": "india",
        "category": "Biodiversity & ABS",
        "text": (
            "Section 2(c) of the Biological Diversity Act, 2002 defines 'biological resources' as plants, animals, "
            "micro‑organisms or parts thereof, their genetic material and by‑products, with actual or potential use or "
            "value, but does not include human genetic material. This definition covers medicinal plants, herbs, "
            "micro‑organisms used in fermentation, and even extracts if they retain biological value. For AYUSH, any "
            "access to or use of such resources for research or commerce triggers the regulatory provisions of the Act. "
            "The 2023 amendment clarified that 'codified traditional knowledge' is treated separately and not as a "
            "biological resource."
        )
    },
    {
        "id": "bd_act_2002_sec_55",
        "statute": "Biological Diversity Act, 2002 (Amended 2023)",
        "section": "Section 55",
        "jurisdiction": "india",
        "category": "Biodiversity & ABS",
        "text": (
            "Section 55 of the Biological Diversity Act, 2002 prescribes penalties for contravention of the Act. Any "
            "person who violates the provisions of Sections 3, 4, or 6 (access without approval, transfer of results "
            "without approval, or applying for IPR without approval) is punishable with imprisonment up to five years, or "
            "fine up to ₹10 lakh, or both. For subsequent offences, the imprisonment may extend to seven years and fine "
            "up to ₹20 lakh. Additionally, the court may order forfeiture of the biological resources and any products "
            "derived from them. These stringent penalties deter biopiracy and ensure compliance."
        )
    },
    {
        "id": "drugs_cosmetics_act_1940_sec_33eed",
        "statute": "Drugs and Cosmetics Act, 1940",
        "section": "Section 33EED",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Section 33EED of the Drugs and Cosmetics Act, 1940 prohibits the manufacture, sale, or distribution of any "
            "Ayurvedic, Siddha or Unani drug which is not licensed, or which is spurious, misbranded, or adulterated as "
            "defined in Sections 33EEA, 33EEB, and 33EEC. It also prohibits the manufacture of any ASU drug in "
            "contravention of the conditions of a licence. Any person found violating this provision is liable to "
            "penalties under Section 33EEF, which may include imprisonment and fine. This section empowers drug "
            "controllers to seize and destroy unlicensed or substandard ASU products."
        )
    },
    {
        "id": "drugs_cosmetics_rules_1945_rule_157",
        "statute": "Drugs and Cosmetics Rules, 1945",
        "section": "Rule 157",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Rule 157 of the Drugs and Cosmetics Rules, 1945 specifies the conditions under which Ayurvedic, Siddha or "
            "Unani drugs may be sold. No person shall sell any ASU drug except under a valid licence granted by the "
            "licensing authority. The seller must maintain records of purchase and sale, store the drugs under proper "
            "conditions, and ensure that the drugs are not expired. For Schedule E(1) poisonous drugs, additional "
            "restrictions apply: they must be sold only on prescription, and the sale must be recorded in a separate "
            "register. Violation of these conditions can lead to suspension or cancellation of the licence."
        )
    },
    {
        "id": "drugs_cosmetics_rules_1945_rule_160",
        "statute": "Drugs and Cosmetics Rules, 1945",
        "section": "Rule 160",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Rule 160 of the Drugs and Cosmetics Rules, 1945 prescribes the procedure for applying for a licence to "
            "manufacture Ayurvedic, Siddha or Unani drugs. The application must be made in Form 24D, accompanied by the "
            "prescribed fee, a layout plan of the premises, list of equipment, and details of the technical staff. The "
            "licensing authority may inspect the premises to verify compliance with Schedule T and Schedule Z before "
            "granting the licence. If satisfied, the licence is issued in Form 25D (for classical drugs) or Form 25E "
            "(for patent or proprietary medicines). The licence is valid for five years and must be renewed."
        )
    },
    {
        "id": "ndct_rules_2019_rule_2_1_w",
        "statute": "New Drugs and Clinical Trials Rules, 2019",
        "section": "Rule 2(1)(w)",
        "jurisdiction": "india",
        "category": "Clinical Trials",
        "text": (
            "Rule 2(1)(w) of the New Drugs and Clinical Trials Rules, 2019 includes in the definition of 'new drug' any "
            "biological product such as vaccines, recombinant DNA products, monoclonal antibodies, stem cells, gene "
            "therapy products, etc. For AYUSH, if a product involves biological manufacturing techniques, even if derived "
            "from traditional sources, it may fall under this definition and require CDSCO approval. This is distinct "
            "from phytopharmaceuticals and ensures that all modern biologicals, regardless of origin, are regulated as "
            "new drugs."
        )
    },
    {
        "id": "ndct_rules_2019_schedule_v",
        "statute": "New Drugs and Clinical Trials Rules, 2019",
        "section": "Schedule V",
        "jurisdiction": "india",
        "category": "Clinical Trials",
        "text": (
            "Schedule V of the New Drugs and Clinical Trials Rules, 2019 describes the phases of clinical trials and the "
            "specific objectives, design, and data requirements for each phase. Phase I focuses on safety and "
            "pharmacokinetics in a small number of healthy volunteers; Phase II evaluates efficacy and side effects in "
            "patients; Phase III confirms therapeutic benefit in a larger patient population; Phase IV (post‑marketing "
            "surveillance) monitors long‑term safety. For phytopharmaceuticals and other AYUSH‑derived new drugs, all "
            "phases may be required unless the CDSCO grants a waiver based on existing safety data."
        )
    },
    {
        "id": "fssai_ayurveda_aahar_2022_reg_11",
        "statute": "FSSAI (Ayurveda Aahar) Regulations, 2022",
        "section": "Regulation 11",
        "jurisdiction": "india",
        "category": "Ayurveda Aahar",
        "text": (
            "Regulation 11 of the Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 deals with the import of "
            "Ayurveda Aahar products. No person shall import any Ayurveda Aahar into India unless the product complies "
            "with the standards specified in these regulations and the importer holds a valid FSSAI import licence. The "
            "imported product must be labelled in accordance with Schedule C and must not make any medicinal claims. "
            "Customs authorities may detain non‑compliant consignments, and the FSSAI can order their destruction or "
            "re‑export. This regulation ensures that imported Ayurveda Aahar meets Indian safety and quality standards."
        )
    },
    {
        "id": "dmr_act_1954_sec_7",
        "statute": "Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954",
        "section": "Section 7",
        "jurisdiction": "india",
        "category": "Advertising Law",
        "text": (
            "Section 7 of the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 deals with offences by "
            "companies. If a company commits an offence under the Act, every person who was in charge of, or responsible "
            "to, the company for the conduct of its business at the time of the offence shall be deemed guilty, unless "
            "they prove that the offence was committed without their knowledge or that they exercised due diligence. "
            "This provision extends liability to directors, managers, and officers, making them personally accountable "
            "for prohibited advertisements of AYUSH products. It strengthens enforcement and encourages corporate "
            "compliance."
        )
    },
    {
        "id": "consumer_protection_act_2019_sec_85",
        "statute": "Consumer Protection Act, 2019",
        "section": "Section 85",
        "jurisdiction": "india",
        "category": "Consumer Protection",
        "text": (
            "Section 85 of the Consumer Protection Act, 2019 establishes product liability. A product manufacturer or "
            "seller shall be liable if the product is defective, or if it does not conform to the express warranty, or if "
            "adequate instructions or warnings are not provided. For AYUSH medicines or Ayurveda Aahar, if a product "
            "causes harm due to contamination, mislabelling, or lack of adequate warnings (e.g., for Schedule E(1) "
            "poisonous ingredients), the consumer can claim compensation. The manufacturer can be held liable even "
            "without proof of negligence. This provision ensures accountability for defective AYUSH products."
        )
    },
    {
        "id": "wildlife_protection_act_1972_sec_9",
        "statute": "Wildlife Protection Act, 1972",
        "section": "Section 9",
        "jurisdiction": "india",
        "category": "Biodiversity & ABS",
        "text": (
            "Section 9 of the Wildlife Protection Act, 1972 prohibits the hunting of any wild animal specified in "
            "Schedules I, II, III, and IV. Many medicinal plants and animals used in AYUSH, such as certain orchids, "
            "musk deer, and pangolins, are protected under these schedules. Any person who hunts or collects such "
            "species without a permit is liable to imprisonment and fine. This law is crucial for AYUSH manufacturers to "
            "ensure that their raw materials are sourced legally and sustainably. Using protected species can lead to "
            "cancellation of licences and criminal prosecution."
        )
    },
    {
        "id": "legal_metrology_act_2009_sec_36",
        "statute": "Legal Metrology Act, 2009",
        "section": "Section 36",
        "jurisdiction": "india",
        "category": "Packaging & Labeling",
        "text": (
            "Section 36 of the Legal Metrology Act, 2009 prescribes penalties for contravention of the Act. Any person "
            "who manufactures, sells, or distributes any pre‑packaged commodity without the required declarations, or "
            "with incorrect declarations, is punishable with a fine which may extend to ₹25,000 for the first offence, "
            "₹50,000 for the second, and ₹1,00,000 for subsequent offences. For AYUSH products, this applies to net "
            "quantity, MRP, manufacturer details, and date markings. Non‑compliance can lead to seizure of goods and "
            "prosecution."
        )
    },

        # ===================== ADDITIONAL PATENTS ACT SECTIONS =====================
    {
        "id": "patents_act_1970_sec_3f",
        "statute": "Patents Act, 1970",
        "section": "Section 3(f)",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 3(f) of the Patents Act, 1970 excludes from patentability the mere arrangement or re‑arrangement "
            "or duplication of known devices each functioning independently of one another in a known way. In the "
            "context of AYUSH, this could apply to a combination of known extraction units or a simple assembly of "
            "existing machinery for preparing herbal formulations. If the invention is merely a juxtaposition of "
            "known components with no functional interdependence or synergistic result, it is not patentable. The "
            "applicant must demonstrate a new technical effect arising from the combination."
        )
    },
    {
        "id": "patents_act_1970_sec_3g",
        "statute": "Patents Act, 1970",
        "section": "Section 3(g)",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 3(g) of the Patents Act, 1970 bars the patenting of a method of testing, or a method of "
            "agriculture or horticulture. This is broader than Section 3(h) and includes any testing method, whether "
            "for quality control of AYUSH formulations or for analysing herbal ingredients. It also reinforces the "
            "exclusion of agricultural and horticultural methods. However, a product or apparatus used in such "
            "testing may be patentable if it meets novelty and inventive step requirements."
        )
    },
    {
        "id": "patents_act_1970_sec_3l",
        "statute": "Patents Act, 1970",
        "section": "Section 3(l)",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 3(l) of the Patents Act, 1970 excludes from patentability a literary, dramatic, musical or "
            "artistic work or any other aesthetic creation whatsoever including cinematographic works and television "
            "productions. While this is primarily for copyright subject matter, it is mentioned to clarify that "
            "creative expressions related to AYUSH, such as illustrations of medicinal plants or educational videos, "
            "are protected under copyright law, not patents. The patent system is reserved for technical innovations."
        )
    },
    {
        "id": "patents_act_1970_sec_3m",
        "statute": "Patents Act, 1970",
        "section": "Section 3(m)",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 3(m) of the Patents Act, 1970 excludes a mere scheme or rule or method of performing mental act "
            "or method of playing game. In the AYUSH context, this could include a diagnostic algorithm based on "
            "traditional pulse reading or a method of meditation or yoga. Such methods, being mental acts or "
            "non‑technical schemes, are not patentable. However, a device that aids in performing such methods (e.g., "
            "a Nadi Pariksha instrument) may be patentable if it involves technical features."
        )
    },
    {
        "id": "patents_act_1970_sec_3n",
        "statute": "Patents Act, 1970",
        "section": "Section 3(n)",
        "jurisdiction": "india",
        "category": "Patent Law",
        "text": (
            "Section 3(n) of the Patents Act, 1970 excludes a presentation of information. A mere arrangement of "
            "data, such as a chart of herbal properties or a database of traditional formulations, is not patentable. "
            "However, the underlying database structure or a novel method of storing and retrieving such information "
            "may be patentable if it involves a technical solution. This is relevant for IP‑SAKTI itself: the "
            "knowledge corpus and UI are not patentable, but the AI algorithms and technical architecture could be."
        )
    },

    # ===================== ADDITIONAL BIOLOGICAL DIVERSITY RULES =====================
    {
        "id": "bd_rules_2024_rule_15",
        "statute": "Biological Diversity Rules, 2024",
        "section": "Rule 15",
        "jurisdiction": "india",
        "category": "Biodiversity & ABS",
        "text": (
            "Rule 15 of the Biological Diversity Rules, 2024 prescribes the procedure for obtaining approval from the "
            "National Biodiversity Authority for the transfer of results of research under Section 19. The applicant "
            "must submit an application in the prescribed form, detailing the nature of the research, the biological "
            "resource involved, and the entity to whom the results are to be transferred. The NBA evaluates whether "
            "the transfer would be in compliance with benefit‑sharing obligations and whether the recipient is "
            "eligible under the Act. Approval may be granted with conditions, including payment of any outstanding "
            "benefit‑sharing amounts."
        )
    },
    {
        "id": "bd_rules_2024_rule_17",
        "statute": "Biological Diversity Rules, 2024",
        "section": "Rule 17",
        "jurisdiction": "india",
        "category": "Biodiversity & ABS",
        "text": (
            "Rule 17 of the Biological Diversity Rules, 2024 deals with the determination of equitable benefit‑sharing "
            "by the National Biodiversity Authority. When granting approvals under Sections 3 or 6, the NBA may impose "
            "benefit‑sharing obligations on the applicant. The rule specifies the factors to be considered, including "
            "the commercial value of the resource, the stage of value addition, the type of product, and the market "
            "size. The NBA may require monetary payments (royalties, fees) or non‑monetary benefits (technology "
            "transfer, capacity building). The amount is typically 0.1% to 0.5% of gross sales for manufacturers, or "
            "3% to 5% of purchase price for traders, as per the ABS Regulations."
        )
    },
    {
        "id": "bd_rules_2024_rule_18",
        "statute": "Biological Diversity Rules, 2024",
        "section": "Rule 18",
        "jurisdiction": "india",
        "category": "Biodiversity & ABS",
        "text": (
            "Rule 18 of the Biological Diversity Rules, 2024 provides for the manner of depositing benefit‑sharing "
            "amounts. All monetary benefits must be deposited in the National Biodiversity Fund or the concerned State "
            "Biodiversity Fund, as directed by the NBA. The rule also requires the maintenance of records and the "
            "submission of annual reports by the beneficiary. Failure to deposit the benefit‑sharing amount within the "
            "stipulated time may lead to cancellation of the approval and initiation of penalty proceedings under "
            "Section 55 of the Act."
        )
    },

    # ===================== ADDITIONAL DRUGS RULES =====================
    {
        "id": "drugs_cosmetics_rules_1945_rule_159",
        "statute": "Drugs and Cosmetics Rules, 1945",
        "section": "Rule 159",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Rule 159 of the Drugs and Cosmetics Rules, 1945 prescribes the conditions for the grant and renewal of a "
            "licence to manufacture Ayurvedic, Siddha or Unani drugs. The licensing authority may grant a licence if "
            "the applicant has adequate premises, equipment, and technical staff as required under Schedule Z and "
            "Schedule T. The licence is valid for five years and may be renewed on application. The licensee must "
            "comply with all provisions of the Act and Rules, maintain proper records, and allow inspection by drug "
            "authorities. Any change in the technical staff or premises must be reported."
        )
    },
    {
        "id": "drugs_cosmetics_rules_1945_rule_162",
        "statute": "Drugs and Cosmetics Rules, 1945",
        "section": "Rule 162",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Rule 162 of the Drugs and Cosmetics Rules, 1945 specifies the duration of a licence and the conditions "
            "for its renewal. A licence to manufacture ASU drugs is valid for five years from the date of issue. "
            "Application for renewal must be made before expiry, accompanied by the prescribed fee. If the application "
            "is made after expiry but within six months, a late fee may be charged. The licensing authority may refuse "
            "renewal if the licensee has violated any provision of the Act or Rules. The licence is non‑transferable "
            "except with the permission of the authority."
        )
    },
    {
        "id": "drugs_cosmetics_rules_1945_rule_163",
        "statute": "Drugs and Cosmetics Rules, 1945",
        "section": "Rule 163",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Rule 163 of the Drugs and Cosmetics Rules, 1945 provides for the suspension, cancellation, or revocation "
            "of a licence. The licensing authority may suspend or cancel a licence if the licensee contravenes any "
            "provision of the Act or Rules, or if the manufacture is carried out in insanitary conditions, or if the "
            "drug is found to be spurious, misbranded, or adulterated. Before cancellation, the licensee is given an "
            "opportunity to show cause. During suspension, the licensee cannot manufacture or sell any ASU drug. The "
            "authority may also order the destruction of substandard drugs."
        )
    },
    {
        "id": "drugs_cosmetics_rules_1945_rule_164",
        "statute": "Drugs and Cosmetics Rules, 1945",
        "section": "Rule 164",
        "jurisdiction": "india",
        "category": "Drug Licensing",
        "text": (
            "Rule 164 of the Drugs and Cosmetics Rules, 1945 deals with the conditions for the sale of ASU drugs. "
            "No person shall sell any ASU drug unless it is purchased from a licensed manufacturer or dealer. The "
            "seller must maintain records of purchases and sales, including the name of the manufacturer, batch "
            "number, and date of expiry. For Schedule E(1) poisonous drugs, the seller must maintain a separate "
            "register and sell only on the prescription of a registered practitioner. The licensing authority may "
            "inspect the records at any time. Violation can lead to suspension or cancellation of the sale licence."
        )
    },

    # ===================== ADDITIONAL FSSAI REGULATIONS =====================
    {
        "id": "fssai_import_regulations_2017",
        "statute": "Food Safety and Standards (Import) Regulations, 2017",
        "section": "General",
        "jurisdiction": "india",
        "category": "Ayurveda Aahar",
        "text": (
            "The Food Safety and Standards (Import) Regulations, 2017 govern the import of food products, including "
            "Ayurveda Aahar, into India. Importers must obtain an FSSAI import licence and file a Bill of Entry with "
            "the customs authorities. Each consignment is subject to risk‑based inspection, sampling, and testing at "
            "designated laboratories. If the product fails to meet Indian standards, it may be rejected, destroyed, or "
            "re‑exported. The importer is responsible for ensuring that the Ayurveda Aahar complies with the Ayurveda "
            "Aahar Regulations, 2022, including the prohibition on synthetic additives and medicinal claims. Repeated "
            "violations can lead to cancellation of the import licence."
        )
    },
    {
        "id": "fssai_packaging_regulations_2018",
        "statute": "Food Safety and Standards (Packaging) Regulations, 2018",
        "section": "General",
        "jurisdiction": "india",
        "category": "Ayurveda Aahar",
        "text": (
            "The Food Safety and Standards (Packaging) Regulations, 2018 prescribe the requirements for food packaging "
            "materials, including those used for Ayurveda Aahar. Packaging must be made of food‑grade materials that "
            "do not migrate harmful substances into the food. It must be suitable for the intended storage conditions "
            "and protect the product from contamination. For Ayurveda Aahar, the packaging must also comply with the "
            "specific labelling requirements of the Ayurveda Aahar Regulations. The use of recycled plastics for "
            "food contact is restricted. Non‑compliance can lead to rejection of the product and penalties under the "
            "Food Safety and Standards Act, 2006."
        )
    },

    # ===================== ADDITIONAL DPDP SECTIONS =====================
    {
        "id": "dpdp_act_2023_sec_10",
        "statute": "Digital Personal Data Protection Act, 2023",
        "section": "Section 10",
        "jurisdiction": "india",
        "category": "Data Privacy",
        "text": (
            "Section 10 of the Digital Personal Data Protection Act, 2023 deals with the obligations of Significant "
            "Data Fiduciaries. The Central Government may notify certain Data Fiduciaries as Significant Data "
            "Fiduciaries based on factors such as volume and sensitivity of data processed, risk of harm to Data "
            "Principals, and impact on sovereignty and security. Such fiduciaries must appoint a Data Protection "
            "Officer, conduct Data Protection Impact Assessments, and undergo periodic audits. For large AYUSH "
            "enterprises that process extensive health data, this section imposes additional compliance burdens."
        )
    },
    {
        "id": "dpdp_act_2023_sec_11",
        "statute": "Digital Personal Data Protection Act, 2023",
        "section": "Section 11",
        "jurisdiction": "india",
        "category": "Data Privacy",
        "text": (
            "Section 11 of the Digital Personal Data Protection Act, 2023 provides for the right of Data Principals "
            "to nominate a representative to exercise their rights in the event of death or incapacity. This is "
            "particularly relevant for AYUSH platforms that store long‑term health records. The Data Principal can "
            "nominate any individual to act on their behalf. Data Fiduciaries must provide an easy mechanism for "
            "such nomination and for the representative to access, correct, or erase data as needed."
        )
    },
    {
        "id": "dpdp_act_2023_sec_12",
        "statute": "Digital Personal Data Protection Act, 2023",
        "section": "Section 12",
        "jurisdiction": "india",
        "category": "Data Privacy",
        "text": (
            "Section 12 of the Digital Personal Data Protection Act, 2023 establishes the Data Protection Board of "
            "India as the regulatory authority. The Board is responsible for monitoring compliance, receiving "
            "complaints, conducting inquiries, and imposing penalties for violations. For AYUSH enterprises, the Board "
            "is the forum where data principals can file grievances regarding misuse of their personal data. Penalties "
            "can be substantial, up to ₹250 crore for serious breaches. The Board also has the power to direct "
            "remedial measures and to recommend prosecution."
        )
    },
]

# --- 2. COMPREHENSIVE INTERNATIONAL TREATIES CORPUS (EXPANDED) ---
INTERNATIONAL_LEGAL_DATA = [
    # ===================== WIPO GRATK TREATY, 2024 (ADDITIONAL ARTICLES) =====================
    {
        "id": "wipo_gratk_2024_art_7",
        "statute": "WIPO GRATK Treaty, 2024",
        "section": "Article 7",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 7 of the WIPO GRATK Treaty addresses the relationship between the treaty and other international "
            "agreements. It states that the provisions of this treaty shall not affect the rights and obligations of "
            "contracting parties under other international agreements, including the Convention on Biological Diversity, "
            "the Nagoya Protocol, and the TRIPS Agreement. This ensures that the GRATK disclosure requirements operate "
            "in harmony with existing ABS and intellectual property frameworks. It also clarifies that the treaty does "
            "not create any new rights over genetic resources or traditional knowledge beyond what is already "
            "recognised."
        )
    },
    {
        "id": "wipo_gratk_2024_art_8",
        "statute": "WIPO GRATK Treaty, 2024",
        "section": "Article 8",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 8 of the WIPO GRATK Treaty obliges contracting parties to provide technical assistance to "
            "developing countries and least-developed countries to implement the provisions of the treaty. This "
            "includes capacity building for patent offices, training of examiners in traditional knowledge prior art, "
            "and support for the development of national disclosure systems. For India, which already has the TKDL, "
            "this article reinforces international cooperation in preventing biopiracy and promoting the use of "
            "traditional knowledge databases."
        )
    },
    
    # ===================== CONVENTION ON BIOLOGICAL DIVERSITY (CBD) =====================
    {
        "id": "cbd_art_8j",
        "statute": "Convention on Biological Diversity (CBD)",
        "section": "Article 8(j)",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 8(j) of the Convention on Biological Diversity requires each contracting party to respect, "
            "preserve, and maintain the knowledge, innovations, and practices of indigenous and local communities "
            "embodying traditional lifestyles relevant for the conservation and sustainable use of biological diversity. "
            "It also encourages the equitable sharing of benefits arising from the utilisation of such knowledge. This "
            "article is foundational for the protection of traditional knowledge in the AYUSH sector, as it obliges "
            "countries to recognise the rights of traditional knowledge holders and to ensure their consent and "
            "benefit-sharing when their knowledge is used."
        )
    },
    {
        "id": "cbd_art_15",
        "statute": "Convention on Biological Diversity (CBD)",
        "section": "Article 15",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 15 of the Convention on Biological Diversity recognises the sovereign rights of states over "
            "their natural resources and establishes that access to genetic resources shall be subject to prior "
            "informed consent of the provider country, unless otherwise determined by that country. It also requires "
            "that access be on mutually agreed terms and that benefits arising from commercial utilisation be shared "
            "fairly. This article is the basis for national ABS laws, including India's Biological Diversity Act, "
            "2002. For AYUSH, it means that any access to Indian medicinal plants or traditional knowledge by "
            "foreign entities must comply with Indian law."
        )
    },
    
    # ===================== INTERNATIONAL TREATY ON PLANT GENETIC RESOURCES FOR FOOD AND AGRICULTURE =====================
    {
        "id": "itpgrfa_art_9",
        "statute": "International Treaty on Plant Genetic Resources for Food and Agriculture",
        "section": "Article 9",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 9 of the International Treaty on Plant Genetic Resources for Food and Agriculture recognises the "
            "enormous contribution of farmers and indigenous communities to the conservation and development of plant "
            "genetic resources. It establishes Farmers' Rights, which include the protection of traditional knowledge, "
            "the right to equitably participate in benefit-sharing, and the right to participate in decision-making. "
            "For AYUSH, this article supports the protection of traditional knowledge related to medicinal plants "
            "cultivated by farmers and ensures that they receive a fair share of benefits from the commercial use of "
            "such resources."
        )
    },
    
    # ===================== CARTAGENA PROTOCOL ON BIOSAFETY =====================
    {
        "id": "cartagena_protocol_art_1",
        "statute": "Cartagena Protocol on Biosafety",
        "section": "Article 1",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 1 of the Cartagena Protocol on Biosafety states that the objective is to ensure an adequate level "
            "of protection in the field of the safe transfer, handling, and use of living modified organisms (LMOs) "
            "resulting from modern biotechnology that may have adverse effects on biological diversity, taking also "
            "into account risks to human health. In the AYUSH context, if genetically modified medicinal plants or "
            "micro-organisms are used to produce herbal drugs, the transboundary movement of such LMOs must comply "
            "with this protocol. This is particularly relevant for research collaborations involving GM herbs."
        )
    },
    
    # ===================== US PATENT CODE (ADDITIONAL) =====================
    {
        "id": "us_patent_code_112",
        "statute": "US Patent Code (35 U.S.C.)",
        "section": "35 U.S.C. 112",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "35 U.S.C. 112 sets forth the enablement and written description requirements for patent applications. "
            "The specification must contain a written description of the invention and the manner and process of "
            "making and using it, in such full, clear, concise, and exact terms as to enable any person skilled in "
            "the art to make and use the invention. For traditional medicine-based inventions, this means that the "
            "patent application must sufficiently describe the extraction process, formulation, and therapeutic use "
            "to allow replication. If the invention is based on traditional knowledge but the application does not "
            "disclose a novel technical step, it may fail this requirement."
        )
    },
    
    # ===================== EUROPEAN PATENT CONVENTION (ADDITIONAL) =====================
    {
        "id": "epc_rule_28_2",
        "statute": "European Patent Convention (EPC)",
        "section": "Rule 28(2)",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Rule 28(2) of the Implementing Regulations to the European Patent Convention states that European patents "
            "shall not be granted in respect of plants or animals exclusively obtained by means of an essentially "
            "biological process. This rule was introduced to align with the EU Biotech Directive and reinforces the "
            "exclusion under Article 53(b). For AYUSH, traditional plant varieties obtained through classical breeding "
            "methods are not patentable in Europe, but a novel biotechnological process involving genetic modification "
            "may be."
        )
    },
    
    # ===================== CHINA PATENT LAW =====================
    {
        "id": "china_patent_law_art_5",
        "statute": "Patent Law of the People's Republic of China",
        "section": "Article 5",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 5 of China's Patent Law states that no patent right shall be granted for any invention-creation "
            "that is contrary to the laws of the State or social morality or that is detrimental to public interest. "
            "In the context of traditional medicine, this provision could be used to reject patents that involve "
            "endangered species or unethical practices. It aligns with India's Section 3(b) and ensures that "
            "traditional medicine patents do not violate public order."
        )
    },
    {
        "id": "china_patent_law_art_25",
        "statute": "Patent Law of the People's Republic of China",
        "section": "Article 25",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 25 of China's Patent Law excludes from patentability scientific discoveries, rules and methods "
            "for mental activities, methods for the diagnosis or treatment of diseases, animal and plant varieties, "
            "and substances obtained by means of nuclear transformation. Notably, it excludes methods of diagnosis "
            "and treatment, similar to India's Section 3(i) and EPC Article 53(c). However, it also excludes plant "
            "varieties, which are protected under a separate plant variety protection system. This is relevant for "
            "AYUSH-based inventions targeting the Chinese market."
        )
    },
    
    # ===================== JAPAN PATENT ACT =====================
    {
        "id": "japan_patent_act_art_32",
        "statute": "Patent Act of Japan",
        "section": "Article 32",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 32 of the Japanese Patent Act excludes from patentability inventions that are liable to injure "
            "public order, morality, or public health. This provision is similar to India's Section 3(b) and can be "
            "used to reject patents on traditional medicine that pose safety risks or are contrary to ethical norms. "
            "For AYUSH companies seeking Japanese patent protection, this article must be considered during the "
            "patent drafting process to ensure the invention does not fall under this exclusion."
        )
    },
    {
        "id": "japan_patent_act_art_29",
        "statute": "Patent Act of Japan",
        "section": "Article 29",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 29 of the Japanese Patent Act sets out the requirements for patentability: novelty and inventive "
            "step. An invention lacks novelty if it was publicly known or worked in Japan or elsewhere before the "
            "filing date, or if it was described in a distributed publication. Traditional knowledge documented in "
            "the TKDL or ancient texts would constitute prior art, defeating novelty. The inventive step requirement "
            "is assessed from the viewpoint of a person skilled in the art, similar to other jurisdictions. This "
            "article is critical when seeking Japanese patents for AYUSH-derived inventions."
        )
    },

    {
        "id": "upov_1991_art_5",
        "statute": "International Convention for the Protection of New Varieties of Plants (UPOV)",
        "section": "Article 5",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 5 of the UPOV Convention (1991 Act) requires that a plant variety be protected if it is new, "
            "distinct, uniform, and stable. Newness means not having been sold or otherwise disposed of to others for "
            "purposes of exploitation, with certain grace periods. Distinctness means clearly distinguishable from any "
            "other variety whose existence is a matter of common knowledge. Uniformity and stability relate to consistent "
            "expression of characteristics. For medicinal plant varieties used in AYUSH, protection under UPOV may be "
            "available in member countries, providing an alternative to patent protection. India is not a member of UPOV "
            "but has its own PPVFR Act."
        )
    },
    {
        "id": "budapest_treaty_art_3",
        "statute": "Budapest Treaty on the International Recognition of the Deposit of Microorganisms for the Purposes of Patent Procedure",
        "section": "Article 3",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 3 of the Budapest Treaty recognises that a deposit of a microorganism with an International "
            "Depositary Authority (IDA) suffices for the purposes of patent procedure in all contracting states. For "
            "AYUSH innovations involving microbial fermentation (e.g., preparation of Arishtas or Asavas using specific "
            "yeast strains), if the microorganism is not publicly available, a deposit may be required. The treaty "
            "simplifies the process by allowing one deposit to be valid for multiple national patent applications, "
            "provided the depositor follows the prescribed procedures."
        )
    },
    {
        "id": "pct_art_27",
        "statute": "Patent Cooperation Treaty (PCT)",
        "section": "Article 27",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 27 of the PCT prohibits national laws from requiring that a patent application comply with formal "
            "requirements different from or additional to those provided in the PCT and its Regulations. This ensures "
            "that an international patent application for an AYUSH invention, once filed, will not be rejected on purely "
            "formal grounds in any designated state. However, substantive requirements such as novelty, inventive step, "
            "and industrial applicability are still governed by national law. This article facilitates the international "
            "filing of AYUSH patents."
        )
    },
    {
        "id": "doha_declaration_para_4",
        "statute": "WTO Doha Declaration on TRIPS and Public Health",
        "section": "Paragraph 4",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Paragraph 4 of the Doha Declaration on the TRIPS Agreement and Public Health affirms that the TRIPS "
            "Agreement does not and should not prevent Members from taking measures to protect public health. It "
            "explicitly recognises the right of Members to use flexibilities such as compulsory licensing and parallel "
            "importation to ensure access to medicines. For AYUSH, this declaration reinforces that patents on "
            "traditional medicines should not hinder public health objectives, and governments may issue compulsory "
            "licences for essential herbal drugs if needed. It provides a policy basis for balancing IP rights with "
            "health needs."
        )
    },
    {
        "id": "asean_abs_framework_art_1",
        "statute": "ASEAN Framework Agreement on Access to Biological and Genetic Resources",
        "section": "Article 1",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 1 of the ASEAN Framework Agreement on Access to Biological and Genetic Resources sets out the "
            "objectives of ensuring the conservation and sustainable use of biological and genetic resources, and the "
            "fair and equitable sharing of benefits arising from their utilisation. It requires prior informed consent "
            "of the provider country and mutually agreed terms. For AYUSH enterprises operating in Southeast Asia, this "
            "framework governs access to medicinal plants and associated traditional knowledge in ASEAN member states. "
            "Compliance is mandatory and non‑compliance can lead to revocation of IP rights and penalties."
        )
    },
    {
        "id": "african_model_legislation_part2",
        "statute": "African Model Legislation for the Protection of the Rights of Local Communities, Farmers and Breeders",
        "section": "Part II",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Part II of the African Model Legislation regulates access to biological resources and associated knowledge. "
            "It requires that any access to biological resources or traditional knowledge in Africa be subject to prior "
            "informed consent of the state and local communities, and that benefit‑sharing agreements be established. "
            "The legislation also recognises community rights over traditional knowledge and provides for penalties for "
            "biopiracy. For AYUSH companies sourcing raw materials from Africa (e.g., specific herbs or resins), "
            "compliance with this model law is essential to avoid legal challenges and ensure ethical sourcing."
        )
    },
        # ===================== PARIS CONVENTION =====================
    {
        "id": "paris_convention_art_4",
        "statute": "Paris Convention for the Protection of Industrial Property",
        "section": "Article 4",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 4 of the Paris Convention establishes the right of priority. An applicant who files a patent "
            "application in one member country has 12 months to file corresponding applications in other member "
            "countries, and those later applications will be treated as if filed on the original filing date. This is "
            "crucial for AYUSH innovators who wish to protect their inventions internationally without losing novelty. "
            "The priority right also applies to trademarks and industrial designs with shorter periods (6 months). "
            "To claim priority, the applicant must file a declaration and provide a certified copy of the first "
            "application within the prescribed time."
        )
    },
    {
        "id": "paris_convention_art_5",
        "statute": "Paris Convention for the Protection of Industrial Property",
        "section": "Article 5",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 5 of the Paris Convention deals with non‑forfeiture and importation. It provides that the "
            "importation of a patented product into a country where it is patented shall not entail forfeiture of the "
            "patent. It also allows compulsory licences to prevent abuses, but only after a certain period (typically "
            "three years) from grant. For AYUSH, this means that if a patent holder imports their product rather than "
            "manufacturing locally, the patent cannot be automatically revoked, but compulsory licensing may be "
            "considered if public interest demands."
        )
    },

    # ===================== MADRID PROTOCOL =====================
    {
        "id": "madrid_protocol_art_2",
        "statute": "Protocol Relating to the Madrid Agreement Concerning the International Registration of Marks",
        "section": "Article 2",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 2 of the Madrid Protocol allows a trademark owner to file a single international application "
            "with the World Intellectual Property Organization (WIPO) and designate multiple member countries. This "
            "simplifies the process of obtaining trademark protection for AYUSH brand names, logos, and product names "
            "across many jurisdictions. The international registration is based on a national or regional application "
            "or registration (the 'basic application' or 'basic registration'). The designated countries have the "
            "right to refuse protection within a specified time (usually 12 or 18 months). Otherwise, the mark is "
            "protected in those countries."
        )
    },
    {
        "id": "madrid_protocol_art_4",
        "statute": "Protocol Relating to the Madrid Agreement Concerning the International Registration of Marks",
        "section": "Article 4",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 4 of the Madrid Protocol provides for the effects of an international registration. In each "
            "designated country, the international registration has the same effect as a national application or "
            "registration, unless protection is refused by that country within the prescribed period. This means that "
            "an AYUSH company can obtain trademark protection in multiple countries with a single filing, saving "
            "time and costs. The international registration is dependent on the basic registration for the first five "
            "years; if the basic registration is cancelled, the international registration may be cancelled to the "
            "same extent."
        )
    },

    # ===================== NAGOYA PROTOCOL – ADDITIONAL ARTICLE =====================
    {
        "id": "nagoya_protocol_art_18",
        "statute": "Nagoya Protocol on ABS",
        "section": "Article 18",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 18 of the Nagoya Protocol requires each Party to encourage the development, update, and use of "
            "sectoral and cross‑sectoral model contractual clauses for mutually agreed terms. These clauses help "
            "parties negotiating ABS agreements to cover key elements such as benefit‑sharing, intellectual property "
            "rights, and dispute resolution. For AYUSH collaborations involving access to biological resources or "
            "traditional knowledge, using model clauses ensures that agreements are fair, transparent, and legally "
            "enforceable. The Secretariat of the CBD maintains a database of such clauses."
        )
    },

    # ===================== TRIPS – ADDITIONAL ARTICLE =====================
    {
        "id": "trips_art_30",
        "statute": "TRIPS Agreement (WTO)",
        "section": "Article 30",
        "jurisdiction": "international",
        "category": "International Treaty",
        "text": (
            "Article 30 of the TRIPS Agreement allows Member States to provide limited exceptions to the exclusive "
            "rights conferred by a patent, provided that such exceptions do not unreasonably conflict with a normal "
            "exploitation of the patent and do not unreasonably prejudice the legitimate interests of the patent "
            "owner. This provision is the basis for exceptions such as regulatory review (Bolar exemption) and "
            "experimental use. For AYUSH, this means that researchers can use patented formulations for non‑commercial "
            "research or for obtaining regulatory approval without infringing the patent, as long as the exception is "
            "narrowly defined."
        )
    },
]

def run_ingestion():
    print("=" * 80)
    print("🚀 INITIALIZING COMPREHENSIVE PRODUCTION LEGAL VECTOR CORPUS INGESTION")
    print("=" * 80)
    
    os.makedirs(DB_DIR, exist_ok=True)
    client = chromadb.PersistentClient(path=DB_DIR)
    
    # Use Chroma's built-in fast dense embedding model
    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    
    # 1. INDIA COLLECTION
    india_collection = client.get_or_create_collection(name="india_statutes", embedding_function=embedding_fn)
    print(f"📦 Indexing {len(INDIAN_LEGAL_DATA)} Indian statutory records into 'india_statutes'...")
    india_collection.upsert(
        ids=[item["id"] for item in INDIAN_LEGAL_DATA],
        documents=[item["text"] for item in INDIAN_LEGAL_DATA],
        metadatas=[{
            "statute": item["statute"],
            "section": item["section"],
            "jurisdiction": item["jurisdiction"],
            "category": item["category"]
        } for item in INDIAN_LEGAL_DATA]
    )
    
    # 2. INTERNATIONAL COLLECTION
    intl_collection = client.get_or_create_collection(name="international_treaties", embedding_function=embedding_fn)
    print(f"📦 Indexing {len(INTERNATIONAL_LEGAL_DATA)} international treaties into 'international_treaties'...")
    intl_collection.upsert(
        ids=[item["id"] for item in INTERNATIONAL_LEGAL_DATA],
        documents=[item["text"] for item in INTERNATIONAL_LEGAL_DATA],
        metadatas=[{
            "statute": item["statute"],
            "section": item["section"],
            "jurisdiction": item["jurisdiction"],
            "category": item["category"]
        } for item in INTERNATIONAL_LEGAL_DATA]
    )
    
    print("=" * 80)
    print("🎯 COMPREHENSIVE LEGAL VECTOR DATABASE IS LIVE AND PERSISTED!")
    print(f"   - Total India records: {len(INDIAN_LEGAL_DATA)}")
    print(f"   - Total International records: {len(INTERNATIONAL_LEGAL_DATA)}")
    print("=" * 80)

if __name__ == "__main__":
    run_ingestion()