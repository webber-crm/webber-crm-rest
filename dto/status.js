module.exports = class StatusDTO {
    _id;

    status;

    status_name;

    constructor(model) {
        const { _id, status, status_name } = model;

        this._id = _id;
        this.status = status;
        this.status_name = status_name;
    }
};
