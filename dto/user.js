module.exports = class UserDTO {
    id;

    email;

    is_active;

    name;

    role;

    constructor(model) {
        const { id, email, is_active, name, role } = model;

        this.id = id;
        this.email = email;
        this.is_active = is_active;
        this.name = name;
        this.role = role;
    }
};
