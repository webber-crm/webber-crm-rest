module.exports = class UserDTO {
    _id;

    email;

    is_active;

    name;

    role;

    constructor(model) {
        const { _id, email, is_active, name, role } = model;

        this._id = _id;
        this.email = email;
        this.is_active = is_active;
        this.name = name;
        this.role = role;
    }
};
