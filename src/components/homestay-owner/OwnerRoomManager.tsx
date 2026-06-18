import { useState } from "react";
import { RupeeAmountInput } from "@/components/host/RupeeAmountInput";
import type { OwnerHomestayDetail } from "@/lib/api/owner-homestays";
import { formatMoney } from "@/lib/money";
import { normalizeExtraBedsPerRoom } from "@/lib/homestay-room-pricing";

type OwnerRoomManagerProps = {
  homestay: OwnerHomestayDetail;
  busy?: boolean;
  onAdd: (payload: {
    name: string;
    category?: string;
    capacity: number;
    pricePerNightMinor: number;
    totalUnits: number;
    extraBedAvailable?: boolean;
    extraBedPricePerNightMinor?: number;
    extraBedsPerRoom?: number;
  }) => Promise<void>;
  onDeactivate: (roomId: string) => Promise<void>;
};

export function OwnerRoomManager({ homestay, busy = false, onAdd, onDeactivate }: OwnerRoomManagerProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [units, setUnits] = useState("1");
  const [priceMajor, setPriceMajor] = useState(0);
  const [extraBedAvailable, setExtraBedAvailable] = useState(false);
  const [extraBedPriceMajor, setExtraBedPriceMajor] = useState(0);
  const [extraBedsPerRoom, setExtraBedsPerRoom] = useState<1 | 2>(1);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    await onAdd({
      name: name.trim(),
      category: category.trim() || undefined,
      capacity: Number.parseInt(capacity, 10) || 2,
      pricePerNightMinor: priceMajor * 100,
      totalUnits: Number.parseInt(units, 10) || 1,
      extraBedAvailable,
      extraBedPricePerNightMinor: extraBedAvailable ? extraBedPriceMajor * 100 : 0,
      extraBedsPerRoom: extraBedAvailable ? extraBedsPerRoom : 1,
    });
    setName("");
    setCategory("");
    setPriceMajor(0);
    setExtraBedAvailable(false);
    setExtraBedPriceMajor(0);
    setExtraBedsPerRoom(1);
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
                  {room.extraBedAvailable
                    ? ` · extra bed ${formatMoney(room.extraBedPricePerNightMinor, homestay.currencySymbol)}/night · ${normalizeExtraBedsPerRoom(room.extraBedsPerRoom)}/room`
                    : ""}
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

      <form onSubmit={(e) => void handleAdd(e)} className="space-y-4 border-t luxury-panel-divider pt-6">
        <div className="grid gap-3 md:grid-cols-5">
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
          <RupeeAmountInput
            className="luxury-input md:col-span-2"
            placeholder="Price / night"
            value={priceMajor}
            onChange={setPriceMajor}
            required
            disabled={busy}
          />
        </div>

        <label className="flex items-center gap-2 text-sm luxury-panel-body">
          <input
            type="checkbox"
            checked={extraBedAvailable}
            onChange={(e) => setExtraBedAvailable(e.target.checked)}
            disabled={busy}
            className="rounded border-[rgb(74_0_0/0.3)]"
          />
          Extra bed available (priced per night)
        </label>

        {extraBedAvailable ? (
          <div className="grid gap-3 md:grid-cols-2">
            <RupeeAmountInput
              className="luxury-input"
              placeholder="Extra bed price / night"
              value={extraBedPriceMajor}
              onChange={setExtraBedPriceMajor}
              required
              disabled={busy}
            />
            <select
              className="luxury-input"
              value={extraBedsPerRoom}
              onChange={(e) => setExtraBedsPerRoom(Number(e.target.value) === 2 ? 2 : 1)}
              disabled={busy}
            >
              <option value={1}>1 extra bed per room</option>
              <option value={2}>2 extra beds per room</option>
            </select>
          </div>
        ) : null}

        <button type="submit" className="luxury-btn-sm luxury-btn-primary" disabled={busy}>
          Add room
        </button>
      </form>
    </div>
  );
}
