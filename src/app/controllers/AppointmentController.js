import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

import CreateAppointmentService from '../services/CreateAppointmentService';
import CancelAppointmentService from '../services/CancelAppointmentService';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { requestsPerPage = 20 } = req.query;

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        cancelled_at: null,
      },
      order: ['date'],
      limit: requestsPerPage,
      offset: (page - 1) * requestsPerPage,
      attributes: ['id', 'date', 'past', 'cancelable'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const { provider_id, date } = req.body;

    const appointment = await CreateAppointmentService.run({
      provider_id,
      user_id: req.userId,
      date,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await CancelAppointmentService.run({
      appointment_id: req.params.id,
      user_id: req.userId,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
