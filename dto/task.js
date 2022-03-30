module.exports = class TaskDTO {
    id;

    title;

    description;

    time;

    roles;

    is_active;

    customer;

    status;

    constructor(model) {
        const { id, title, description, time, is_active, roles, customer, status } = model;

        this.id = id;
        this.title = title;
        this.description = description;
        this.time = time;
        this.is_active = is_active;
        this.roles = roles;
        this.customer = customer;
        this.status = status;
    }
};
