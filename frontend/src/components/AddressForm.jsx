import { useState, useMemo } from "react";
import { getDivisions, getDistricts, getUpazilas } from "../data/bdAddresses";

function SearchableSelect({ label, value, onChange, options, placeholder, disabled }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full text-left border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {value || <span className="text-gray-400">{placeholder}</span>}
      </button>
      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 p-3 text-center">No results</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); setSearch(""); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition ${opt === value ? "bg-gray-100 font-medium" : ""}`}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddressForm({ address, onChange }) {
  const divisions = useMemo(() => getDivisions(), []);
  const districts = useMemo(() => getDistricts(address.division), [address.division]);
  const upazilas = useMemo(() => getUpazilas(address.division, address.district), [address.division, address.district]);

  const update = (field, value) => {
    const next = { ...address, [field]: value };
    if (field === "division") { next.district = ""; next.upazila = ""; }
    if (field === "district") { next.upazila = ""; }
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={address.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            required
            value={address.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="01XXX-XXXXXX"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SearchableSelect
          label="Division"
          value={address.division}
          onChange={(v) => update("division", v)}
          options={divisions}
          placeholder="Select division"
        />
        <SearchableSelect
          label="District"
          value={address.district}
          onChange={(v) => update("district", v)}
          options={districts}
          placeholder="Select district"
          disabled={!address.division}
        />
        <SearchableSelect
          label="Upazila / Thana"
          value={address.upazila}
          onChange={(v) => update("upazila", v)}
          options={upazilas}
          placeholder="Select upazila"
          disabled={!address.district}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Address</label>
        <textarea
          required
          value={address.detail}
          onChange={(e) => update("detail", e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
          rows={3}
          placeholder="House no., Road, Area (e.g., House 12, Road 5, Block C, Mirpur-10)"
        />
      </div>
    </div>
  );
}
