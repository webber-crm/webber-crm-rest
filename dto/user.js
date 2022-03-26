module.exports = class UserDTO {
    id;

    email;

    is_active;

    constructor(model) {
        const { id, email, is_active } = model;

        this.id = id;
        this.email = email;
        this.is_active = is_active;
    }
};
