import { useState } from "react";
import type { OwnerHomestayDetail } from "@/lib/api/owner-homestays";
import { formatMoney, parseRupeeMajorInput } from "@/lib/money";

type OwnerRoomManagerProps = {
  homestay: OwnerHomestayDetail;
  busy?: boolean;
  onAdd: (payload: {
    name: string;
    category?: string;
    capacity: number;
    pricePerNightMinor: number;
    totalUnits: number;
  }) => Promise<void>;
  onDeactivate: (roomId: string) => Promise<void>;
};

export function OwnerRoomManager({ homestay, busy = false, onAdd, onDeactivate }: OwnerRoomManagerProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [units, setUnits] = useState("1");
  const [priceMajor, setPriceMajor] = useState("");

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    await onAdd({
      name: name.trim(),
      category: category.trim() || undefined,
      capacity: Number.parseInt(capacity, 10) || 2,
      pricePerNightMinor: parseRupeeMajorInput(priceMajor) * 100,
      totalUnits: Number.parseInt(units, 10) || 1,
    });
    setName("");
    setCategory("");
    setPriceMajor("");
  };

  return (
    <div className="space-y-6">
      <ul className="divide-y luxury-panel-divider">
        {homestay.rooms.length === 0 ? (
          <li className="luxury-panel-body py-4 text-sm">No rooms yet. Add at least one before publishing.</li>
        ) : (
          homestay.rooms.map((room) => (
            <li key={room.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="luxury-panel-heading font-medium">{room.name}</p>
                <p className="luxury-panel-body text-xs">
                  {room.category ?? "Room"} · {room.capacity} guests · {room.totalUnits} unit(s) ·{" "}
                  {formatMoney(room.pricePerNightMinor, homestay.currencySymbol)}
                  {!room.isActive ? " · inactive" : ""}
                </p>
              </div>
              {room.isActive ? (
                <button
                  type="button"
                  className="luxury-btn-sm luxury-btn-panel-outline"
                  disabled={busy}
                  onClick={() => void onDeactivate(room.id)}
                >
                  Deactivate
                </button>
              ) : null}
            </li>
          ))
        )}
      </ul>

      <form onSubmit={(e) => void handleAdd(e)} className="grid gap-3 border-t luxury-panel-divider pt-6 md:grid-cols-5">
        <input
          className="luxury-input md:col-span-2"
          placeholder="Room name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={busy}
        />
        <input
          className="luxury-input"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={busy}
        />
        <input
          className="luxury-input"
          placeholder="Capacity"
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          disabled={busy}
        />
        <input
          className="luxury-input"
          placeholder="Units"
          type="number"
          min={1}
          value={units}
          onChange={(e) => setUnits(e.target.value)}
          disabled={busy}
        />
        <input
          className="luxury-input md:col-span-2"
          placeholder="Price / night (₹)"
          value={priceMajor}
          onChange={(e) => setPriceMajor(e.target.value)}
          required
          disabled={busy}
        />
        <button type="submit" className="luxury-btn-sm luxury-btn-primary md:col-span-1" disabled={busy}>
          Add room
        </button>
      </form>
    </div>
  );
}
