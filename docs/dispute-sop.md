# Dispute and takedown SOP (internal)

## When a dispute arrives
1. Public form writes to `disputes` with status `open` and flips the incident
   status to `disputed`.
2. Reporting salon is notified by email (Resend).
3. 14-day clock starts. Cron `auto_withdraw_unanswered_disputes` enforces it.

## Salon response paths
- **Uphold dispute**: incident is withdrawn. Consumer hash retained, incident
  marked `withdrawn` (kept for audit, not returned in search).
- **Reject dispute**: incident reinstated to `active`. Resolution notes must be
  recorded.

## Platform escalation
If the disputant escalates (legal threat, OAIC complaint), platform staff:
1. Pull all artefacts: incident, evidence files, consent-clause publication proof
   from the reporting salon, audit log of searches that returned the entry.
2. Confirm the entry meets all of: structured type, factual description, evidence,
   notification to consumer, salon consent-clause warranty.
3. If any of the above fails: withdraw the entry unilaterally and notify both
   parties.
4. If all check out and threat persists: escalate to legal counsel.

## Takedown criteria (unilateral)
The platform will withdraw any entry that:
- Contains personal opinion or characterisation
- Is missing evidence
- Concerns someone who is not a client of the reporting salon
- Was logged without the consent clause being present in the salon's T&Cs at
  the time of the underlying booking

## Records
Every action above is logged. All disputes and resolutions are retained for
7 years.
