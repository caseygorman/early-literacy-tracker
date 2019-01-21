import datetime
import time
import itertools
import string
from operator import itemgetter
from flask import (Flask, jsonify, request, session)
from jinja2 import StrictUndefined
from flask_cors import CORS, cross_origin
from flask_restful import  Api, Resource, reqparse
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import jwt
from functools import wraps
from model import Student, Item, StudentItem, StudentTestResult, connect_to_db, db, User
app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
api = Api(app)
app.debug = True
app.config['SECRET_KEY'] = 'super-secret'


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
            current_user = User.query.filter_by(
                public_id=data['public_id']).first()
        except:
            return jsonify({'message': 'Token is invalid'})
        return f(current_user, *args, **kwargs)
    return decorated


@app.route("/api/register", methods=['POST'])
@cross_origin()
def add_user():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    hashed_password = generate_password_hash(password)
    existing_user_name = User.query.filter_by(username=username).first()
    existing_user_email = User.query.filter_by(email=email).first()
    if existing_user_name:
        return jsonify({'error': 'username already in use'})
    if existing_user_email:
        return jsonify({'error': 'email already in use'})
    new_user = User(public_id=str(uuid.uuid4()), username=username, email=email,
                    password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'username': username})


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    auth_user = User.query.filter_by(username=username).first()
    if not auth_user:
        return jsonify({'error': 'user does not exist'})
    if auth_user and check_password_hash(auth_user.password, password.encode('utf-8')):
        token = jwt.encode({'public_id': auth_user.public_id, 'exp': datetime.datetime.utcnow(
        ) + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'])
        return jsonify({'token': token.decode('utf-8'), 'username': auth_user.username})
    else:
        return jsonify({'error': 'incorrect password'})


@app.route("/api/items/<item_type>")
@token_required
def get_items(current_user, item_type):
    user_id = current_user.public_id
    items = Item.query.filter_by(user_id=user_id).filter_by(item_type=item_type).options(
    db.joinedload('studentitems')).filter_by(user_id=user_id).filter_by(item_type=item_type).all()
    item_list =[]
    for item in items:
        count = get_item_student_counts(item)
        unlearned_count = get_unlearned_item_student_counts(item)
        student_list = get_item_student_list(item)[0]
        unlearned_student_list = get_item_student_list(item)[1]
        item = {
            'item_id': item.item_id,
            'item': item.item,
            'count': count,
            'unlearned_count': unlearned_count,
            'students': student_list,
            'unlearned_students':unlearned_student_list
        }
        item_list.append(item)
    return jsonify({
        "items": item_list
        })
def get_item_student_list(item_object):
    student_list = []
    unlearned_student_list =[]
    for item in item_object.studentitems:
        if item.Learned == True:
            student = Student.query.filter_by(student_id=item.student_id).first()
            student_list.append(student.fname + " " + student.lname)
        else:
            student = Student.query.filter_by(student_id=item.student_id).first()
            unlearned_student_list.append(student.fname + " " + student.lname)
    return [student_list, unlearned_student_list]


def get_item_student_counts(item):
    item_id = item.item_id
    items = StudentItem.query.filter(StudentItem.item_id == item_id).filter(
        StudentItem.Learned == True).all()
    return len(items)

def get_unlearned_item_student_counts(item):
    item_id = item.item_id
    items = StudentItem.query.filter(StudentItem.item_id == item_id).filter(
        StudentItem.Learned == False).all()
    return len(items)

 
@app.route("/api/item-detail/<item_type>/<item>")
@token_required
def item_detail(current_user, item_type, item):
    """Display item and students who are learning that item"""
    print("item detail", item, item_type)
    user_id = current_user.public_id
    item_object = Item.query.filter_by(item_id=item, user_id=user_id).first()
    student_items = StudentItem.query.filter_by(
        item_id=item).options(db.joinedload('students')).all()
    student_list = []
    item_detail = {}

    for student in student_items:
        if student.Learned == False:
            student = {
                'student_id': student.students.student_id,
                'fname': student.students.fname,
                'lname': student.students.lname,
                'learned': "no"

            }
            student_list.append(student)

        else:
             student = {
                'student_id': student.students.student_id,
                'fname': student.students.fname,
                'lname': student.students.lname,
                'learned': "yes"
            }

    item_object = {
        'item_id': item_object.item_id,
        'item': item_object.item,
        'date': item_object.date_added,
        'itemType': item_object.item_type
    }
    student_list = sorted(student_list, key=itemgetter('fname')) 
    item_detail['studentList'] = student_list
    item_detail['item'] = item_object
    print("item detail", item_detail)
    return jsonify(item_detail)

@app.route("/api/unassigned-students/<item>")
@token_required
def get_unassigned_students_item(current_user, item):
    """gets students are not assigned to item"""
    user_id = current_user.public_id
    students = StudentItem.query.filter_by(
        item_id=item, user_id=user_id).options(db.joinedload('students')).all()
    student_ids = []
    for student in students:
        student_ids.append(student.student_id)

    unassigned_students = Student.query.filter_by(user_id=user_id).filter(Student.student_id.notin_(student_ids)).all()
    student_list = []

    for student in unassigned_students:
        student = {
            'student_id': student.student_id,
            'student': student.fname + " " + student.lname
            
        }

        student_list.append(student)
    student_list = sorted(student_list, key=itemgetter('student'))
    print("student list", student_list)
    return jsonify([student_list])

@app.route("/api/add-student", methods=['POST'])
@token_required
def add_student(current_user):
    print("current user", current_user)
    data = request.get_json()
    fname = data.get('fname')
    lname = data.get('lname')
    user_id = current_user.public_id
    new_student = Student(user_id=user_id, fname=fname, lname=lname, grade="K")
    db.session.add(new_student)
    db.session.commit()
    return 'student added!'

@app.route("/api/delete-student", methods=['POST'])
@token_required
def delete_student(current_user):
    student_id = request.get_json()
    user_id = current_user.public_id
    student = Student.query.filter_by(
        student_id=student_id, user_id=user_id).first()
    db.session.delete(student)
    db.session.commit()
    return 'student deleted!'

@app.route("/api/add-item", methods=['POST'])
@token_required
def add_item(current_user):
    data = request.get_json()
    items = data['item']
    item_type = data['itemType']
    user_id = current_user.public_id
    table = str.maketrans({key: None for key in string.punctuation})
    new_string = items.translate(table) 
    new_items = new_string.split()
    user_items = Item.query.filter_by(user_id=user_id).filter_by(item_type=item_type).all()
    students = StudentItem.query.filter_by(user_id=user_id).all()
    user_list = [user.item for user in user_items]
    list_to_add = list(set(new_items).difference(user_list))
    db.session.bulk_save_objects(
        [
            Item(
                item=item,
                user_id=user_id,
                item_type=item_type
            )
            for item in list_to_add
        ]
    )    
    db.session.commit()
    return jsonify(data)

@app.route('/api/add-items-to-students', methods=['POST'])
@token_required
def add_items_to_students(current_user):
    print("adding items to students")
    data = request.get_json()
    items = data['studentItems'].get('item')
    table = str.maketrans({key: None for key in string.punctuation})
    new_string = items.translate(table) 
    new_items = new_string.split()
    item_type = data['studentItems'].get('itemType')
    user_id = current_user.public_id
    item_list = Item.query.filter(Item.item.in_(new_items)).filter(Item.user_id == user_id).filter(Item.item_type==item_type).all()
    students = Student.query.filter_by(user_id = user_id).all()
    item_ids = [item.item_id for item in item_list]
    student_ids = [student.student_id for student in students]

    db.session.bulk_save_objects(
        [
            StudentItem(
                item_id=item_id,
                student_id=student_id,
                item_type=item_type,
                user_id=user_id
            )
            for item_id, student_id in itertools.product(item_ids, student_ids)
        ]
    )
    db.session.commit()

# @app.route('/api/add-items-to-student', methods=['POST'])
# @token_required
# def add_items_to_student(current_user):
#     data = request.get_json()
#     data = data.get("studentItems")
#     items = data.get("items")
#     item_type = data.get("itemType")
#     student_id = data.get("student")
#     user_id = current_user.public_id
#     item_list = Item.query.filter(Item.item.in_(items)).filter(Item.user_id == user_id).filter(Item.item_type==item_type).all()
#     item_ids = []
#     for item in item_list:
#         item_ids.append(item.item_id)
#     for item_id in item_ids:
#         new_student_item = StudentItem(
#             item_id=item_id, item_type=item_type,student_id=student_id, user_id=user_id)
#         db.session.add(new_student_item)
#         db.session.commit()

    return "student items added!"

@app.route('/api/add-student-to-item', methods=['POST'])
@token_required
def add_student_to_item(current_user):
    data = request.get_json()
    
    students = data.get("students")
    item_id = data.get("id")
    item_type = data.get("itemType")
    user_id = current_user.public_id
    for student_id in students:
        existing_item = StudentItem.query.filter_by(student_id = student_id, 
        item_id = item_id, user_id = user_id).first()
        if not existing_item:
            new_item_student = StudentItem(
                student_id=student_id, item_id=item_id, user_id=user_id, item_type=item_type)
            db.session.add(new_item_student)
            db.session.commit()
        else:
            continue

    return jsonify(data)


@app.route("/api/students")
@token_required
def get_students(current_user):
    start = time.time()
    user_id = current_user.public_id
    students = Student.query.filter_by(user_id=user_id).options(
        db.joinedload('studentitems')).all()
    student_list = []
    for student in students:
        last_word_test = get_test_dates(student.student_id, "words")
        last_letter_test = get_test_dates(student.student_id, "letters")
        last_sound_test = get_test_dates(student.student_id, "sounds")
        word_count = get_student_item_counts(student.student_id, "words")[0]
        total_word_count = get_student_item_counts(student.student_id, "words")[1]
        letter_count = get_student_item_counts(student.student_id, "letters")[0]
        total_letter_count = get_student_item_counts(student.student_id, "letters")[1]
        sound_count = get_student_item_counts(student.student_id, "sounds")[0]
        total_sound_count = get_student_item_counts(student.student_id, "sounds")[1]
        student = {
            'student_id': student.student_id,
            'fname': student.fname,
            'lname': student.lname,
            'word_count': word_count,
            'total_word_count': total_word_count,
            'last_word_test': last_word_test,
            'letter_count': letter_count,
            'total_letter_count': total_letter_count,
            'last_letter_test': last_letter_test,
            'sound_count': sound_count,
            'total_sound_count': total_sound_count,
            'last_sound_test': last_sound_test
        }
        student_list.append(student)
    end = time.time()
    elapsed_time = end - start
    print(student_list)
    print('getting all students took', elapsed_time)

    return jsonify(student_list)

@token_required
def get_student_item_counts(current_user, student_id, item_type):
    user_id = current_user.public_id
    items = StudentItem.query.filter_by(user_id = user_id, student_id = student_id, item_type = item_type).all()
    learned_count = 0
    total_count = 1
    for item in items:
        if item.Learned == True:
            learned_count +=1
            total_count += 1
        else: 
            total_count += 1 
    
    return [learned_count, total_count]


@app.route("/api/details/<student_id>")
@token_required
def student_detail(current_user, student_id):
    """Show student detail"""
    start = time.time()
    user_id = current_user.public_id
    student_object = Student.query.filter_by(
        student_id=student_id, user_id=user_id).first()
    student_items = StudentItem.query.filter_by(
        student_id=student_id).options(db.joinedload('items')).all()
    student = {
        'student_id': student_object.student_id,
        'fname': student_object.fname,
        'lname': student_object.lname
    }
    word_list = []
    letter_list = []
    sound_list = []
    unlearned_word_list = []
    unlearned_letter_list = []
    unlearned_sound_list = []
    word_test = get_test_dates(student_id, "words")
    letter_test = get_test_dates(student_id, "letters")
    sound_test = get_test_dates(student_id, "sounds")
    student_object = {}
    for item in student_items:
        if item.item_type == "words":
            if item.Learned == True:
                word = {
                    'item_id': item.items.item_id,
                    'item': item.items.item,
                }
                word_list.append(word)
            else:
                unlearned_word = {
                    'item_id': item.items.item_id,
                    'item': item.items.item
                    }
                unlearned_word_list.append(unlearned_word)
        elif item.item_type == "letters":
            if item.Learned == True:
                letter = {
                    'item_id': item.items.item_id,
                    'item': item.items.item,
                }
                letter_list.append(letter)
            else:
                unlearned_letter = {
                    'item_id': item.items.item_id,
                    'item': item.items.item}
                unlearned_letter_list.append(unlearned_letter)

        elif item.item_type == "sounds":
            if item.Learned == True:
                sound = {
                    'item_id': item.items.item_id,
                    'item': item.items.item,
                }
                sound_list.append(sound)
            else:
                unlearned_sound = {
                    'item_id': item.items.item_id,
                    'item': item.items.item}
                unlearned_sound_list.append(unlearned_sound)
    word_count = len(word_list)
    unlearned_word_count = len(unlearned_word_list)
    
    total_words = word_count + unlearned_word_count
    letter_count = len(letter_list)
    unlearned_letter_count = len(unlearned_letter_list)
    total_letters = letter_count + unlearned_letter_count
    sound_count = len(sound_list)
    unlearned_sound_count = len(unlearned_sound_list)
    total_sounds = sound_count + unlearned_sound_count
    student_object['student'] = student
    student_object['wordCount'] = word_count
    student_object['unlearnedWordCount'] = unlearned_word_count
    student_object['totalWordCount'] = total_words
    student_object['wordList'] = word_list
    student_object['unlearnedWordList'] = unlearned_word_list
    student_object['lastWordTest'] = word_test
    student_object['letterCount'] = letter_count
    student_object['unlearnedLetterCount'] = unlearned_letter_count
    student_object['totalLetterCount'] = total_letters
    student_object['letterList'] = letter_list
    student_object['unlearnedLetterList'] = unlearned_letter_list
    student_object['lastLetterTest'] = letter_test
    student_object['soundCount'] = sound_count
    student_object['unlearnedSoundCount'] = unlearned_sound_count
    student_object['totalSoundCount'] = total_sounds
    student_object['soundList'] = sound_list
    student_object['unlearnedSoundList'] = unlearned_sound_list
    student_object['lastSoundTest'] = sound_test
    end = time.time()
    elapsed_time = end - start
    print('getting student detail took', elapsed_time)
    return jsonify(student_object)


@app.route("/api/unassigned-items/<student>/<item_type>")
@token_required
def get_unassigned_items(current_user, student, item_type):
    """gets items that student does not know and are not in current item list, items can then be added to students item list"""
    print("item_type", item_type)
    print("student", student)
    user_id = current_user.public_id
    items = StudentItem.query.filter_by(
        student_id=student, user_id=user_id, item_type=item_type).options(db.joinedload('items')).all()
    item_ids = []
    item_object = {}
    for item in items:
        item_ids.append(item.item_id)

    unassigned_items = Item.query.filter_by(user_id=user_id, item_type=item_type).filter(
        Item.item_id.notin_(item_ids)).all()
    item_list = []

    for item in unassigned_items:
        item = {
            'item_id': item.item_id,
            'item': item.item
        }
        item_list.append(item)
    item_object['itemList'] = item_list
    item_object['itemType'] = item_type
    return jsonify(item_object)

@app.route("/api/create-student-test", methods=["POST"])
@token_required
def create_student_test(current_user):
    """creates new student  test row in db, calls update_correct_items
    and update_incorrect_items functions"""

    data = request.get_json()
    student_test = data.get('studentTest')
    test_type = data.get('testType')
    student_id = data.get('studentId')
    user_id = current_user.public_id
    correct_items = []
    incorrect_items = []

    for entry in student_test:
        if entry['answeredCorrectly']:
            correct_items.append(entry.get('testItems'))
        else:
            incorrect_items.append(entry.get('testItems'))
    update_correct_items(student_id, correct_items, test_type, user_id)
    update_incorrect_items(student_id, incorrect_items, test_type, user_id)
    score = calculate_score(correct_items, incorrect_items)
    db.session.add(StudentTestResult(student_id=student_id, user_id=user_id, score=score,
    correct_items=correct_items, incorrect_items=incorrect_items, test_type=test_type))
    db.session.commit()
    return jsonify({'response': 'student test added!'})

def update_correct_items(student_id, correct_items, test_type, user_id):
    """updates correct items in db, called by create_student_test"""
    student_item_list = StudentItem.query.filter_by(student_id=student_id).filter_by(user_id=user_id).options(db.joinedload('items')).filter(
    Item.item.in_(correct_items)).all()
    for item in student_item_list:
        if item.correct_count >= 1:
            item.Learned = True
        item.correct_count = StudentItem.correct_count + 1
        db.session.commit()
    return "correct items"

def update_incorrect_items(student_id, incorrect_items, test_type, user_id):
    """updates incorrect letters in db, called by create_student_test"""
    student_item_list = StudentItem.query.filter_by(student_id=student_id).filter_by(user_id=user_id).options(db.joinedload('items')).filter(
    Item.item.in_(incorrect_items)).all()
    for item in student_item_list:
        item.incorrect_count = StudentItem.incorrect_count + 1
        db.session.commit()
    return "incorrect items"

def calculate_score(known_items, unknown_items):
    """calculates student test score, called by create_student_test"""
    score = len(known_items) / (len(known_items) + len(unknown_items))
    score = score * 100
    score = int(round(score))
    return score


@app.route("/api/get-test-dates")
@token_required
def get_test_dates(current_user, student, test_type):
    user_id = current_user.public_id
    student_id = student 
    test_type = test_type
    test_dates = StudentTestResult.query.filter_by(user_id=user_id, student_id=student_id, test_type=test_type).all()
    if test_dates != []:
        most_recent = test_dates[-1].test_date
        most_recent = most_recent.strftime("%m-%d-%Y")
    else:
        most_recent = "no tests yet!"
    return most_recent

@app.route("/api/get-student-item-test/<item_type>/<student>")
@token_required
def get_student_item_test(current_user, item_type, student):
    """get list of student test results, word_counts and chart_data"""

    user_id = current_user.public_id
    student_id = student
    student_items = StudentItem.query.filter_by(
        user_id=user_id, student_id=student_id, item_type=item_type).options(db.joinedload('items')).options(db.joinedload('students')).all()
    student_tests = StudentTestResult.query.filter_by(
        student_id=student_id, user_id=user_id, test_type=item_type).all()
    item_counts = get_item_counts(student_items)
    student_test_list = get_student_item_test_list(student_tests)
    learned_items_list = get_learned_items_list(student_items)
    test_data = {'itemCounts': item_counts, 'studentTestList':student_test_list, 'learnedItemList': learned_items_list
    }
    return jsonify(test_data)

def get_item_counts(student_items):
    """is called by get student test, returns word, times read correctly,times read incorrectly """
    item_counts = []
    for student_item in student_items:
        count = {
            "item": student_item.items.item,
            "correctCount": student_item.correct_count,
            "incorrectCount": student_item.incorrect_count
        }
        item_counts.append(count)

    return item_counts

def get_learned_items_list(student_items):
    """is called by get student test, returns list of learned items"""
    learned_items = []
    for student_item in student_items:
        if student_item.Learned == True:
            learned_items.append(student_item.items.item)
    return learned_items


def get_student_item_test_list(student_test):
    """is called by get_student_item_test, returns list of student tests"""
    student_test_list = []
    for student in student_test:
        test_date = student.test_date.strftime('%m-%d-%Y')
        student_test_object = {
            'studentId': student.student_id,
            'score': student.score,
            'testDate': test_date,
            'correctItems': student.correct_items,
            'incorrectItems': student.incorrect_items
        }
        student_test_list.append(student_test_object)
    return student_test_list

# @app.route("/api//student-item-charts/<item_type>/<student>")
# @token_required
# def get_unknown_words_chart(current_user, item_type, student):
#     """gets words that student does not know and are not in current word list, words can then be added to students word list"""
#     user_id = current_user.public_id
#     item_type = item_type
#     items = StudentItem.query.filter_by(
#         student_id=student, user_id=user_id, item_type=item_type).options(db.joinedload('items')).all()
#     item_ids = []

#     for item in items:
#         item_ids.append(item.item_id)

#     unlearned_items = Item.query.filter_by(user_id=user_id).filter(Item.item_id.notin_(item_ids)).all()
#     item_list = []

#     for item in unknown_items:
#         item = {
#             'item_id': item.item_id,
#             'item': item.item
#         }

#         item_list.append(item)
#     return item_list
if __name__ == "__main__":

    app.debug = True
    app.jinja_env.auto_reload = app.debug
    connect_to_db(app)
    app.run(port=5000, host='0.0.0.0')


