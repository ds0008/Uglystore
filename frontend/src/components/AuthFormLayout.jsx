import { Link } from "react-router-dom";

export default function AuthFormLayout({ title, onSubmit, submitLabel, loading, loadingLabel, children, altText, altLinkTo, altLinkLabel }) {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">{title}</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          {children}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? loadingLabel : submitLabel}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          {altText}{" "}
          <Link to={altLinkTo} className="text-black font-medium hover:underline">
            {altLinkLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
