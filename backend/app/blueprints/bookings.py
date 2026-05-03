from flask import Blueprint, jsonify, request

from ..extensions import db
from ..decorators import require_user
from ..errors import NotFoundError, ApiError
from ..models.booking import Booking
from ..models.subsidiary import Subsidiary
from ..schemas.booking import BookingCreateSchema, BookingCancelSchema
from ..services.audit import audit
from ..services.notifier import notify

bp = Blueprint('bookings', __name__, url_prefix='/api/bookings')


@bp.get('')
@require_user
def list_my_bookings(user):
    items = Booking.query.filter_by(user_id=user.id).order_by(Booking.slot_at.desc()).all()
    return jsonify([b.to_dict() for b in items]), 200


@bp.post('')
@require_user
def create_booking(user):
    data = BookingCreateSchema().load(request.get_json() or {})

    if not Subsidiary.query.get(data['subsidiary_id']):
        raise NotFoundError('Дочерняя организация не найдена')

    booking = Booking(
        user_id=user.id,
        subsidiary_id=data['subsidiary_id'],
        office_id=data.get('office_id'),
        service_id=data.get('service_id'),
        slot_at=data['slot_at'],
        duration_minutes=data.get('duration_minutes', 30),
        note=data.get('note'),
        status='pending',
    )
    db.session.add(booking)
    db.session.flush()

    notify(user.id, 'Бронирование создано',
           f'Запись №{booking.id} ожидает подтверждения.',
           type='booking_reminder',
           payload={'booking_id': booking.id})
    audit('booking.create', user_id=user.id,
          resource_type='booking', resource_id=booking.id)
    db.session.commit()
    return jsonify(booking.to_dict()), 201


@bp.post('/<int:booking_id>/cancel')
@require_user
def cancel_booking(user, booking_id):
    booking = Booking.query.get(booking_id)
    if not booking or booking.user_id != user.id:
        raise NotFoundError('Бронирование не найдено')
    if booking.status in ('cancelled', 'completed'):
        raise ApiError('Нельзя отменить', status_code=400, code='already_finalized')

    data = BookingCancelSchema().load(request.get_json() or {})
    booking.status = 'cancelled'
    booking.note = (booking.note or '') + (f'\nОтмена: {data["reason"]}' if data.get('reason') else '')

    audit('booking.cancel', user_id=user.id,
          resource_type='booking', resource_id=booking.id)
    db.session.commit()
    return jsonify(booking.to_dict()), 200
