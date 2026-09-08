import ManagementPage from "../components/ManagementPage";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiFetch, getApiErrorMessage } from "../services/apiFetch";

export default function Products() {
  const [searchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(searchParams.get("new") === "1");
  const [localQuery, setLocalQuery] = useState(null);
  const query = localQuery ?? searchParams.get("q") ?? "";
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await apiFetch("/api/Products");

      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("A API retornou um erro:", response.status);
        setProducts([]);
      }
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setProducts([]);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchProducts);
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setStockQuantity("");
    setEditingId(null);
  };

  const handleEditClick = (product) => {
    setFormOpen(true);
    setEditingId(product.id);
    setName(product.name || "");
    setDescription(product.description || "");
    setPrice(product.price ?? "");
    setStockQuantity(product.stockQuantity ?? "");
    setError("");
    setSuccess("");
  };

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este produto? Essa ação não pode ser desfeita.",
    );
    if (!confirmDelete) return;

    try {
      const response = await apiFetch(`/api/Products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Erro ao excluir o produto."),
        );
      }

      setSuccess("Produto excluído com sucesso!");
      setError("");
      fetchProducts();
    } catch (err) {
      setError(err.message);
      setSuccess("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const isEditing = editingId !== null;

    try {
      const path = isEditing ? `/api/Products/${editingId}` : "/api/Products";

      const response = await apiFetch(path, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          stockQuantity: parseInt(stockQuantity, 10),
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            `Erro ao ${isEditing ? "atualizar" : "cadastrar"} produto.`,
          ),
        );
      }

      setSuccess(
        `Produto ${isEditing ? "atualizado" : "cadastrado"} com sucesso!`,
      );
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((item) =>
    JSON.stringify(item)
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );

  return (
    <ManagementPage
      kind="products"
      formOpen={formOpen}
      setFormOpen={setFormOpen}
      query={query}
      setQuery={setLocalQuery}
      count={filtered.length}
    >
      {error && (
        <p className="feedback error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="feedback success" role="status">
          {success}
        </p>
      )}

      <div className="panel form-panel entity-form">
        <h3>{editingId ? "Editar Produto" : "Novo Produto"}</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label htmlFor="products-field-1">Nome:</label>
            <input
              id="products-field-1"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="products-field-2">Preço (R$):</label>
            <input
              id="products-field-2"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="products-field-3">Estoque:</label>
            <input
              id="products-field-3"
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
            />
          </div>
          <div className="form-full">
            <label htmlFor="products-field-4">Descrição:</label>
            <textarea
              id="products-field-4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-full">
            <button type="submit" disabled={loading} className="primary-button">
              {loading
                ? "Salvando..."
                : editingId
                  ? " Salvar Alterações"
                  : " Adicionar Produto"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="secondary-button"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5">Nenhum produto cadastrado ainda.</td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name || "Sem nome"}</td>
                    <td>{product.description || "Não informado"}</td>
                    <td>
                      {typeof product.price === "number"
                        ? product.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "Não informado"}
                    </td>
                    <td>{product.stockQuantity ?? "Não informado"}</td>
                    <td>
                      <button
                        onClick={() => handleEditClick(product)}
                        className="secondary-button"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="danger-button"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ManagementPage>
  );
}
