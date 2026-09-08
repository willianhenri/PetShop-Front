import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
export default function PasswordField({ id, label, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="input-icon">
        <LockKeyhole size={17} />
        <input id={id} type={visible ? "text" : "password"} {...props} />
        <button
          type="button"
          className="icon-button"
          onClick={() => setVisible(!visible)}
          aria-label={(visible ? "Ocultar " : "Mostrar ") + label.toLowerCase()}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}
