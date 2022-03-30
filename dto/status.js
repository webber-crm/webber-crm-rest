module.exports = class StatusDTO {
    id;

    status;

    status_name;

    constructor(model) {
        const { id, status, status_name } = model;

        this.id = id;
        this.status = status;
        this.status_name = status_name;
    }
};
