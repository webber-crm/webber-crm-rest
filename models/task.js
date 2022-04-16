const { Schema, model } = require('mongoose');
const CountModel = require('./count');

const task = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: String,
        is_active: {
            type: Boolean,
            default: true,
        },
        is_archive: {
            type: Boolean,
            default: false,
        },
        is_done: {
            type: Boolean,
            default: false,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
        },
        status: {
            type: Schema.Types.ObjectId,
            ref: 'Status',
        },
        num: {
            type: Number,
        },
        deadline: String,
        estimate: Number,
        actually: Number,
        is_fixed_price: Boolean,
        price: Number,
        comments: {
            type: [Schema.Types.ObjectId],
            ref: 'Comments',
        },
    },
    {
        timestamps: true,
        id: true,
    },
);

task.pre('save', function (next) {
    CountModel.findOne({ user: this.author }, null, null, (error, data) => {
        if (data) {
            CountModel.findOneAndUpdate({ user: this.author }, { $inc: { count: 1 } }, (error, counter) => {
                if (error) return next(error);

                this.num = counter.count;
                next();
            });
        } else {
            const count = new CountModel({ user: this.author });
            count.save((error, counter) => {
                if (error) return next(error);

                this.num = counter.count;
                next();
            });
        }
    });
});

module.exports = model('Task', task); // экспортируем модель, передаём схему task
