import { useEffect, useState } from "react";
import type { Project } from "./models/Project";
import { projectService } from "./services/projectService";
import{ generateId } from "./utils/generateID";

type FormData = {
  name: string;
  description: string;
};

const emptyForm: FormData = {
  name: "",
  description: "",
};

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  function loadProjects() {
    const data = projectService.getAll();
    setProjects(data);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      alert("Uzupełnij nazwę i opis projektu.");
      return;
    }

    if (editingId) {
      projectService.update({
        id: editingId,
        name: formData.name,
        description: formData.description,
      });
    } else {
      projectService.create({
        id: generateId(),
        name: formData.name,
        description: formData.description,
      });
    }

    setFormData(emptyForm);
    setEditingId(null);
    loadProjects();
  }

  function handleEdit(project: Project) {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description,
    });
  }

  function handleDelete(id: string) {
    const shouldDelete = window.confirm("Czy na pewno chcesz usunąć projekt?");

    if (!shouldDelete) {
      return;
    }

    projectService.delete(id);

    if (editingId === id) {
      setEditingId(null);
      setFormData(emptyForm);
    }

    loadProjects();
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormData(emptyForm);
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      <h1>ManageMe</h1>
      <p>Prosty CRUD projektów zapisanych w localStorage</p>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <h2>{editingId ? "Edytuj projekt" : "Dodaj projekt"}</h2>

        <div style={{ marginBottom: "12px" }}>
          <label>Nazwa projektu</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Opis projektu</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button type="submit">
            {editingId ? "Zapisz zmiany" : "Dodaj projekt"}
          </button>

          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Anuluj
            </button>
          )}
        </div>
      </form>

      <section>
        <h2>Lista projektów</h2>

        {projects.length === 0 ? (
          <p>Brak projektów.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  background: "#fff",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                <h3>{project.name}</h3>
                <p>{project.description}</p>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleEdit(project)}>Edytuj</button>
                  <button onClick={() => handleDelete(project.id)}>Usuń</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;