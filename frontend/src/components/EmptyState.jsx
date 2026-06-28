import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, linkTo, linkLabel }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      {Icon && <Icon size={64} className="mx-auto text-gray-300" />}
      <h2 className="text-2xl font-bold text-gray-900 mt-4">{title}</h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="inline-block mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {linkLabel || "Continue"}
        </Link>
      )}
    </div>
  );
}
