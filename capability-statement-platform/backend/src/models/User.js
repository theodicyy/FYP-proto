// User Model
// Represents a user in the system with role-based permissions

export const UserRoles = {
  ADMIN: 'admin',        // Type 1: Full CRUD access
  ASSOCIATE: 'associate' // Type 2: Limited access
};

export class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.roleType = data.role_type;
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
  }

  isAdmin() {
    return this.roleType === UserRoles.ADMIN;
  }

  isAssociate() {
    return this.roleType === UserRoles.ASSOCIATE;
  }

  canManageTemplates() {
    return this.isAdmin();
  }

  canManageAwards() {
    return this.isAdmin();
  }

  canManageDeals() {
    return this.isAdmin();
  }

  canManageLawyers() {
    return this.isAdmin();
  }

  canManageCapStatements() {
    return true; // Both can manage, but with different permissions
  }

  canEditCapStatement(statement) {
    if (this.isAdmin()) {
      return true; // Admin can edit any
    }
    // Associate can only edit their own
    return statement.created_by_user_id === this.id;
  }
}
