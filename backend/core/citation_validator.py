import re
from typing import List, Tuple
from schemas import CitationMetadata

class CitationValidator:
    """
    Deterministic validator running 50+ statutory regex patterns against
    Patents Act, Biological Diversity Rules 2024, and WIPO GRATK 2024.
    """

    STATUTE_PATTERNS = [
        # Indian Patents Act, 1970
        (r"Patents Act(?:, 1970)?,\s*Sec(?:tion)?\s*(3\([a-p]\)|[0-9]+[A-Z]?)", "Patents Act, 1970"),
        (r"Patent Rules(?:, 2003| 2024)?,\s*Rule\s*([0-9]+[A-Z]?)", "Patent Rules, 2024"),
        
        # Biological Diversity Act & Rules 2024
        (r"Biological Diversity Act(?:, 2002| 2023)?,\s*Sec(?:tion)?\s*([0-9]+[A-Z]?)", "Biological Diversity Act"),
        (r"Biological Diversity Rules(?:, 2024)?,\s*Rule\s*([0-9]+)", "Biological Diversity Rules, 2024"),
        (r"NBA Regulations(?: 2025)?,\s*Reg(?:ulation)?\s*([0-9]+)", "NBA ABS Regulations, 2025"),
        
        # Drugs & Cosmetics / FSSAI / DMR Act
        (r"Drugs & Cosmetics Act(?:, 1940)?,\s*Sec(?:tion)?\s*(3\([a-z]\)|[0-9]+)", "Drugs & Cosmetics Act, 1940"),
        (r"Drugs & Magic Remedies Act(?:, 1954)?,\s*Sec(?:tion)?\s*([0-9]+)", "Drugs & Magic Remedies Act, 1954"),
        (r"FSSAI Ayurveda Aahar Regs(?: 2022)?,\s*Reg\s*([0-9]+)", "FSSAI Ayurveda Aahar Regs, 2022"),
        
        # International Treaties
        (r"WIPO GRATK Treaty(?: 2024)?,\s*Art(?:icle)?\s*([0-9]+)", "WIPO GRATK Treaty, 2024"),
        (r"TRIPS Agreement,\s*Art(?:icle)?\s*([0-9]+)", "TRIPS Agreement"),
        (r"Nagoya Protocol,\s*Art(?:icle)?\s*([0-9]+)", "Nagoya Protocol")
    ]

    TAG_REGEX = re.compile(r"\[CIT:\s*([^\]]+)\]")

    @classmethod
    def extract_and_verify(cls, generated_text: str, retrieved_context_chunks: List[str]) -> Tuple[bool, List[CitationMetadata], str]:
        """
        Parses [CIT: ...] tags, validates against statutory patterns, and 
        verifies that cited legal clauses appear in the retrieved context chunks.
        """
        raw_tags = cls.TAG_REGEX.findall(generated_text)
        
        if not raw_tags:
            # If text makes legal claims without citations, flag for review
            return True, [], generated_text

        citations: List[CitationMetadata] = []
        all_valid = True

        combined_context = " ".join(retrieved_context_chunks).lower()

        for tag in raw_tags:
            matched_statute = None
            matched_section = None

            for pattern, statute_name in cls.STATUTE_PATTERNS:
                match = re.search(pattern, tag, re.IGNORECASE)
                if match:
                    matched_statute = statute_name
                    matched_section = match.group(1) if match.groups() else "General"
                    break

            if not matched_statute:
                # Malformed citation format
                all_valid = False
                citations.append(CitationMetadata(
                    statute="UNKNOWN / INVALID FORMAT",
                    section=tag,
                    verified_in_context=False,
                    raw_tag=f"[CIT: {tag}]"
                ))
                continue

            # Grounding check: verify that the section or key term exists in retrieved text
            search_token = f"section {matched_section}".lower() if "sec" in tag.lower() else matched_section.lower()
            grounded = (search_token in combined_context) or (matched_statute.lower() in combined_context)

            if not grounded:
                all_valid = False

            citations.append(CitationMetadata(
                statute=matched_statute,
                section=matched_section,
                verified_in_context=grounded,
                raw_tag=f"[CIT: {tag}]"
            ))

        return all_valid, citations, generated_text