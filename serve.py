from flask import Flask, abort
from datetime import date
import parse_cal
import parse_cal2
import parse_cal3
import parse_cal4
import json

app = Flask(__name__)


@app.route('/')
def index():
    with open('index.html') as f:
        s = f.read()
    return s

@app.route('/data/<int:timestamp>/<line>')
def data(timestamp, line):
    d = date.fromtimestamp(timestamp/1000)
    if line == 'north':
        if d.weekday() in [5,6]:
            n = parse_cal4.to_json(d, line)
        else:
            n = parse_cal3.to_json(d, line)
        return json.dumps({'lines': [n]})
    elif line == 'south':
        if d.weekday() in [5,6]:
            s = parse_cal2.to_json(d, line)
        else:
            s = parse_cal.to_json(d, line)
        return json.dumps({'lines': [s]})
    elif line == 'all':
        if d.weekday() in [5,6]:
            s = parse_cal2.to_json(d, line)
            n = parse_cal4.to_json(d, line)
        else:
            s = parse_cal.to_json(d, line)
            n = parse_cal3.to_json(d, line)
        return json.dumps({'lines': [n, s]})
    else:
        abort(404)
        return 'nope'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
