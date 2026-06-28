export default function FormInput({ label, type = "text", value, onChange, placeholder, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        placeholder={placeholder}
      />
    </div>
  );
}
