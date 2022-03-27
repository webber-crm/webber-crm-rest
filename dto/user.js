module.exports = class UserDTO {
    id;

    email;

    is_active;

    name;

    constructor(model) {
        const { id, email, is_active, name } = model;

        this.id = id;
        this.email = email;
        this.is_active = is_active;
        this.name = name;
    }
};
