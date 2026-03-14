import type { User } from "../models/User";

class UserService {
  private currentUser: User = {
    id: "1",
    firstName: "Jan",
    lastName: "Kowalski",
  };

  getCurrentUser(): User {
    return this.currentUser;
  }

  getFullName(): string {
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }
}

export const userService = new UserService();