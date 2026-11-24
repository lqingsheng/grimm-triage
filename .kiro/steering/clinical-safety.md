---
inclusion: fileMatch
fileMatchPattern: "src/triage.js"
---
# Clinical safety rules for the triage engine

1. Never make a patient **less** urgent by adding a worse finding (monotonic safety). Property tests P4–P6 guard this.
2. Unresponsive (AVPU U) or needing an immediate life-saving intervention is always level 1.
3. When in doubt between two levels, choose the more urgent one (under-triage is the dangerous error).
4. Every result must carry human-readable reasons naming the rule that fired.
5. Any new threshold must cite its source in a code comment (ESI Implementation Handbook v4, or a named guideline).
6. Pediatric danger-zone vitals differ from adults; do not reuse adult thresholds for age <= 8.
