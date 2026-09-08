export function getProfile() {
  const name = sessionStorage.getItem("petshop_name") || "Minha conta";
  const role =
    {
      Admin: "Administrador",
      SuperAdmin: "Super Administrador",
      Funcionario: "Funcionário",
    }[sessionStorage.getItem("petshop_role")] || "Funcionário";
  return {
    name,
    role,
    initials: name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
  };
}
