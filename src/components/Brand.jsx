import { PawPrint } from "lucide-react";
import { Link } from "react-router-dom";
export default function Brand({ collapsed = false, to = "/home" }) {
  return (
    <Link to={to} className="brand" aria-label="MeuPetShop">
      <span className="brand-mark">
        <PawPrint size={20} />
      </span>
      {!collapsed && <span>MeuPetShop</span>}
    </Link>
  );
}
