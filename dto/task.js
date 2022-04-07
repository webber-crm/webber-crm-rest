module.exports = class TaskDTO {
    id;

    title;

    description;

    is_active;

    author;

    customer;

    status;

    time;

    constructor(model) {
        const { id, title, description, is_active, author, customer, status, time } = model;

        this.id = id;
        this.title = title;
        this.description = description;
        this.is_active = is_active;
        this.author = author;
        this.customer = customer;
        this.status = status;
        this.time = time;
    }
};
