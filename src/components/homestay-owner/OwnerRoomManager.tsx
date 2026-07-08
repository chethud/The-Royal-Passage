import { useState } from "react";
import { RupeeAmountInput } from "@/components/host/RupeeAmountInput";
import type { OwnerHomestayDetail } from "@/lib/api/owner-homestays";
import {
  formatWeekdayWeekendRates,
} from "@/lib/homestay-day-pricing";
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
    weekendPricePerNightMinor?: number;
    totalUnits: number;
    extraBedAvailable?: boolean;
    extraBedPricePerNightMinor?: number;
    extraBedWeekendPricePerNightMinor?: number;
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
  const [weekendPriceMajor, setWeekendPriceMajor] = useState(0);
  const [extraBedAvailable, setExtraBedAvailable] = useState(false);
  const [extraBedPriceMajor, setExtraBedPriceMajor] = useState(0);
  const [extraBedWeekendPriceMajor, setExtraBedWeekendPriceMajor] = useState(0);
  const [extraBedsPerRoom, setExtraBedsPerRoom] = useState<1 | 2>(1);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    await onAdd({
      name: name.trim(),
      category: category.trim() || undefined,
      capacity: Number.parseInt(capacity, 10) || 2,
      pricePerNightMinor: priceMajor * 100,
      weekendPricePerNightMinor: weekendPriceMajor * 100,
      totalUnits: Number.parseInt(units, 10) || 1,
      extraBedAvailable,
      extraBedPricePerNightMinor: extraBedAvailable ? extraBedPriceMajor * 100 : 0,
      extraBedWeekendPricePerNightMinor: extraBedAvailable ? extraBedWeekendPriceMajor * 100 : 0,
      extraBedsPerRoom: extraBedAvailable ? extraBedsPerRoom : 1,
    });
    setName("");
    setCategory("");
    setPriceMajor(0);
    setWeekendPriceMajor(0);
    setExtraBedAvailable(false);
    setExtraBedPriceMajor(0);
    setExtraBedWeekendPriceMajor(0);
    setExtraBedsPerRoom(1);
  };

  const sym = homestay.currencySymbol ?? "₹";

  return (
    <div className="space-y-6">
      <ul className="divide-y luxury-panel-divider">
        {homestay.rooms.length === 0 ? (
          <li className="luxury-panel-body py-4 text-sm">No rooms yet. Add at least one before publishing.</li>
        ) : (
          homestay.rooms.map((room) => (
            <li key={room.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="luxury-panel-heading font-medium">{room.name}</p>
                <p className="luxury-panel-body text-xs leading-relaxed">
                  {room.category ?? "Room"} · {room.capacity} guests · {room.totalUnits} unit(s) ·{" "}
                  {formatWeekdayWeekendRates(
                    sym,
                    Math.round(room.pricePerNightMinor / 100),
                    Math.round((room.weekendPricePerNightMinor ?? room.pricePerNightMinor) / 100),
                  )}
                  {room.extraBedAvailable
                    ? ` · extra bed ${formatWeekdayWeekendRates(
                        sym,
                        Math.round(room.extraBedPricePerNightMinor / 100),
                        Math.round(
                          (room.extraBedWeekendPricePerNightMinor ?? room.extraBedPricePerNightMinor) / 100,
                        ),
                      )} · ${normalizeExtraBedsPerRoom(room.extraBedsPerRoom)}/room`
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
        <h3 className="eyebrow luxury-panel-label text-xs uppercase tracking-[0.12em]">Add room</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          <label className="block md:col-span-2">
            <span className="eyebrow luxury-panel-label mb-1 block text-[0.65rem]">Room name</span>
            <input
              className="luxury-input w-full"
              placeholder="e.g. Deluxe Suite, Room 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={1}
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="eyebrow luxury-panel-label mb-1 block text-[0.65rem]">Category</span>
            <input
              className="luxury-input w-full"
              placeholder="e.g. Suite"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="eyebrow luxury-panel-label mb-1 block text-[0.65rem]">Capacity</span>
            <input
              className="luxury-input w-full"
              placeholder="Guests"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="eyebrow luxury-panel-label mb-1 block text-[0.65rem]">Units</span>
            <input
              className="luxury-input w-full"
              placeholder="How many"
              type="number"
              min={1}
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="eyebrow luxury-panel-label mb-1 block text-[0.65rem]">
              Weekday price / night (₹)
            </span>
            <RupeeAmountInput
              className="luxury-input w-full"
              placeholder="e.g. 4500"
              value={priceMajor}
              onChange={setPriceMajor}
              required
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="eyebrow luxury-panel-label mb-1 block text-[0.65rem]">
              Weekend price / night (₹)
            </span>
            <RupeeAmountInput
              className="luxury-input w-full"
              placeholder="e.g. 5500"
              value={weekendPriceMajor}
              onChange={setWeekendPriceMajor}
              required
              disabled={busy}
            />
          </label>
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
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="eyebrow luxury-panel-label mb-1 block text-[0.65rem]">
                Extra bed weekday (₹)
              </span>
              <RupeeAmountInput
                className="luxury-input w-full"
                placeholder="e.g. 800"
                value={extraBedPriceMajor}
                onChange={setExtraBedPriceMajor}
                required
                disabled={busy}
              />
            </label>
            <label className="block">
              <span className="eyebrow luxury-panel-label mb-1 block text-[0.65rem]">
                Extra bed weekend (₹)
              </span>
              <RupeeAmountInput
                className="luxury-input w-full"
                placeholder="e.g. 1000"
                value={extraBedWeekendPriceMajor}
                onChange={setExtraBedWeekendPriceMajor}
                required
                disabled={busy}
              />
            </label>
            <label className="block">
              <span className="eyebrow luxury-panel-label mb-1 block text-[0.65rem]">
                Extra beds per room
              </span>
              <select
                className="luxury-input w-full"
                value={extraBedsPerRoom}
                onChange={(e) => setExtraBedsPerRoom(Number(e.target.value) === 2 ? 2 : 1)}
                disabled={busy}
              >
                <option value={1}>1 extra bed per room</option>
                <option value={2}>2 extra beds per room</option>
              </select>
            </label>
          </div>
        ) : null}

        <button type="submit" className="luxury-btn-sm luxury-btn-primary" disabled={busy}>
          Add room
        </button>
      </form>
    </div>
  );
}
