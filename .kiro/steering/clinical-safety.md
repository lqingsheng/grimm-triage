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
7. A vital sign that was not measured (`null`) is handled cautiously. Decision points A and B use only the measured values, so a missing value never triggers level 1 on its own. At decision point D a missing HR, RR or SpO2 counts as possibly in the danger zone (provisional ESI 2) until it is measured. So a missing value is always at least as urgent as any measured value that would not itself trigger level 1. Only explicit `null` means "not measured"; `undefined` or `NaN` is still an input error. Property test P9 guards this.
