module.exports = class TaskDTO {
    id;

    title;

    description;

    is_active;

    is_archive;

    author;

    customer;

    status;

    deadline;

    constructor(model) {
        const { id, title, description, is_active, is_archive, author, customer, status, deadline } = model;

        this.id = id;
        this.title = title;
        this.description = description;
        this.is_active = is_active;
        this.is_archive = is_archive;
        this.author = author;
        this.customer = customer;
        this.status = status;
        this.deadline = deadline;
    }
};
