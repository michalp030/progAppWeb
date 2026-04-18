import type { User } from "../models/User";

class UserService {
  private users: User[] = [
    { id: "1", firstName: "Admin", lastName: "User", role: "admin" },
    { id: "2", firstName: "Dev", lastName: "One", role: "developer" },
    { id: "3", firstName: "Ops", lastName: "One", role: "devops" },
  ];

  getCurrentUser(): User {
    return this.users[0];
  }

  getAssignableUsers(): User[] {
    return this.users.filter(
      (u) => u.role === "developer" || u.role === "devops"
    );
  }
}

export const userService = new UserService();