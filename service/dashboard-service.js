/**
 * Created by ASTAKHOV A.A. on 28.03.2022
 */

const StatusModel = require('../models/directory/status');
const TaskModel = require('../models/task');

class DashboardService {
    async getHomeTasks(user) {
        const statusNew = await StatusModel.findOne({ status: 'NEW' }).select('_id');

        const tasksLast = await TaskModel.find({ author: user._id, status: { $ne: statusNew } }, '_id, title')
            .sort('-updatedAt')
            .limit(3);
        const tasksNewCount = await TaskModel.find({ author: user._id, status: statusNew }).countDocuments();

        return { list: tasksLast, badge: tasksNewCount };
    }
}

module.exports = new DashboardService();
