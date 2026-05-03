from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import (
    db, User, Group, GroupMember, GroupPost, PostComment, PostLike,
    ForumTopic, ForumReply
)
from datetime import datetime, timezone
from services.push_service import create_and_push_notification

groups_bp = Blueprint('groups', __name__)


# === ГРУППЫ ===

@groups_bp.route('/all', methods=['GET'])
@jwt_required()
def get_groups():
    """Получить все группы с флагом участия"""
    user_id = int(get_jwt_identity())

    groups = Group.query.all()
    my_group_ids = {row[0] for row in db.session.query(GroupMember.group_id).filter_by(user_id=user_id).all()}

    result = []
    for g in groups:
        d = g.to_dict()
        d['isMember'] = g.id in my_group_ids
        result.append(d)

    return jsonify(result)


@groups_bp.route('/discover', methods=['GET'])
@jwt_required()
def discover_groups():
    """Получить публичные группы для присоединения"""
    user_id = get_jwt_identity()

    # Группы, в которых пользователь НЕ состоит
    my_groups = db.session.query(GroupMember.group_id).filter_by(user_id=user_id)
    groups = Group.query.filter(
        Group.is_public == True,
        ~Group.id.in_(my_groups)
    ).limit(20).all()

    return jsonify([g.to_dict() for g in groups])


@groups_bp.route('/create', methods=['POST'])
@jwt_required()
def create_group():
    """Создать новую группу"""
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('name'):
        return jsonify({'error': 'Название группы обязательно'}), 400

    group = Group(
        name=data['name'],
        description=data.get('description', ''),
        emoji=data.get('emoji', '💪'),
        is_public=data.get('isPublic', True),
        owner_id=user_id
    )
    db.session.add(group)
    db.session.flush()

    # Создатель автоматически становится участником с ролью owner
    member = GroupMember(
        group_id=group.id,
        user_id=user_id,
        role='owner'
    )
    db.session.add(member)
    db.session.commit()

    return jsonify(group.to_dict()), 201


@groups_bp.route('/<int:group_id>', methods=['GET'])
@jwt_required()
def get_group(group_id):
    """Получить информацию о группе"""
    user_id = int(get_jwt_identity())
    group = Group.query.get_or_404(group_id)

    data = group.to_dict(include_members=True)
    data['isMember'] = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first() is not None
    return jsonify(data)


@groups_bp.route('/<int:group_id>', methods=['PUT'])
@jwt_required()
def update_group(group_id):
    """Обновить группу"""
    user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    # Проверяем права (owner или admin)
    member = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()
    if not member or member.role not in ['owner', 'admin']:
        return jsonify({'error': 'Нет прав для редактирования'}), 403

    data = request.get_json()

    if 'name' in data:
        group.name = data['name']
    if 'description' in data:
        group.description = data['description']
    if 'emoji' in data:
        group.emoji = data['emoji']
    if 'isPublic' in data:
        group.is_public = data['isPublic']

    db.session.commit()
    return jsonify(group.to_dict())


@groups_bp.route('/<int:group_id>', methods=['DELETE'])
@jwt_required()
def delete_group(group_id):
    """Удалить группу"""
    user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    # Только владелец может удалить группу
    if group.owner_id != user_id:
        return jsonify({'error': 'Только владелец может удалить группу'}), 403

    db.session.delete(group)
    db.session.commit()

    return jsonify({'message': 'Группа удалена'})


@groups_bp.route('/<int:group_id>/join', methods=['POST'])
@jwt_required()
def join_group(group_id):
    """Присоединиться к группе"""
    user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    if not group.is_public:
        return jsonify({'error': 'Группа закрыта'}), 403

    # Проверяем, не состоит ли уже
    existing = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()
    if existing:
        return jsonify({'error': 'Вы уже участник группы'}), 400

    member = GroupMember(group_id=group_id, user_id=user_id, role='member')
    db.session.add(member)
    db.session.commit()

    return jsonify({'message': 'Вы присоединились к группе'})


@groups_bp.route('/<int:group_id>/leave', methods=['POST'])
@jwt_required()
def leave_group(group_id):
    """Покинуть группу"""
    user_id = get_jwt_identity()

    member = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()
    if not member:
        return jsonify({'error': 'Вы не участник группы'}), 400

    if member.role == 'owner':
        return jsonify({'error': 'Владелец не может покинуть группу. Удалите её или передайте права.'}), 400

    db.session.delete(member)
    db.session.commit()

    return jsonify({'message': 'Вы покинули группу'})


@groups_bp.route('/<int:group_id>/members', methods=['GET'])
@jwt_required()
def get_members(group_id):
    """Получить список участников группы"""
    Group.query.get_or_404(group_id)
    members = GroupMember.query.filter_by(group_id=group_id).all()
    return jsonify([m.to_dict() for m in members])


# === ПОСТЫ ===

@groups_bp.route('/<int:group_id>/posts', methods=['GET'])
@jwt_required()
def get_posts(group_id):
    """Получить посты группы (доступно всем)"""
    user_id = get_jwt_identity()
    Group.query.get_or_404(group_id)

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    posts = GroupPost.query.filter_by(group_id=group_id)\
        .order_by(GroupPost.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'posts': [p.to_dict(user_id) for p in posts.items],
        'total': posts.total,
        'pages': posts.pages,
        'current_page': page
    })


@groups_bp.route('/<int:group_id>/posts', methods=['POST'])
@jwt_required()
def create_post(group_id):
    """Создать пост в группе"""
    user_id = get_jwt_identity()

    # Проверяем, что пользователь участник
    member = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()
    if not member:
        return jsonify({'error': 'Вступите в группу, чтобы писать', 'code': 'NOT_MEMBER'}), 403

    data = request.get_json()

    if not data.get('text') and not data.get('image'):
        return jsonify({'error': 'Пост не может быть пустым'}), 400

    post = GroupPost(
        group_id=group_id,
        user_id=user_id,
        text=data.get('text'),
        image_url=data.get('image'),
        meal_id=data.get('mealId')
    )
    db.session.add(post)
    db.session.commit()

    try:
        author = User.query.get(user_id)
        author_name = author.full_name or author.nickname or 'Пользователь'
        group = Group.query.get(group_id)
        group_name = group.name if group else 'группе'
        members = GroupMember.query.filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id != user_id
        ).all()
        for m in members:
            create_and_push_notification(
                user_id=m.user_id,
                title=f'Новый пост в {group_name}',
                body=f'{author_name}: {(data.get("text") or "")[:80]}',
                category='group',
                related_type='group_post',
                related_id=post.id,
            )
    except Exception as e:
        print(f"[Notification error] group post in {group_name}: {e}")

    return jsonify(post.to_dict(user_id)), 201


@groups_bp.route('/<int:group_id>/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(group_id, post_id):
    """Удалить пост"""
    user_id = get_jwt_identity()
    post = GroupPost.query.get_or_404(post_id)

    # Проверяем права (автор или admin/owner группы)
    member = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()
    if post.user_id != user_id and (not member or member.role not in ['owner', 'admin']):
        return jsonify({'error': 'Нет прав для удаления'}), 403

    db.session.delete(post)
    db.session.commit()

    return jsonify({'message': 'Пост удалён'})


@groups_bp.route('/<int:group_id>/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(group_id, post_id):
    """Лайк/анлайк поста"""
    user_id = get_jwt_identity()

    # Проверяем, что пользователь участник
    member = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()
    if not member:
        return jsonify({'error': 'Вступите в группу, чтобы писать', 'code': 'NOT_MEMBER'}), 403

    post = GroupPost.query.get_or_404(post_id)

    existing_like = PostLike.query.filter_by(post_id=post_id, user_id=user_id).first()
    if existing_like:
        db.session.delete(existing_like)
        action = 'unliked'
    else:
        like = PostLike(post_id=post_id, user_id=user_id)
        db.session.add(like)
        action = 'liked'

    db.session.commit()

    return jsonify({
        'action': action,
        'likes': [l.user_id for l in post.likes]
    })


@groups_bp.route('/<int:group_id>/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(group_id, post_id):
    """Добавить комментарий к посту"""
    user_id = get_jwt_identity()

    # Проверяем, что пользователь участник
    member = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()
    if not member:
        return jsonify({'error': 'Вступите в группу, чтобы писать', 'code': 'NOT_MEMBER'}), 403

    data = request.get_json()
    if not data.get('text'):
        return jsonify({'error': 'Комментарий не может быть пустым'}), 400

    comment = PostComment(
        post_id=post_id,
        user_id=user_id,
        text=data['text'],
        reply_to_id=data.get('replyToId'),
        reply_to_name=data.get('replyToName')
    )
    db.session.add(comment)
    db.session.commit()

    try:
        post = GroupPost.query.get(post_id)
        if post and post.user_id != user_id:
            commenter = User.query.get(user_id)
            commenter_name = commenter.full_name or commenter.nickname or 'Пользователь'
            create_and_push_notification(
                user_id=post.user_id,
                title='Новый комментарий',
                body=f'{commenter_name}: {data["text"][:80]}',
                category='group',
                related_type='comment',
                related_id=comment.id,
            )
    except Exception as e:
        print(f"[Notification error] group comment: {e}")

    return jsonify(comment.to_dict()), 201


# === ФОРУМ ===

@groups_bp.route('/<int:group_id>/topics', methods=['GET'])
@jwt_required()
def get_topics(group_id):
    """Получить темы форума группы (доступно всем)"""
    Group.query.get_or_404(group_id)

    topics = ForumTopic.query.filter_by(group_id=group_id)\
        .order_by(ForumTopic.is_pinned.desc(), ForumTopic.last_activity.desc())\
        .all()

    return jsonify([t.to_dict() for t in topics])


@groups_bp.route('/<int:group_id>/topics', methods=['POST'])
@jwt_required()
def create_topic(group_id):
    """Создать тему форума"""
    user_id = get_jwt_identity()

    # Проверяем, что пользователь участник
    member = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()
    if not member:
        return jsonify({'error': 'Вступите в группу, чтобы писать', 'code': 'NOT_MEMBER'}), 403

    data = request.get_json()

    if not data.get('title') or not data.get('content'):
        return jsonify({'error': 'Заголовок и содержание обязательны'}), 400

    topic = ForumTopic(
        group_id=group_id,
        author_id=user_id,
        title=data['title'],
        content=data['content'],
        category=data.get('category', 'discussion')
    )
    db.session.add(topic)
    db.session.commit()

    return jsonify(topic.to_dict()), 201


@groups_bp.route('/<int:group_id>/topics/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_topic(group_id, topic_id):
    """Получить тему форума (доступно всем)"""
    Group.query.get_or_404(group_id)
    topic = ForumTopic.query.get_or_404(topic_id)
    return jsonify(topic.to_dict())


@groups_bp.route('/<int:group_id>/topics/<int:topic_id>/pin', methods=['POST'])
@jwt_required()
def toggle_pin_topic(group_id, topic_id):
    """Закрепить/открепить тему"""
    user_id = get_jwt_identity()

    # Проверяем права (owner или admin)
    member = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()
    if not member or member.role not in ['owner', 'admin']:
        return jsonify({'error': 'Нет прав для закрепления'}), 403

    topic = ForumTopic.query.get_or_404(topic_id)
    topic.is_pinned = not topic.is_pinned
    db.session.commit()

    return jsonify({'isPinned': topic.is_pinned})


@groups_bp.route('/<int:group_id>/topics/<int:topic_id>/replies', methods=['POST'])
@jwt_required()
def add_reply(group_id, topic_id):
    """Добавить ответ в тему форума"""
    user_id = get_jwt_identity()

    # Проверяем, что пользователь участник
    member = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()
    if not member:
        return jsonify({'error': 'Вступите в группу, чтобы писать', 'code': 'NOT_MEMBER'}), 403

    data = request.get_json()
    if not data.get('content'):
        return jsonify({'error': 'Ответ не может быть пустым'}), 400

    topic = ForumTopic.query.get_or_404(topic_id)

    reply = ForumReply(
        topic_id=topic_id,
        author_id=user_id,
        content=data['content'],
        reply_to_id=data.get('replyToId'),
        reply_to_name=data.get('replyToName')
    )
    db.session.add(reply)

    # Обновляем время последней активности темы
    topic.last_activity = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify(reply.to_dict()), 201


@groups_bp.route('/<int:group_id>/topics/<int:topic_id>', methods=['DELETE'])
@jwt_required()
def delete_topic(group_id, topic_id):
    """Удалить тему форума"""
    user_id = get_jwt_identity()
    topic = ForumTopic.query.get_or_404(topic_id)

    # Проверяем права (автор или admin/owner)
    member = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()
    if topic.author_id != user_id and (not member or member.role not in ['owner', 'admin']):
        return jsonify({'error': 'Нет прав для удаления'}), 403

    db.session.delete(topic)
    db.session.commit()

    return jsonify({'message': 'Тема удалена'})
