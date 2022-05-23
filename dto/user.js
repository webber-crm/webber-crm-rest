module.exports = class UserDTO {
    _id;

    email;

    is_active;

    first_name;

    last_name;

    middle_name;

    role;

    constructor(model) {
        const { _id, email, is_active, first_name, last_name, middle_name, role } = model;

        this._id = _id;
        this.email = email;
        this.is_active = is_active;
        this.first_name = first_name;
        this.last_name = last_name;
        this.middle_name = middle_name;
        this.role = role;
    }
};
