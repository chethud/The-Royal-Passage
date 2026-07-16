import { useEffect, useMemo, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import {
  fetchMyEscalationContacts,
  saveMyEscalationContacts,
  type EscalationRoleScope,
} from "@/lib/profile-browser";
import { toErrorMessage } from "@/lib/api/client";

type EscalationMemberDraft = {
  memberName: string;
  memberEmail: string;
  memberMobile: string;
  designation: string;
};

const EMPTY_MEMBER = (): EscalationMemberDraft => ({
  memberName: "",
  memberEmail: "",
  memberMobile: "",
  designation: "",
});

const inputClass =
  "w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";

function roleCopy(roleScope: EscalationRoleScope) {
  if (roleScope === "host") {
    return {
      title: "Escalation details",
      subtitle:
        "Add at least 2 host escalation contacts so the platform can reach the right people quickly.",
    };
  }
  if (roleScope === "homestay_owner") {
    return {
      title: "Escalation details",
      subtitle:
        "Add at least 2 homestay escalation contacts for urgent stay operations and guest support.",
    };
  }
  return {
    title: "Escalation details",
    subtitle:
      "Add at least 2 VIP escalation contacts for concierge operations and urgent member support.",
  };
}

export function EscalationDetailsForm({ roleScope }: { roleScope: EscalationRoleScope }) {
  const copy = useMemo(() => roleCopy(roleScope), [roleScope]);
  const [members, setMembers] = useState<EscalationMemberDraft[]>([EMPTY_MEMBER(), EMPTY_MEMBER()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const contacts = await fetchMyEscalationContacts(roleScope);
        if (!active) return;
        setMembers(
          contacts.length >= 2
            ? contacts.map((contact) => ({
                memberName: contact.memberName,
                memberEmail: contact.memberEmail,
                memberMobile: contact.memberMobile,
                designation: contact.designation,
              }))
            : [EMPTY_MEMBER(), EMPTY_MEMBER()],
        );
      } catch (err) {
        if (!active) return;
        setError(toErrorMessage(err, "Failed to load escalation details."));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [roleScope]);

  const updateMember = (index: number, patch: Partial<EscalationMemberDraft>) => {
    setMembers((current) => current.map((member, i) => (i === index ? { ...member, ...patch } : member)));
  };

  const addMember = () => {
    setMembers((current) => [...current, EMPTY_MEMBER()]);
  };

  const removeMember = (index: number) => {
    setMembers((current) => (current.length <= 2 ? current : current.filter((_, i) => i !== index)));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const trimmed = members.map((member) => ({
        memberName: member.memberName.trim(),
        memberEmail: member.memberEmail.trim().toLowerCase(),
        memberMobile: member.memberMobile.trim(),
        designation: member.designation.trim(),
      }));

      if (trimmed.length < 2) {
        throw new Error("Add at least 2 escalation members.");
      }
      for (const [index, member] of trimmed.entries()) {
        if (!member.memberName || !member.memberEmail || !member.memberMobile || !member.designation) {
          throw new Error(`Complete all fields for member ${index + 1}.`);
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.memberEmail)) {
          throw new Error(`Enter a valid email for member ${index + 1}.`);
        }
        if (member.memberMobile.replace(/\D/g, "").length < 10) {
          throw new Error(`Enter a valid mobile number for member ${index + 1}.`);
        }
      }

      const savedContacts = await saveMyEscalationContacts(roleScope, trimmed);
      setMembers(
        savedContacts.map((contact) => ({
          memberName: contact.memberName,
          memberEmail: contact.memberEmail,
          memberMobile: contact.memberMobile,
          designation: contact.designation,
        })),
      );
      setSaved(true);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to save escalation details."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <LuxuryCheckoutPanel>
      <div className="space-y-4">
        <div>
          <h2 className="luxury-panel-heading font-display text-2xl">{copy.title}</h2>
          <p className="luxury-panel-body mt-2 text-sm">{copy.subtitle}</p>
        </div>

        {loading ? <p className="luxury-panel-body text-sm">Loading escalation members…</p> : null}

        {!loading ? (
          <div className="space-y-4">
            {members.map((member, index) => (
              <div
                key={`member-${index}`}
                className="rounded-sm border border-[rgb(74_0_0/0.16)] bg-[rgb(255_255_255/0.38)] p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="luxury-panel-heading text-lg">Member {index + 1}</h3>
                    <p className="luxury-panel-body text-xs">Escalation contact details</p>
                  </div>
                  <button
                    type="button"
                    className="luxury-btn-sm luxury-btn-panel-outline"
                    disabled={members.length <= 2}
                    onClick={() => removeMember(index)}
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="eyebrow luxury-panel-label mb-2 block">Name</label>
                    <input
                      value={member.memberName}
                      onChange={(e) => updateMember(index, { memberName: e.target.value })}
                      className={inputClass}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="eyebrow luxury-panel-label mb-2 block">Email</label>
                    <input
                      type="email"
                      value={member.memberEmail}
                      onChange={(e) => updateMember(index, { memberEmail: e.target.value })}
                      className={inputClass}
                      placeholder="name@example.com"
                    />
                  </div>
                  <div>
                    <label className="eyebrow luxury-panel-label mb-2 block">Mobile number</label>
                    <input
                      type="tel"
                      value={member.memberMobile}
                      onChange={(e) => updateMember(index, { memberMobile: e.target.value })}
                      className={inputClass}
                      placeholder="+91 98XXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="eyebrow luxury-panel-label mb-2 block">Designation</label>
                    <input
                      value={member.designation}
                      onChange={(e) => updateMember(index, { designation: e.target.value })}
                      className={inputClass}
                      placeholder="Operations manager"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-3">
              <button type="button" className="luxury-btn-sm luxury-btn-panel-outline" onClick={addMember}>
                Add member
              </button>
              <button
                type="button"
                className="luxury-btn-sm luxury-btn-primary disabled:cursor-not-allowed disabled:opacity-70"
                disabled={saving}
                onClick={() => void handleSave()}
              >
                {saving ? "Saving…" : "Save escalation details"}
              </button>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.45)] px-4 py-3 text-sm luxury-panel-body">
            Escalation details updated.
          </p>
        ) : null}
      </div>
    </LuxuryCheckoutPanel>
  );
}
