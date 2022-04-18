module.exports = class TaskDTO {
    _id;

    title;

    description;

    is_active;

    is_archive;

    is_done;

    author;

    customer;

    project;

    status;

    deadline;

    estimate;

    actually;

    is_fixed_price;

    price;

    num;

    constructor(model) {
        const {
            _id,
            title,
            description,
            is_active,
            is_archive,
            is_done,
            author,
            customer,
            project,
            status,
            deadline,
            estimate,
            actually,
            is_fixed_price,
            price,
            num,
        } = model;

        this._id = _id;
        this.title = title;
        this.description = description;
        this.is_active = is_active;
        this.is_archive = is_archive;
        this.is_done = is_done;
        this.author = author;
        this.customer = customer;
        this.project = project;
        this.status = status;
        this.deadline = deadline;
        this.estimate = estimate;
        this.actually = actually;
        this.is_fixed_price = is_fixed_price;
        this.price = price;
        this.num = num;
    }
};
