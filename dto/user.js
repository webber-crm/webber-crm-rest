module.exports = class UserDTO {
    id;

    email;

    username;

    constructor(model) {
        const { id, email, username } = model;

        this.id = id;
        this.email = email;
        this.username = username;
    }
};
