import { useEffect, useMemo, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import {
  listEscalationDirectory,
  type EscalationDirectory,
  type EscalationDirectoryEntry,
  type EscalationRoleScope,
} from "@/lib/admin-fns";
import { useAuthUser } from "@/lib/auth-user";
import { toErrorMessage } from "@/lib/api/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabValue = EscalationRoleScope;

const tabLabels: Record<TabValue, string> = {
  host: "Host",
  homestay_owner: "Homestay",
  vip_owner: "VIP",
};

function EntryDetails({ entry }: { entry: EscalationDirectoryEntry }) {
  return (
    <LuxuryCheckoutPanel className="py-5 sm:py-6">
      <div className="space-y-4">
        <div>
          <h3 className="luxury-panel-heading font-display text-2xl">{entry.ownerName}</h3>
          <p className="luxury-panel-body mt-2 text-sm">
            {entry.ownerEmail ?? "No email"} {entry.ownerPhone ? `· ${entry.ownerPhone}` : ""}
          </p>
          {entry.roleScope === "homestay_owner" ? (
            <div className="mt-3">
              <p className="eyebrow luxury-panel-label mb-2 block">Homestay name</p>
              <p className="luxury-panel-body text-sm">
                {entry.listingNames.length > 0 ? entry.listingNames.join(", ") : "No homestay listed yet."}
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <h4 className="luxury-panel-heading text-lg">Escalation members</h4>
          {entry.members.length === 0 ? (
            <p className="luxury-panel-body text-sm">No escalation details saved yet.</p>
          ) : (
            entry.members.map((member, index) => (
              <div
                key={member.id}
                className="rounded-sm border border-[rgb(74_0_0/0.16)] bg-[rgb(255_255_255/0.38)] p-4"
              >
                <p className="eyebrow luxury-panel-label mb-2 block">Member {index + 1}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="luxury-panel-body text-xs">Name</p>
                    <p className="luxury-panel-body text-sm font-medium">{member.memberName}</p>
                  </div>
                  <div>
                    <p className="luxury-panel-body text-xs">Designation</p>
                    <p className="luxury-panel-body text-sm font-medium">{member.designation}</p>
                  </div>
                  <div>
                    <p className="luxury-panel-body text-xs">Email</p>
                    <p className="luxury-panel-body text-sm font-medium">{member.memberEmail}</p>
                  </div>
                  <div>
                    <p className="luxury-panel-body text-xs">Mobile number</p>
                    <p className="luxury-panel-body text-sm font-medium">{member.memberMobile}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </LuxuryCheckoutPanel>
  );
}

function EntryList({
  entries,
  selectedProfileId,
  onSelect,
}: {
  entries: EscalationDirectoryEntry[];
  selectedProfileId: string | null;
  onSelect: (profileId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const active = entry.profileId === selectedProfileId;
        return (
          <button
            key={entry.profileId}
            type="button"
            onClick={() => onSelect(entry.profileId)}
            className={`w-full rounded-sm border px-4 py-4 text-left transition-colors ${
              active
                ? "border-[#8B1E1E] bg-[rgb(255_255_255/0.52)]"
                : "border-[rgb(74_0_0/0.16)] bg-[rgb(255_255_255/0.32)] hover:bg-[rgb(255_255_255/0.44)]"
            }`}
          >
            <p className="luxury-panel-heading text-lg">{entry.ownerName}</p>
            <p className="luxury-panel-body mt-1 text-xs">{entry.ownerEmail ?? "No email"}</p>
            {entry.roleScope === "homestay_owner" ? (
              <p className="luxury-panel-body mt-2 text-sm">
                {entry.listingNames.length > 0 ? entry.listingNames.join(", ") : "No homestay name yet."}
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function AdminEscalationDirectory() {
  const { accessToken } = useAuthUser();
  const [directory, setDirectory] = useState<EscalationDirectory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("host");
  const [selectedIds, setSelectedIds] = useState<Record<TabValue, string | null>>({
    host: null,
    homestay_owner: null,
    vip_owner: null,
  });

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await listEscalationDirectory({ data: { accessToken } });
        if (!active) return;
        setDirectory(result);
        setSelectedIds({
          host: result.host[0]?.profileId ?? null,
          homestay_owner: result.homestay_owner[0]?.profileId ?? null,
          vip_owner: result.vip_owner[0]?.profileId ?? null,
        });
      } catch (err) {
        if (!active) return;
        setError(toErrorMessage(err, "Failed to load escalation directory."));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [accessToken]);

  const entriesByTab = useMemo(
    () => ({
      host: directory?.host ?? [],
      homestay_owner: directory?.homestay_owner ?? [],
      vip_owner: directory?.vip_owner ?? [],
    }),
    [directory],
  );

  const renderTab = (tab: TabValue) => {
    const entries = entriesByTab[tab];
    const selected = entries.find((entry) => entry.profileId === selectedIds[tab]) ?? entries[0] ?? null;

    return (
      <TabsContent value={tab} className="mt-6">
        {entries.length === 0 ? (
          <LuxuryCheckoutPanel>
            <p className="luxury-panel-body text-sm">No {tabLabels[tab].toLowerCase()} escalation details found.</p>
          </LuxuryCheckoutPanel>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(18rem,24rem)_1fr]">
            <EntryList
              entries={entries}
              selectedProfileId={selected?.profileId ?? null}
              onSelect={(profileId) => setSelectedIds((current) => ({ ...current, [tab]: profileId }))}
            />
            {selected ? <EntryDetails entry={selected} /> : null}
          </div>
        )}
      </TabsContent>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="luxury-panel-heading font-display text-2xl">Escalation</h2>
        <p className="luxury-panel-body mt-2 text-sm">
          Review escalation contacts for host, homestay, and VIP provider accounts.
        </p>
      </div>

      {loading ? <p className="luxury-panel-body text-sm">Loading escalation directory…</p> : null}
      {error ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {!loading && !error && directory ? (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
          <TabsList className="h-auto rounded-sm bg-[rgb(255_255_255/0.4)] p-1">
            <TabsTrigger value="host">Host</TabsTrigger>
            <TabsTrigger value="homestay_owner">Homestay</TabsTrigger>
            <TabsTrigger value="vip_owner">VIP</TabsTrigger>
          </TabsList>
          {renderTab("host")}
          {renderTab("homestay_owner")}
          {renderTab("vip_owner")}
        </Tabs>
      ) : null}
    </div>
  );
}
