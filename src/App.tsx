import { useEffect, useState } from "react";
import type { Project } from "./models/Project";
import{ generateId } from "./utils/generateId";
import { projectService } from "./services/projectService";
import { userService } from "./services/userServices";
import { storyService } from "./services/storyService";
import { taskService } from "./services/taskService";
import type { Story } from "./models/Story";

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
  const user = userService.getCurrentUser();
  const [activeProject, setActiveProject] = useState<Project | null>(projectService.getActiveProject());
  const [stories, setStories] = useState<Story[]>([]);


  const todo = stories.filter((s) => s.status === "todo");
  const doing = stories.filter((s) => s.status === "doing");
  const done = stories.filter((s) => s.status === "done");
  

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

  function loadStories(projectId: string) {
    const data = storyService.getByProject(projectId);
    setStories(data);
  }

  useEffect(() => {
    if (activeProject) {
      loadStories(activeProject.id);
    }
  }, [activeProject]);

  function createStory(name: string, description: string) {
  if (!activeProject) return;

  storyService.create({
    id: generateId(),
    name,
    description,
    priority: "medium",
    projectId: activeProject.id,
    createdAt: new Date().toISOString(),
    status: "todo",
    ownerId: user.id,
  });

  loadStories(activeProject.id);
}

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      <h1>ProjectMenager</h1>
      <h2>Zalogowany użytkownik: {user.firstName} {user.lastName}</h2>

      <h2>Aktywny projekt: {activeProject ? activeProject.name : "brak wybranego"}</h2>
      <form onSubmit={(e) => {e.preventDefault();
          const form = e.target as HTMLFormElement;
          const name = (form.elements.namedItem("storyName") as HTMLInputElement).value;
          const description = (form.elements.namedItem("storyDescription") as HTMLInputElement).value;

          createStory(name, description);
          form.reset();
        }}
      >
        <h3>Dodaj historyjkę</h3>

        <input name="storyName" placeholder="Nazwa historyjki" />

        <input name="storyDescription" placeholder="Opis" />

        <button type="submit">Dodaj</button>
      </form>

      <h3>TODO</h3> 
        {todo.map((s) => (
          <div key={s.id}>
            <b>{s.name}</b> {s.description}

            <button
              onClick={() =>
                taskService.create({
                  id: generateId(),
                  name: "Nowe zadanie",
                  description: "opis",
                  priority: "medium",
                  storyId: s.id,
                  estimatedTime: 5,
                  status: "todo",
                  createdAt: new Date().toISOString(),
                })
              }
            >
              Dodaj task
            </button>
          </div>
        ))}

        <h3>DOING</h3> 
        {doing.map((s) => (
          <div key={s.id}>
            <b>{s.name}</b> {s.description}
          </div>
        ))}

        <h3>DONE</h3> 
        {done.map((s) => (
          <div key={s.id}>
            <b>{s.name}</b> {s.description}
          </div>
              ))}


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
                  <button onClick={() => {projectService.setActiveProject(project.id);setActiveProject(project);}}>Wybierz projekt</button>
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