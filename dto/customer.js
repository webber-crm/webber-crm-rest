module.exports = class CustomerDTO {
    _id;

    name;

    is_active;

    is_archive;

    user;

    service;

    projects;

    price;

    constructor(model) {
        const { _id, name, is_active, is_archive, user, projects, service, price } = model;

        this._id = _id;
        this.name = name;
        this.is_active = is_active;
        this.is_archive = is_archive;
        this.user = user;
        this.projects = projects;
        this.service = service;
        this.price = price;
    }
};
