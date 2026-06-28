import { useState, useMemo } from "react";
import bdAddresses from "../data/bdAddresses";

function SearchableSelect({ label, value, onChange, options, placeholder, disabled }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(lower));
  }, [options, search]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={open ? search : value}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => { setOpen(true); setSearch(""); }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={disabled ? "Select above first" : placeholder}
          disabled={disabled}
          className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {!disabled && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
            {open ? "Type to search" : value ? "" : "Select"}
          </span>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt);
                setOpen(false);
                setSearch("");
              }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                opt === value ? "bg-gray-50 font-medium" : ""
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm text-gray-500">
          No results found
        </div>
      )}
    </div>
  );
}

export default function AddressForm({ address, onChange }) {
  const divisions = useMemo(() => bdAddresses.map((d) => d.division), []);

  const districts = useMemo(() => {
    if (!address.division) return [];
    const div = bdAddresses.find((d) => d.division === address.division);
    return div ? div.districts.map((d) => d.name) : [];
  }, [address.division]);

  const upazilas = useMemo(() => {
    if (!address.division || !address.district) return [];
    const div = bdAddresses.find((d) => d.division === address.division);
    const dist = div?.districts.find((d) => d.name === address.district);
    return dist ? dist.upazilas.map((u) => u.name) : [];
  }, [address.division, address.district]);

  const thanas = useMemo(() => {
    if (!address.division || !address.district || !address.upazila) return [];
    const div = bdAddresses.find((d) => d.division === address.division);
    const dist = div?.districts.find((d) => d.name === address.district);
    const upa = dist?.upazilas.find((u) => u.name === address.upazila);
    return upa ? upa.thanas : [];
  }, [address.division, address.district, address.upazila]);

  const update = (field, value) => {
    const updated = { ...address, [field]: value };
    if (field === "division") {
      updated.district = "";
      updated.upazila = "";
      updated.thana = "";
    } else if (field === "district") {
      updated.upazila = "";
      updated.thana = "";
    } else if (field === "upazila") {
      updated.thana = "";
    }
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={address.fullName || ""}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="Your full name"
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            required
            value={address.phone || ""}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="01XXXXXXXXX"
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SearchableSelect
          label="Division"
          value={address.division || ""}
          onChange={(v) => update("division", v)}
          options={divisions}
          placeholder="Select division"
        />
        <SearchableSelect
          label="District"
          value={address.district || ""}
          onChange={(v) => update("district", v)}
          options={districts}
          placeholder="Select district"
          disabled={!address.division}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SearchableSelect
          label="Upazila"
          value={address.upazila || ""}
          onChange={(v) => update("upazila", v)}
          options={upazilas}
          placeholder="Select upazila"
          disabled={!address.district}
        />
        <SearchableSelect
          label="Thana / Area"
          value={address.thana || ""}
          onChange={(v) => update("thana", v)}
          options={thanas}
          placeholder="Select thana/area"
          disabled={!address.upazila}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Address</label>
        <textarea
          required
          value={address.addressLine || ""}
          onChange={(e) => update("addressLine", e.target.value)}
          placeholder="House no., Road no., Floor, Landmark..."
          rows={2}
          className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
        />
      </div>
    </div>
  );
}
