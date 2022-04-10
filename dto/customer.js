module.exports = class TaskDTO {
    _id;

    name;

    is_active;

    user;

    service;

    projects;

    price;

    constructor(model) {
        const { _id, name, is_active, user, projects, service, price } = model;

        this._id = _id;
        this.name = name;
        this.is_active = is_active;
        this.user = user;
        this.projects = projects;
        this.service = service;
        this.price = price;
    }
};
